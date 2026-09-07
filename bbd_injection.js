const BBD2_CSS = `/* broken by design. ---------------------------------------------------- */
.bbd2 { position: relative; width: 100%; overflow: hidden; isolation: isolate; background: #030407; perspective: 1250px; container-type: inline-size; font-family: 'Space Grotesk', 'Archivo Black', system-ui, sans-serif; user-select: none; }
.bbd2-bg { position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 62% 50% at 50% 42%, rgba(125, 150, 200, 0.08), transparent 62%), radial-gradient(ellipse 100% 80% at 50% 118%, rgba(45, 55, 90, 0.18), transparent 60%), #030407; }
.bbd2-stage { position: absolute; inset: 6% 4.5%; }
.bbd2-title, .bbd2-slice { position: absolute; display: grid; place-items: center; pointer-events: none; white-space: nowrap; font-weight: 700; font-size: clamp(26px, 10cqw, 190px); letter-spacing: -0.035em; line-height: 1; }
.bbd2-title { inset: 0; z-index: 1; opacity: 0; animation: bbd2-cracks-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.bbd2-title--under span, .bbd2-title--under .bbd2-stack { color: rgba(188, 198, 220, 0.24); }
.bbd2--portrait .bbd2-title, .bbd2--portrait .bbd2-slice { font-size: clamp(44px, 20cqw, 190px); }
.bbd2-stack { display: flex; flex-direction: column; align-items: center; gap: 0.08em; transform: rotate(-8deg); line-height: 0.92; }
.bbd2-stack em { font-style: normal; display: block; }
.bbd2-stack em:nth-child(2) { font-size: 0.44em; align-self: flex-end; margin-right: 8%; opacity: 0.85; }
.bbd2-cracks { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; opacity: 0; animation: bbd2-cracks-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes bbd2-cracks-in { to { opacity: 1; } }
.bbd2-cracks path { fill: none; vector-effect: non-scaling-stroke; }
.bbd2-cracks-line path { stroke: rgba(198, 214, 244, 0.34); stroke-width: 1; }
.bbd2-cracks-glow path { stroke: rgba(170, 195, 240, 0.10); stroke-width: 2.6; }
.bbd2-cracks-fine path { stroke: rgba(198, 214, 244, 0.17); stroke-width: 0.75; }
.bbd2-pane { position: absolute; inset: 0; z-index: 5; transform-style: preserve-3d; pointer-events: none; }
.bbd2-shard { position: absolute; transform-origin: 50% 50%; pointer-events: auto; will-change: transform; transition: filter 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
.bbd2-shard--hot { z-index: 40 !important; filter: brightness(1.22) drop-shadow(0 42px 54px rgba(0, 0, 0, 0.72)) drop-shadow(0 0 30px rgba(150, 185, 255, 0.18)); }
.bbd2-inlay { position: absolute; inset: 0; overflow: hidden; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; pointer-events: none; }
.bbd2-glassimg { position: absolute; inset: 0; background-size: 100% 100%; background-repeat: no-repeat; }
.bbd2-glassimg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(132deg, rgba(165, 185, 232, 0.13) 0%, rgba(165, 185, 232, 0.03) 30%, transparent 46%, transparent 60%, rgba(112, 96, 178, 0.08) 100%); mix-blend-mode: screen; }
.bbd2-slice > span, .bbd2-slice > .bbd2-stack { color: rgba(222, 232, 252, 0.52); mix-blend-mode: screen; filter: blur(0.3px); transform: var(--jt); text-shadow: 0 0 12px rgba(165, 195, 250, 0.22); }
.bbd2-slice > .bbd2-stack { transform: var(--jt) rotate(-8deg); }
.bbd2-specular { position: absolute; inset: 0; opacity: 0; background: radial-gradient(42% 42% at var(--mx, 50%) var(--my, 50%), rgba(205, 225, 255, 0.34), rgba(140, 170, 230, 0.08) 46%, transparent 72%); mix-blend-mode: screen; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.bbd2-shard--hot .bbd2-specular { opacity: 1; }
`;

const MOBILE = [
  { id: 'mobile-01a', x: 51.817, y: 3.633, w: 39.625, h: 22.343, cx: 71.45, cy: 14.78, ring: 2 },
  { id: 'mobile-01b', x: 7.972, y: 4.338, w: 60.258, h: 19.469, cx: 38.39, cy: 14.13, ring: 2 },
  { id: 'mobile-01c', x: 59.789, y: 3.958, w: 13.013, h: 5.369, cx: 66.3, cy: 6.81, ring: 2 },
  { id: 'mobile-02a', x: 7.034, y: 19.36, w: 36.811, h: 34.111, cx: 25.44, cy: 36.36, ring: 0 },
  { id: 'mobile-02b', x: 10.082, y: 18.872, w: 48.886, h: 24.024, cx: 34.23, cy: 30.99, ring: 0 },
  { id: 'mobile-03a', x: 10.316, y: 69.685, w: 35.287, h: 13.178, cx: 27.84, cy: 76.36, ring: 1 },
  { id: 'mobile-03b', x: 9.144, y: 73.59, w: 60.844, h: 22.397, cx: 39.62, cy: 84.6, ring: 1 },
  { id: 'mobile-04a', x: 8.91, y: 55.965, w: 67.057, h: 22.56, cx: 42.38, cy: 67.14, ring: 0 },
  { id: 'mobile-04b', x: 13.834, y: 52.603, w: 56.389, h: 11.714, cx: 41.79, cy: 58.6, ring: 0 },
  { id: 'mobile-04c', x: 42.556, y: 56.508, w: 47.831, h: 13.503, cx: 66.0, cy: 63.31, ring: 0 },
  { id: 'mobile-05a', x: 63.54, y: 11.985, w: 29.426, h: 14.479, cx: 78.43, cy: 19.28, ring: 1 },
  { id: 'mobile-05b', x: 57.796, y: 16.595, w: 34.584, h: 28.145, cx: 75.03, cy: 30.56, ring: 1 },
  { id: 'mobile-06a', x: 61.313, y: 71.529, w: 26.495, h: 24.403, cx: 74.68, cy: 83.73, ring: 2 },
  { id: 'mobile-06b', x: 76.905, y: 67.462, w: 14.42, h: 18.113, cx: 83.76, cy: 76.57, ring: 2 },
  { id: 'mobile-07a', x: 32.474, y: 46.312, w: 54.396, h: 10.521, cx: 58.97, cy: 51.44, ring: 0 },
  { id: 'mobile-07b', x: 43.494, y: 37.961, w: 48.3, h: 18.872, cx: 67.53, cy: 47.37, ring: 0 }
];

const ATLAS_RECTS = {
  'mobile-01a': [523, 1496, 338, 412],
  'mobile-01b': [2, 1911, 514, 359],
  'mobile-01c': [468, 3091, 111, 99],
  'mobile-02a': [2, 2, 314, 629],
  'mobile-02b': [2, 633, 417, 443],
  'mobile-03a': [412, 2622, 301, 243],
  'mobile-03b': [2, 1496, 519, 413],
  'mobile-04a': [2, 1078, 572, 416],
  'mobile-04b': [2, 2873, 481, 216],
  'mobile-04c': [2, 2622, 408, 249],
  'mobile-05a': [541, 2272, 251, 267],
  'mobile-05b': [318, 2, 295, 519],
  'mobile-06a': [615, 2, 226, 450],
  'mobile-06b': [416, 2272, 123, 334],
  'mobile-07a': [2, 3091, 464, 194],
  'mobile-07b': [2, 2272, 412, 348],
};

const CRACKS = {
  main: ["M579 81L594 81", "M609 1745L596 1754L570 1762", "M610 1744L605 1710L518 1517L505 1465", "M489 691L508 709L684 822L725 835", "M576 82L561 82", "M265 925L272 965", "M751 1230L763 1210L767 1195L769 1121L766 1102L748 1079L742 1059", "M162 106L147 106", "M491 626L501 636L509 634", "M750 1231L725 1236L691 1257L527 1455L505 1465", "M527 84L541 84", "M75 165L72 285L78 313L87 322L93 336", "M528 638L570 492L591 482L605 448L717 314L734 303L748 299", "M164 105L508 86", "M524 85L510 85", "M769 1256L764 1242L751 1231", "M596 80L609 80", "M742 1058L767 1043L778 1008", "M787 251L770 615L755 787L748 812L726 835", "M611 80L625 79", "M748 1547L742 1623", "M513 521L508 562L494 588", "M769 1258L772 1272", "M423 694L428 663L448 610L468 595L493 589", "M773 120L775 177L767 212", "M709 782L714 773L754 306L750 299", "M424 695L488 691", "M218 956L228 937L240 930L264 925", "M544 83L559 83", "M423 696L415 709L363 849L349 862L279 903L270 912L265 924", "M488 490L470 486L459 479L362 389L124 339L94 337", "M130 1273L172 1276L370 1316L471 1446L482 1456L505 1465", "M217 957L184 967L143 994L127 998", "M489 491L499 512L513 520", "M514 520L525 509L527 480", "M490 626L484 648L488 690", "M379 1762L188 1762", "M127 998L121 992L104 990L84 975L80 961L66 401", "M127 998L119 1018L84 1043L78 1082L89 1233L106 1256L122 1263L129 1272", "M527 659L528 639", "M494 589L490 625", "M741 1058L273 966", "M778 988L776 897L768 872", "M708 782L687 777L532 677L527 660", "M527 480L549 450L740 227L749 219L767 212", "M527 480L498 484L490 490", "M767 871L734 851L726 836", "M218 957L228 964L259 968L271 966", "M70 412L70 402L66 401", "M527 638L510 634", "M611 1745L627 1753L654 1760L694 1761", "M84 1703L92 1326L96 1310L106 1297L122 1285L129 1273", "M93 338L76 353L65 386", "M749 298L761 263L759 252L763 242", "M767 212L780 225L787 245"],
  fine: ["M761 1403L761 1411", "M703 74L711 74", "M741 1635L741 1625", "M772 1287L772 1283", "M65 390L66 401", "M695 75L683 75", "M759 1426L759 1434", "M753 1492L753 1501", "M737 1679L737 1673", "M758 1445L758 1437", "M765 1359L765 1367", "M738 1668L738 1661", "M763 1389L763 1381", "M768 1333L768 1329", "M749 1536L749 1545", "M735 1702L735 1696", "M723 1746L719 1750", "M630 78L640 78", "M754 1489L754 1481", "M659 77L648 77", "M769 1322L769 1317", "M760 1422L760 1415", "M752 1503L752 1512", "M766 1355L766 1350", "M389 1762L384 1762", "M733 1715L733 1724", "M755 1471L755 1478", "M771 1299L771 1294", "M665 76L672 76", "M132 107L137 107", "M514 657L526 660", "M751 1515L751 1523", "M509 633L512 622", "M760 96L753 92", "M756 1459L756 1467", "M764 1378L764 1370", "M767 1340L767 1344", "M750 1534L750 1526", "M710 787L709 783", "M736 1690L736 1682", "M762 1400L762 1393", "M91 1738L100 1747", "M734 1704L734 1713", "M770 1306L770 1310", "M740 1637L740 1646", "M739 1648L739 1657", "M757 1456L757 1449"]
};

const BASE_POSE = {
  'mobile-07a': { rx: 2.8, ry: -3.6, tz: 18 },
  'mobile-01b': { rx: -2, ry: 2.6, tz: 10 },
};

function jitter(seed) {
  const r = n => { const s = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453; return s - Math.floor(s); };
  return { tx: (r(1) - 0.5) * 14, ty: (r(2) - 0.5) * 10, rot: (r(3) - 0.5) * 2.4 };
}

function baseOf(id, seed) {
  const r = n => { const s = Math.sin(seed * 91.7 + n * 269.5) * 43758.5453; return s - Math.floor(s); };
  return { rx: (r(1) - 0.5) * 3.4, ry: (r(2) - 0.5) * 4.2, tz: r(3) * 16, px: 0, py: 0, sc: 1, ...(BASE_POSE[id] || {}) };
}

function toTransform(s) {
  return `translate3d(${s.px.toFixed(2)}px, ${s.py.toFixed(2)}px, ${s.tz.toFixed(2)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) scale(${s.sc.toFixed(4)})`;
}

function spriteStyle(id) {
  const r = ATLAS_RECTS[id], sx = r[0], sy = r[1], fw = r[2], fh = r[3];
  const sizeX = (900 / fw) * 100, sizeY = (3287 / fh) * 100;
  const posX = 900 > fw ? (sx / (900 - fw)) * 100 : 0;
  const posY = 3287 > fh ? (sy / (3287 - fh)) * 100 : 0;
  return { size: sizeX.toFixed(3) + '% ' + sizeY.toFixed(3) + '%', pos: posX.toFixed(3) + '% ' + posY.toFixed(3) + '%' };
}

window.showBrokenGlass = function(container) {
  container.innerHTML = '';
  const style = document.createElement('style');
  style.textContent = BBD2_CSS;
  container.appendChild(style);

  const bbd = document.createElement('div');
  bbd.className = 'bbd2 bbd2--portrait bbd2--ready';
  bbd.style.height = '100%';
  
  let cracksHtml = `<svg class="bbd2-cracks" viewBox="0 0 853 1844" preserveAspectRatio="none">
    <g class="bbd2-cracks-glow">${CRACKS.main.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="bbd2-cracks-line">${CRACKS.main.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="bbd2-cracks-fine">${CRACKS.fine.map(d => `<path d="${d}"/>`).join('')}</g>
  </svg>`;

  let shardsHtml = '';
  const atlasUrl = 'https://cdn.jsdelivr.net/gh/gughigug/broken-by-design-assets@main/atlas-mobile.png';
  
  MOBILE.forEach((p, i) => {
    const j = jitter(i + 1);
    const sprite = spriteStyle(p.id);
    const b = baseOf(p.id, i + 1);
    shardsHtml += `
     <div class="bbd2-shard" style="left:${p.x}%; top:${p.y}%; width:${p.w}%; height:${p.h}%; z-index:${10+(2-p.ring)}; transform:${toTransform(b)};">
       <div class="bbd2-inlay" style="-webkit-mask-image:url(${atlasUrl}); mask-image:url(${atlasUrl}); -webkit-mask-size:${sprite.size}; mask-size:${sprite.size}; -webkit-mask-position:${sprite.pos}; mask-position:${sprite.pos};">
         <div class="bbd2-glassimg" style="background-image:url(${atlasUrl}); background-size:${sprite.size}; background-position:${sprite.pos};"></div>
         <div class="bbd2-slice" style="width:${10000/p.w}%; height:${10000/p.h}%; left:${-(p.x/p.w)*100}%; top:${-(p.y/p.h)*100}%; --jt:translate(${j.tx.toFixed(1)}px, ${j.ty.toFixed(1)}px) rotate(${j.rot.toFixed(2)}deg);">
           <span class="bbd2-stack" style="transform: rotate(-8deg); display:flex; flex-direction:column; align-items:center; line-height:0.9;">
             <em>SCROLL</em>
             <em style="color:#ef4444; font-size:0.5em; text-shadow:0 0 20px rgba(239,68,68,0.5); opacity:0.85; align-self:flex-end; margin-right:8%;">BLOCKED</em>
           </span>
         </div>
         <div class="bbd2-specular"></div>
       </div>
     </div>`;
  });

  bbd.innerHTML = `
    <div class="bbd2-bg" aria-hidden="true"></div>
    <div class="bbd2-stage">
      <div class="bbd2-title bbd2-title--under" aria-hidden="true">
         <span class="bbd2-stack" style="transform: rotate(-8deg); display:flex; flex-direction:column; align-items:center; line-height:0.9;">
           <em>SCROLL</em>
           <em style="color:rgba(239,68,68,0.3); font-size:0.5em; opacity:0.85; align-self:flex-end; margin-right:8%;">BLOCKED</em>
         </span>
      </div>
      ${cracksHtml}
      <div class="bbd2-pane" aria-hidden="true">${shardsHtml}</div>
    </div>
    <button onclick="exitReel()" class="pressable" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); padding: 8px 20px; background: var(--accent); color: #000; font-size: 10px; font-weight: 700; border: none; border-radius: 100px; cursor: pointer; text-transform: uppercase; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">Back to Feed</button>
  `;

  container.appendChild(bbd);

  // Entrance animation
  const shards = Array.from(bbd.querySelectorAll('.bbd2-shard'));
  shards.forEach((el, i) => {
    const p = MOBILE[i];
    const rest = toTransform(baseOf(p.id, i + 1));
    const dx = p.cx - 50, dy = p.cy - 50;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;
    
    el.animate([
       { opacity: 0, transform: `translate3d(${ux*110}px, ${uy*110}px, 280px) rotateX(${uy*-12}deg) rotateY(${ux*12}deg)`, filter: 'brightness(2) blur(2px)' },
       { opacity: 1, transform: rest, filter: 'brightness(1) blur(0px)', offset: 0.72 },
       { opacity: 1, transform: rest, filter: 'none' }
    ], { duration: 1400, delay: 180, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
};
