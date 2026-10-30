"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { label, fmtFecha, type Aviso } from "@/lib/perdidos";

export default function GestionarAviso() {
  const t = useSearchParams().get("t") || "";
  const [a, setA] = useState<Aviso | null>(null); const [estado, setEstado] = useState(""); const [msg, setMsg] = useState("Cargando tu aviso…"); const [busy, setBusy] = useState(false);
  const call = async (accion: string) => {
    const r = await fetch("/api/avisos/gestionar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ t, accion }) });
    return { ok: r.ok, j: await r.json().catch(() => ({})) };
  };
  useEffect(() => { call("ver").then(({ ok, j }) => { if (ok) { setA(j.aviso); setEstado(j.estado); setMsg(""); } else setMsg(j.error || "No se ha podido cargar el aviso."); }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);
  const act = async (accion: "encasa" | "retirar") => {
    setBusy(true); const { ok, j } = await call(accion); setBusy(false);
    if (!ok) { setMsg(j.error || "No se pudo hacer el cambio."); return; }
    if (accion === "retirar") { setA(null); setMsg("Aviso retirado. Ya no aparece en el mapa."); } else { setMsg("Qué alegría. Lo hemos marcado como «ya está en casa»; seguirá visible unos días y luego desaparecerá solo."); setA((x) => x && { ...x, resuelto: new Date().toISOString() }); }
  };
  return (
    <div style={{ maxWidth: 640 }}>
      {msg && <p className="lead" role="status">{msg}</p>}
      {a && <div className="form" style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>{a.tipo === "perdido" ? `Se busca: ${a.nombre}` : "Perro visto suelto"}</h2>
        <p className="small">{label(a)} · {a.lugar} ({a.ciudad}) · {fmtFecha(a.fecha)}</p>
        {estado === "pendiente" && <p className="small">Todavía no está publicado: pulsa el enlace «Publicar el aviso» del correo que te enviamos.</p>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          {estado === "publicado" && !a.resuelto && <button className="btn" type="button" disabled={busy} onClick={() => act("encasa")}>¡Ya está en casa!</button>}
          <button className="btn ghost" type="button" disabled={busy} onClick={() => act("retirar")}>Retirar el aviso</button>
          <Link className="btn ghost" href={`/perdidos#pa-${a.id}`}>Verlo en el mapa</Link>
        </div>
      </div>}
    </div>
  );
}
