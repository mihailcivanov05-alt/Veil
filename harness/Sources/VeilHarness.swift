// VeilHarness — a WKWebView test bed for userscripts/veil_shield.user.js.
//
// Injects the userscript at document-start (as the Userscripts extension does),
// mirrors page telemetry from bridge.js to Documents/harness.log, and runs any
// JS dropped into Documents/cmd.js so harness/veil.sh can inspect the live page.
// Hot-reloads when a new Documents/veil_shield.user.js is pushed.
//
// Launch environment (SIMCTL_CHILD_* via veil.sh):
//   VEIL_WORLD        page (default) | content   — JS world for bridge + userscript
//   VEIL_START_URL    first page to load          — default https://www.instagram.com/
//   VEIL_VIEWPORT_H   web viewport height in pt   — default 714 (Safari, iPhone 17 Pro)
//   VEIL_DEBUG        0 keeps the script's DEBUG=false; anything else flips it on

import UIKit
import WebKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {}

@objc(VeilSceneDelegate)
final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession,
               options connectionOptions: UIScene.ConnectionOptions) {
        guard let ws = scene as? UIWindowScene else { return }
        let w = UIWindow(windowScene: ws)
        w.rootViewController = HarnessViewController()
        w.makeKeyAndVisible()
        window = w
    }
}

final class HarnessViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private let env = ProcessInfo.processInfo.environment
    private let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    private var scriptURL: URL { docs.appendingPathComponent("veil_shield.user.js") }
    private var logURL: URL { docs.appendingPathComponent("harness.log") }
    private var cmdURL: URL { docs.appendingPathComponent("cmd.js") }
    private var outURL: URL { docs.appendingPathComponent("cmd.out") }

    private lazy var worldName = env["VEIL_WORLD"] == "content" ? "content" : "page"
    private lazy var world: WKContentWorld = worldName == "content" ? .defaultClient : .page
    private lazy var startURL = URL(string: env["VEIL_START_URL"] ?? "") ?? URL(string: "https://www.instagram.com/")!
    private lazy var viewportTarget = CGFloat(Double(env["VEIL_VIEWPORT_H"] ?? "") ?? 714)

    private var webView: WKWebView!
    private let bar = UIView()
    private let pathLabel = UILabel()
    private var barHeight: NSLayoutConstraint!
    private var scriptStamp: Date?
    private var log: FileHandle?

    private static let clock: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "HH:mm:ss.SSS"
        return f
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        openLog()

        let cfg = WKWebViewConfiguration()
        cfg.websiteDataStore = .default()                         // persistent: the IG login survives relaunches
        cfg.allowsInlineMediaPlayback = true                      // Safari on iPhone plays inline
        cfg.mediaTypesRequiringUserActionForPlayback = .audio     // muted autoplay, like Safari
        // Present as Mobile Safari rather than an in-app browser, so IG serves the same mobile web.
        cfg.applicationNameForUserAgent = "Version/27.0 Mobile/15E148 Safari/604.1"
        cfg.userContentController.add(self, contentWorld: world, name: "veil")

        webView = WKWebView(frame: .zero, configuration: cfg)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.isInspectable = true                              // Mac Safari → Develop → Simulator
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        buildBar()
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: bar.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        installScripts()
        webView.load(URLRequest(url: startURL))
        Timer.scheduledTimer(timeInterval: 0.3, target: self, selector: #selector(tick), userInfo: nil, repeats: true)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // The bar stands in for Safari's toolbar and is sized so the web viewport
        // matches Safari's height: the shield's video detection is viewport-relative.
        let h = view.bounds.height - view.safeAreaInsets.top - viewportTarget
        barHeight.constant = max(view.safeAreaInsets.bottom + 44, h)
    }

    // MARK: - Scripts

    private func installScripts() {
        let ucc = webView.configuration.userContentController
        ucc.removeAllUserScripts()
        scriptStamp = mtime(scriptURL)

        let pushed = try? String(contentsOf: scriptURL, encoding: .utf8)
        var src = pushed ?? bundled("veil_shield.user") ?? ""
        if env["VEIL_DEBUG"] != "0" {
            src = src.replacingOccurrences(of: "const DEBUG = false;", with: "const DEBUG = true;")
        }
        // bridge.js first, same world, so it sees the userscript's console + window.__VEIL.
        ucc.addUserScript(WKUserScript(source: bundled("bridge") ?? "", injectionTime: .atDocumentStart,
                                       forMainFrameOnly: true, in: world))
        ucc.addUserScript(WKUserScript(source: matchGuarded(src), injectionTime: .atDocumentStart,
                                       forMainFrameOnly: true, in: world))
        record(["type": "inject", "world": worldName, "bytes": src.utf8.count,
                "source": pushed == nil ? "bundled" : "pushed"])
    }

    /// WKUserScript runs on every page; the extension only runs on @match URLs. Mirror that.
    private func matchGuarded(_ src: String) -> String {
        let patterns = src.split(separator: "\n").compactMap { line -> String? in
            let t = line.trimmingCharacters(in: .whitespaces)
            guard t.hasPrefix("// @match") else { return nil }
            return t.dropFirst("// @match".count).trimmingCharacters(in: .whitespaces)
        }
        guard !patterns.isEmpty else { return src }
        let tests = patterns.map { p -> String in
            let re = "^" + NSRegularExpression.escapedPattern(for: p).replacingOccurrences(of: "\\*", with: ".*") + "$"
            let lit = (try? JSONSerialization.data(withJSONObject: re, options: .fragmentsAllowed))
                .flatMap { String(data: $0, encoding: .utf8) } ?? "\"^$\""
            return "new RegExp(\(lit))"
        }
        return "if ([\(tests.joined(separator: ", "))].some((r) => r.test(location.href))) {\n\(src)\n}"
    }

    private func bundled(_ name: String) -> String? {
        Bundle.main.url(forResource: name, withExtension: "js").flatMap { try? String(contentsOf: $0, encoding: .utf8) }
    }

    @objc private func tick() {
        if mtime(scriptURL) != scriptStamp {
            installScripts()
            webView.reload()
        }

        guard let js = try? String(contentsOf: cmdURL, encoding: .utf8) else { return }
        try? FileManager.default.removeItem(at: cmdURL)
        let body = "const __r = await (async () => {\n\(js)\n})();\nreturn JSON.stringify(__r === undefined ? null : __r);"
        webView.callAsyncJavaScript(body, arguments: [:], in: nil, in: world) { [weak self] result in
            guard let self else { return }
            let out: String
            switch result {
            case .success(let v):
                out = (v as? String) ?? "null"
            case .failure(let e):
                let ns = e as NSError
                out = "ERROR: " + ((ns.userInfo["WKJavaScriptExceptionMessage"] as? String) ?? ns.localizedDescription)
            }
            try? Data(out.utf8).write(to: self.outURL, options: .atomic)
        }
    }

    // MARK: - Telemetry

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let m = message.body as? [String: Any] else { return }
        record(m)
        if m["type"] as? String == "state" { updateBar() }
    }

    private func openLog() {
        FileManager.default.createFile(atPath: logURL.path, contents: nil)   // fresh log per launch
        log = try? FileHandle(forWritingTo: logURL)
        record(["type": "launch", "world": worldName, "start": startURL.absoluteString,
                "viewportTarget": Double(viewportTarget)])
    }

    private func record(_ obj: [String: Any]) {
        var o = obj
        o["ts"] = Self.clock.string(from: Date())
        guard JSONSerialization.isValidJSONObject(o),
              let data = try? JSONSerialization.data(withJSONObject: o, options: [.sortedKeys]) else { return }
        try? log?.write(contentsOf: data + Data([0x0A]))
    }

    private func mtime(_ url: URL) -> Date? {
        (try? FileManager.default.attributesOfItem(atPath: url.path))?[.modificationDate] as? Date
    }

    // MARK: - Bar

    private func buildBar() {
        bar.backgroundColor = UIColor(white: 0.08, alpha: 1)
        bar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bar)

        func button(_ symbol: String, _ action: Selector) -> UIButton {
            let b = UIButton(type: .system)
            b.setImage(UIImage(systemName: symbol), for: .normal)
            b.tintColor = .white
            b.addTarget(self, action: action, for: .touchUpInside)
            b.widthAnchor.constraint(equalToConstant: 40).isActive = true
            return b
        }
        pathLabel.textColor = UIColor(white: 0.7, alpha: 1)
        pathLabel.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        pathLabel.lineBreakMode = .byTruncatingMiddle
        pathLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)

        let stack = UIStackView(arrangedSubviews: [
            button("chevron.backward", #selector(goBack)),
            pathLabel,
            button("house", #selector(goHome)),
            button("arrow.clockwise", #selector(reload)),
        ])
        stack.axis = .horizontal
        stack.alignment = .center
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        bar.addSubview(stack)

        barHeight = bar.heightAnchor.constraint(equalToConstant: 98)
        NSLayoutConstraint.activate([
            bar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bar.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            barHeight,
            stack.leadingAnchor.constraint(equalTo: bar.leadingAnchor, constant: 8),
            stack.trailingAnchor.constraint(equalTo: bar.trailingAnchor, constant: -8),
            stack.topAnchor.constraint(equalTo: bar.topAnchor, constant: 6),
            stack.heightAnchor.constraint(equalToConstant: 36),
        ])
    }

    private func updateBar() {
        pathLabel.text = worldName + " · " + (webView.url?.path ?? "")
    }

    @objc private func goBack() { webView.goBack() }
    @objc private func goHome() { webView.load(URLRequest(url: startURL)) }
    @objc private func reload() { webView.reload() }

    // MARK: - Navigation

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let scheme = navigationAction.request.url?.scheme ?? ""
        if ["http", "https", "about", "blob", "data"].contains(scheme) {
            decisionHandler(.allow)
        } else {
            // instagram://, itms-apps:// … — "open in app" attempts; Safari would prompt, we just log.
            record(["type": "blockedScheme", "url": navigationAction.request.url?.absoluteString ?? ""])
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        record(["type": "nav", "url": webView.url?.absoluteString ?? ""])
        updateBar()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        record(["type": "navError", "error": error.localizedDescription])
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        record(["type": "navError", "error": error.localizedDescription])
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        record(["type": "webProcessCrash"])
        webView.reload()
    }

    // MARK: - UI delegate (no blocking dialogs: log and auto-answer)

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        webView.load(navigationAction.request)   // target=_blank / window.open → same view
        return nil
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        record(["type": "alert", "msg": message])
        completionHandler()
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        record(["type": "confirm", "msg": message])
        completionHandler(true)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        record(["type": "prompt", "msg": prompt])
        completionHandler(defaultText)
    }
}
