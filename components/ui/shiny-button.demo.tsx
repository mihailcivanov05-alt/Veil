import { ShinyButton } from "@/components/ui/shiny-button"

export default function ShinyButtonDemo() {
  return (
    <div
      style={{ background: "#05070a", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center gap-6"
    >
      <ShinyButton onClick={() => alert("Button clicked!")}>Get unlimited access</ShinyButton>
      <ShinyButton solid onClick={() => alert("Sent")}>Send Money</ShinyButton>
    </div>
  )
}
