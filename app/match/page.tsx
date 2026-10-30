import type { Metadata } from "next";
import MatchWizard from "@/components/MatchWizard";
export const metadata: Metadata = { title: "Haz match", description: "Cuatro preguntas sobre cómo vives y te enseñamos, uno a uno, los perros que encajan contigo. La protectora valora cada caso." };
export default function Match() {
  return (
    <main className="wrap mlayout" style={{ paddingBlock: "clamp(28px,4vw,56px) 100px" }}>
      <div className="mwrap" style={{ padding: 0 }}><MatchWizard /></div>
      <aside className="vphone" aria-hidden="true"><div className="scr"><img src="/img/lasa/4e6a6901.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /><div className="cap"><b>Del match a casa</b>Con la protectora delante y sin prisa.</div></div></aside>
    </main>
  );
}
