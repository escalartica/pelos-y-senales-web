"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvisoInterno } from "@/lib/avisos-server";
import { api } from "./AdminApp";

type Filtro = "todos" | "pendiente" | "activo" | "encasa";
const fecha = (s?: string) => (s ? new Date(s).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

/** Moderación de Perdidos y avistados: publicar, corregir, marcar «en casa» o borrar. */
export default function AvisosAdmin() {
  const [list, setList] = useState<AvisoInterno[] | null>(null); const [f, setF] = useState<Filtro>("todos");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [ed, setEd] = useState<string | null>(null);
  const load = useCallback(() => api("/api/admin/avisos").then((j) => setList(j.avisos)).catch((e) => setMsg({ ok: false, t: e.message })), []);
  useEffect(() => { load(); }, [load]);
  const est = (x: AvisoInterno): Filtro => (x.estadoPub === "pendiente" ? "pendiente" : x.resuelto ? "encasa" : "activo");
  const vis = useMemo(() => (list || []).filter((x) => f === "todos" || est(x) === f), [list, f]);
  const n = (k: Filtro) => (list || []).filter((x) => est(x) === k).length;
  const act = async (x: AvisoInterno, accion: string, datos?: Record<string, unknown>) => {
    if (accion === "borrar" && !confirm("¿Borrar este aviso? Se elimina con su foto y no se puede recuperar.")) return;
    try { await api("/api/admin/avisos", "POST", { id: x.id, accion, datos }); setMsg({ ok: true, t: { publicar: "Aviso publicado.", encasa: "Marcado como «ya en casa».", reabrir: "Aviso activo de nuevo.", borrar: "Aviso borrado.", editar: "Aviso corregido." }[accion] || "Hecho." }); setEd(null); load(); }
    catch (e) { setMsg({ ok: false, t: (e as Error).message }); }
  };
  return (
    <section>
      <div className="adm-bar"><h2>Perdidos y avistados</h2><button type="button" className="btn ghost" onClick={load}>Actualizar</button></div>
      <p className="small">Los avisos sin confirmar por correo caducan solos a los 2 días; los publicados, a los 60.</p>
      <div className="adm-tabs">{([["todos", `Todos (${list?.length ?? 0})`], ["pendiente", `Sin confirmar (${n("pendiente")})`], ["activo", `Publicados (${n("activo")})`], ["encasa", `Ya en casa (${n("encasa")})`]] as [Filtro, string][]).map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}</div>
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="status">{msg.t}</p>}
      {!list ? <p>Cargando…</p> : !vis.length ? <p>No hay avisos aquí.</p> : (
        <div className="adm-list">{vis.map((x) => (
          <article key={x.id} className="adm-item aviso">
            <div className="adm-thumb">{x.foto ? <img src={x.foto} alt="" /> : <span>{x.tipo === "perdido" ? "?" : "👁"}</span>}</div>
            <div className="adm-info">
              <b>{x.tipo === "perdido" ? `Se busca: ${x.nombre || "sin nombre"}` : "Avistado"} <span className={`adm-pill ${est(x)}`}>{{ pendiente: "Sin confirmar", activo: "Publicado", encasa: "Ya en casa", todos: "" }[est(x)]}</span></b>
              <small>{x.lugar} · {x.ciudad} · {fecha(x.fecha)}</small>
              <small>{x.color}{x.tel ? ` · Tel. ${x.tel}` : ""} · <a href={`mailto:${x.email}`}>{x.email}</a></small>
              {x.notas && <small>«{x.notas}»</small>}
              <small>Enviado {fecha(x.creado)}</small>
              {ed === x.id && <AvisoForm x={x} onSave={(d) => act(x, "editar", d)} onCancel={() => setEd(null)} />}
            </div>
            <div className="adm-acts">
              {x.estadoPub === "pendiente" && <button type="button" className="btn ghost" onClick={() => act(x, "publicar")}>Publicar</button>}
              {x.estadoPub === "publicado" && !x.resuelto && <button type="button" className="btn ghost" onClick={() => act(x, "encasa")}>Ya en casa</button>}
              {x.resuelto && <button type="button" className="btn ghost" onClick={() => act(x, "reabrir")}>Reactivar</button>}
              <button type="button" className="btn ghost" onClick={() => setEd(ed === x.id ? null : x.id)}>Editar</button>
              <button type="button" className="btn ghost danger" onClick={() => act(x, "borrar")}>Borrar</button>
            </div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

function AvisoForm({ x, onSave, onCancel }: { x: AvisoInterno; onSave: (d: Record<string, string>) => void; onCancel: () => void }) {
  const campos: [string, string][] = [...(x.tipo === "perdido" ? [["nombre", "Nombre"] as [string, string]] : []), ["color", "Descripción"], ["lugar", "Lugar"], ["ciudad", "Ciudad"], ["tel", "Teléfono"], ["notas", "Notas"]];
  const [d, setD] = useState<Record<string, string>>(Object.fromEntries(campos.map(([k]) => [k, String((x as unknown as Record<string, unknown>)[k] ?? "")])));
  return (
    <form className="form adm-mini" onSubmit={(e) => { e.preventDefault(); onSave(d); }}>
      {campos.map(([k, l]) => <div className="fld" key={k}><label htmlFor={`av-${x.id}-${k}`}>{l}</label>{k === "notas" ? <textarea id={`av-${x.id}-${k}`} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} /> : <input id={`av-${x.id}-${k}`} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} />}</div>)}
      <div className="adm-bar"><button className="btn" type="submit">Guardar cambios</button><button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}
