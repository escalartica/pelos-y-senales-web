"use client";
import { useState } from "react";
import { useLife, toast } from "@/lib/store";
import type { Life } from "@/lib/orient";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="chip" aria-pressed={on} onClick={onClick}>{children}</button>;
}
export default function LifestylePanel() {
  const { life, setLife, reset } = useLife();
  const [mail, setMail] = useState(""); const [busy, setBusy] = useState(false);
  const one = <K extends "casa" | "tiempo" | "exp">(k: K, v: NonNullable<Life[K]>) => setLife({ ...life, [k]: life[k] === v ? null : v });
  const conv = (v: Life["conv"][number]) => setLife({ ...life, conv: life.conv.includes(v) ? life.conv.filter((x) => x !== v) : [...life.conv, v] });
  return (
    <aside className="panel" aria-label="Cuéntanos cómo vives">
      <h2>Cuéntanos cómo vives</h2>
      <p>Opcional. Con esto señalamos afinidades y avisos en cada ficha, con palabras y no con una nota. Orientan; la protectora valora cada caso.</p>
      <div className="group"><label>Dónde vives</label><div className="chips"><Chip on={life.casa === "piso"} onClick={() => one("casa", "piso")}>Piso</Chip><Chip on={life.casa === "patio"} onClick={() => one("casa", "patio")}>Casa con patio</Chip></div></div>
      <div className="group"><label>Tiempo para pasear</label><div className="chips"><Chip on={life.tiempo === "poco"} onClick={() => one("tiempo", "poco")}>Poco</Chip><Chip on={life.tiempo === "normal"} onClick={() => one("tiempo", "normal")}>Normal</Chip><Chip on={life.tiempo === "mucho"} onClick={() => one("tiempo", "mucho")}>Mucho</Chip></div></div>
      <div className="group"><label>En casa hay</label><div className="chips"><Chip on={life.conv.includes("ninos")} onClick={() => conv("ninos")}>Niños</Chip><Chip on={life.conv.includes("perros")} onClick={() => conv("perros")}>Otros perros</Chip><Chip on={life.conv.includes("gatos")} onClick={() => conv("gatos")}>Gatos</Chip></div></div>
      <div className="group"><label>Experiencia</label><div className="chips"><Chip on={life.exp === "primero"} onClick={() => one("exp", "primero")}>Es mi primer perro</Chip><Chip on={life.exp === "veterano"} onClick={() => one("exp", "veterano")}>Ya he tenido</Chip></div></div>
      <button className="reset" type="button" onClick={reset}>Borrar mis respuestas</button>
      <div className="alert">
        <label htmlFor="alert-mail">Avísame cuando entre un perro que encaje</label>
        <div className="in"><input id="alert-mail" type="email" placeholder="tu@correo.es" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} /><button type="button" disabled={busy} onClick={async () => { if (!mail.includes("@")) { toast("Escribe un correo para avisarte."); return; } setBusy(true); try { const r = await fetch("/api/alerta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: mail, life }) }); const j = await r.json(); toast(r.ok ? (j.simulated ? "Te hemos enviado un correo para confirmar la alerta (simulado en pruebas)." : "Te hemos enviado un correo: confirma el enlace y queda activada.") : (j.error || "No se pudo activar la alerta.")); if (r.ok) setMail(""); } catch { toast("No se pudo activar la alerta. Prueba de nuevo."); } setBusy(false); }}>{busy ? "Enviando…" : "Avisarme"}</button></div>
      </div>
    </aside>
  );
}
