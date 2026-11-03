"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./AdminApp";
import {
  TIPOS, tipoDe, type Ev, type Tipo, type Plan, type Tarea,
  hoyYmd, addDays, addMonths, lunes, toDate, enDia, ordenEv, semanaIso,
  claveDia, claveSemana, claveMes, claveAno, aIcs,
} from "@/lib/agenda";

type Vista = "dia" | "semana" | "mes" | "ano";
const VISTAS: [Vista, string][] = [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"], ["ano", "Año"]];
const DSEM = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const HORAS = Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, "0")); // 07–21

const largo = (s: string) => toDate(s).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const corto = (s: string) => toDate(s).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
const mayus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Planificador: carga y guardado automático ---------- */
function usePlan(clave: string) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [estado, setEstado] = useState<"" | "guardando" | "guardado" | "error">("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pend = useRef<{ k: string; p: Plan } | null>(null);
  const enviar = useCallback(async () => {
    const x = pend.current; if (!x) return; pend.current = null;
    try { await api("/api/admin/agenda", "PUT", { pl: x.k, data: x.p }); setEstado("guardado"); } catch { setEstado("error"); }
  }, []);
  useEffect(() => {
    let vivo = true; setPlan(null); setEstado("");
    api(`/api/admin/agenda?pl=${encodeURIComponent(clave)}`).then((j) => { if (vivo) setPlan(j.pl?.[clave] || {}); }).catch(() => vivo && setPlan({}));
    return () => { vivo = false; if (t.current) { clearTimeout(t.current); enviar(); } };
  }, [clave, enviar]);
  const cambiar = (patch: Partial<Plan>) => setPlan((p) => {
    const n = { ...(p || {}), ...patch }; pend.current = { k: clave, p: n }; setEstado("guardando");
    if (t.current) clearTimeout(t.current); t.current = setTimeout(() => { t.current = null; enviar(); }, 700);
    return n;
  });
  return { plan, cambiar, estado };
}

function Estado({ e }: { e: string }) {
  if (!e) return null;
  return <span className={`ag-estado ${e}`} role="status">{e === "guardando" ? "Guardando…" : e === "guardado" ? "Guardado" : "No se ha podido guardar"}</span>;
}

/* Área de texto que crece con lo que se escribe (también al imprimir). */
function Area({ value, onChange, placeholder, rows = 3, label }: { value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number; label: string }) {
  return <textarea className="ag-area" aria-label={label} rows={rows} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function Lista({ tareas = [], onChange, titulo = "Tareas" }: { tareas?: Tarea[]; onChange: (t: Tarea[]) => void; titulo?: string }) {
  const [nueva, setNueva] = useState("");
  const add = () => { const t = nueva.trim(); if (!t) return; onChange([...tareas, { t, ok: false }]); setNueva(""); };
  return (
    <div className="ag-box">
      <h4>{titulo}</h4>
      <ul className="ag-tareas">
        {tareas.map((x, i) => (
          <li key={i} className={x.ok ? "ok" : ""}>
            <label><input type="checkbox" checked={x.ok} onChange={() => onChange(tareas.map((y, j) => (j === i ? { ...y, ok: !y.ok } : y)))} /><span>{x.t}</span></label>
            <button type="button" className="ag-x ag-noprint" aria-label={`Quitar «${x.t}»`} onClick={() => onChange(tareas.filter((_, j) => j !== i))}>×</button>
          </li>
        ))}
        {Array.from({ length: Math.max(0, 4 - tareas.length) }, (_, i) => <li key={"v" + i} className="ag-linea" aria-hidden="true"><span className="ag-cuadro" /></li>)}
      </ul>
      <div className="ag-add ag-noprint">
        <input value={nueva} onChange={(e) => setNueva(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Añadir tarea…" aria-label="Nueva tarea" />
        <button type="button" className="btn ghost" onClick={add}>Añadir</button>
      </div>
    </div>
  );
}

function Pill({ e, onClick, conHora = true }: { e: Ev; onClick: () => void; conHora?: boolean }) {
  const t = tipoDe(e.tipo);
  return (
    <button type="button" className="ag-pill" style={{ ["--c" as string]: t.c }} onClick={onClick} title={`${t.n}: ${e.titulo}${e.lugar ? ` · ${e.lugar}` : ""}`}>
      {conHora && e.hora && <b>{e.hora}</b>} {e.titulo}
    </button>
  );
}

/* ---------- Componente principal ---------- */
export default function Agenda() {
  const [vista, setVista] = useState<Vista>("mes");
  const [ref, setRef] = useState(hoyYmd());
  const [evs, setEvs] = useState<Ev[] | null>(null);
  const [ocultos, setOcultos] = useState<Tipo[]>([]);
  const [edit, setEdit] = useState<Ev | null>(null);
  const [err, setErr] = useState("");

  const cargar = useCallback(() => api("/api/admin/agenda").then((j) => setEvs(j.evs)).catch((e) => setErr(e.message)), []);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => (evs || []).filter((e) => !ocultos.includes(e.tipo)), [evs, ocultos]);
  const delDia = useCallback((s: string) => visibles.filter((e) => enDia(e, s)).sort(ordenEv), [visibles]);
  const hoy = hoyYmd();

  const mover = (n: number) => setRef((r) => vista === "dia" ? addDays(r, n) : vista === "semana" ? addDays(r, 7 * n) : vista === "mes" ? addMonths(r, n) : addMonths(r, 12 * n));
  const titulo = vista === "dia" ? mayus(largo(ref))
    : vista === "semana" ? `Semana ${semanaIso(ref).slice(6)} · ${corto(lunes(ref))} – ${corto(addDays(lunes(ref), 6))} ${addDays(lunes(ref), 6).slice(0, 4)}`
    : vista === "mes" ? `${MESES[toDate(ref).getMonth()]} ${ref.slice(0, 4)}` : ref.slice(0, 4);

  const nuevo = (fecha = ref) => setEdit({ id: "", fecha, titulo: "", tipo: "sesion" });
  const abrirDia = (s: string) => { setRef(s); setVista("dia"); };

  const guardarEv = async (e: Ev) => {
    const j = await api("/api/admin/agenda", "PUT", { ev: e });
    setEvs((xs) => [...(xs || []).filter((x) => x.id !== j.ev.id), j.ev]); setEdit(null);
  };
  const borrarEv = async (e: Ev) => {
    if (!confirm(`¿Borrar «${e.titulo}»?`)) return;
    await api("/api/admin/agenda", "DELETE", { id: e.id }); setEvs((xs) => (xs || []).filter((x) => x.id !== e.id)); setEdit(null);
  };

  /** Imprime solo la hoja de la vista actual, ajustada a un A4 (vertical el día, apaisado el resto). */
  const imprimir = () => {
    const apaisado = vista !== "dia";
    const W = apaisado ? 1062 : 718, H = apaisado ? 733 : 1047; // área útil del A4 en px CSS, con márgenes de 8–10 mm
    const st = document.createElement("style"); st.id = "ag-page";
    st.textContent = `@page{size:A4 ${apaisado ? "landscape" : "portrait"};margin:${apaisado ? 8 : 10}mm}`;
    document.head.appendChild(st);
    const sh = document.querySelector<HTMLElement>(".ag-sheet");
    let z = 1;
    if (sh) {
      // Lo que tiene proporción fija (los días del año) crece con el ancho: se ajusta en varias pasadas.
      for (let i = 0; i < 4; i++) { sh.style.width = `${Math.floor(W / z)}px`; z = Math.max(0.55, Math.min(1, (H - 10) / sh.scrollHeight)); }
      z = Math.min(1, z * 0.97); sh.style.width = "";
    }
    const cls = ["ag-printing", `ag-p-${vista}`];
    document.body.classList.add(...cls);
    document.body.style.setProperty("--agw", `${Math.floor(W / z)}px`); document.body.style.setProperty("--agz", String(z));
    const fuera = () => { document.body.classList.remove(...cls); document.body.style.removeProperty("--agw"); document.body.style.removeProperty("--agz"); st.remove(); window.removeEventListener("afterprint", fuera); };
    window.addEventListener("afterprint", fuera);
    setTimeout(() => window.print(), 60);
  };
  const descargarIcs = () => {
    const b = new Blob([aIcs(evs || [])], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `agenda-pelosysenales-${hoy}.ics`; a.click(); URL.revokeObjectURL(a.href);
  };

  const proximos = useMemo(() => (evs || []).filter((e) => (e.hasta || e.fecha) >= hoy && e.fecha <= addDays(hoy, 14)).sort((a, b) => a.fecha.localeCompare(b.fecha) || ordenEv(a, b)).slice(0, 8), [evs, hoy]);

  return (
    <section className="ag">
      <div className="adm-bar ag-noprint">
        <h2>Agenda</h2>
        <button className="btn" type="button" onClick={() => nuevo(vista === "dia" || ref.slice(0, 7) !== hoy.slice(0, 7) ? ref : hoy)}>+ Nuevo evento</button>
        <button className="btn ghost" type="button" onClick={imprimir}>Imprimir o PDF</button>
        <button className="btn ghost" type="button" onClick={descargarIcs} disabled={!evs?.length}>Descargar calendario (.ics)</button>
      </div>
      {err && <p className="adm-err ag-noprint">{err}</p>}

      <div className="ag-toolbar ag-noprint">
        <div className="chips" role="group" aria-label="Vista">{VISTAS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={vista === k} onClick={() => setVista(k)}>{l}</button>)}</div>
        <div className="ag-nav">
          <button type="button" className="ag-flecha" aria-label="Anterior" onClick={() => mover(-1)}>‹</button>
          <button type="button" className="chip" onClick={() => setRef(hoy)}>Hoy</button>
          <button type="button" className="ag-flecha" aria-label="Siguiente" onClick={() => mover(1)}>›</button>
        </div>
      </div>

      <div className="ag-leyenda ag-noprint" role="group" aria-label="Mostrar u ocultar tipos">
        {TIPOS.map((t) => {
          const on = !ocultos.includes(t.id);
          return <button key={t.id} type="button" className="ag-tipo" aria-pressed={on} style={{ ["--c" as string]: t.c }} onClick={() => setOcultos((o) => (on ? [...o, t.id] : o.filter((x) => x !== t.id)))}><i />{t.n}</button>;
        })}
      </div>

      {vista !== "ano" && proximos.length > 0 && (
        <div className="ag-proximos ag-noprint">
          <b>Próximos 14 días</b>
          {proximos.map((e) => <button key={e.id} type="button" className="ag-prox" style={{ ["--c" as string]: tipoDe(e.tipo).c }} onClick={() => setEdit(e)}><i />{corto(e.fecha)}{e.hora ? ` · ${e.hora}` : ""} · {e.titulo}</button>)}
        </div>
      )}

      <div className={`ag-sheet ag-v-${vista}`}>
        <header className="ag-head"><img src="/brand/logo-horizontal.svg" alt="Pelos y Señales" /><h3>{titulo}</h3></header>
        {!evs ? <p>Cargando…</p> : (
          <>
            {vista === "dia" && <VistaDia fecha={ref} evs={delDia(ref)} abrir={setEdit} nuevo={nuevo} />}
            {vista === "semana" && <VistaSemana fecha={ref} delDia={delDia} abrir={setEdit} nuevo={nuevo} irDia={abrirDia} hoy={hoy} />}
            {vista === "mes" && <VistaMes fecha={ref} delDia={delDia} abrir={setEdit} nuevo={nuevo} irDia={abrirDia} hoy={hoy} />}
            {vista === "ano" && <VistaAno fecha={ref} delDia={delDia} irDia={abrirDia} hoy={hoy} irMes={(s) => { setRef(s); setVista("mes"); }} />}
          </>
        )}
      </div>

      {edit && <FormEv ev={edit} cerrar={() => setEdit(null)} guardar={guardarEv} borrar={borrarEv} />}
    </section>
  );
}

/* ---------- Día ---------- */
function VistaDia({ fecha, evs, abrir, nuevo }: { fecha: string; evs: Ev[]; abrir: (e: Ev) => void; nuevo: (f: string) => void }) {
  const { plan, cambiar, estado } = usePlan(claveDia(fecha));
  const sinHora = evs.filter((e) => !e.hora);
  const prio = plan?.prioridades || ["", "", ""];
  return (
    <div className="ag-dia">
      <div className="ag-horario">
        <div className="ag-box-h"><h4>Horario</h4><Estado e={estado} /></div>
        {sinHora.length > 0 && <div className="ag-todo-dia">{sinHora.map((e) => <Pill key={e.id} e={e} onClick={() => abrir(e)} />)}</div>}
        {HORAS.map((h) => {
          const aqui = evs.filter((e) => e.hora?.slice(0, 2) === h);
          return (
            <div key={h} className="ag-hora">
              <span className="ag-h">{h}:00</span>
              <div className="ag-hcol">
                {aqui.map((e) => <Pill key={e.id} e={e} onClick={() => abrir(e)} />)}
                <input className="ag-hin" aria-label={`Notas de las ${h}:00`} value={plan?.horas?.[h] || ""} onChange={(ev) => cambiar({ horas: { ...(plan?.horas || {}), [h]: ev.target.value } })} />
              </div>
            </div>
          );
        })}
        <button type="button" className="btn ghost ag-noprint" onClick={() => nuevo(fecha)}>+ Evento este día</button>
      </div>
      <div className="ag-lateral">
        <div className="ag-box">
          <h4>Prioridades del día</h4>
          <ol className="ag-prio">{[0, 1, 2].map((i) => <li key={i}><input aria-label={`Prioridad ${i + 1}`} value={prio[i] || ""} onChange={(e) => { const n = [...prio]; n[i] = e.target.value; cambiar({ prioridades: n }); }} /></li>)}</ol>
        </div>
        <Lista tareas={plan?.tareas} onChange={(t) => cambiar({ tareas: t })} titulo="Por hacer" />
        <div className="ag-box"><h4>Notas</h4><Area label="Notas del día" rows={6} value={plan?.notas} onChange={(v) => cambiar({ notas: v })} placeholder="Ideas, llamadas, cosas que no se pueden olvidar…" /></div>
      </div>
    </div>
  );
}

/* ---------- Semana ---------- */
function VistaSemana({ fecha, delDia, abrir, nuevo, irDia, hoy }: { fecha: string; delDia: (s: string) => Ev[]; abrir: (e: Ev) => void; nuevo: (f: string) => void; irDia: (s: string) => void; hoy: string }) {
  const { plan, cambiar, estado } = usePlan(claveSemana(fecha));
  const l = lunes(fecha);
  return (
    <div className="ag-semana">
      <div className="ag-box-h ag-noprint"><span /><Estado e={estado} /></div>
      <div className="ag-dias7">
        {DSEM.map((d, i) => {
          const s = addDays(l, i);
          return (
            <div key={s} className={`ag-dcol${s === hoy ? " hoy" : ""}`}>
              <button type="button" className="ag-dtit" onClick={() => irDia(s)}><b>{d}</b><span>{toDate(s).getDate()}</span></button>
              <div className="ag-dev">{delDia(s).map((e) => <Pill key={e.id} e={e} onClick={() => abrir(e)} />)}</div>
              <Area label={`Notas del ${d.toLowerCase()}`} rows={5} value={plan?.dias?.[String(i)]} onChange={(v) => cambiar({ dias: { ...(plan?.dias || {}), [String(i)]: v } })} />
              <button type="button" className="ag-mas ag-noprint" aria-label={`Nuevo evento el ${d.toLowerCase()}`} onClick={() => nuevo(s)}>+</button>
            </div>
          );
        })}
      </div>
      <div className="ag-pie3">
        <div className="ag-box"><h4>Objetivos de la semana</h4><Area label="Objetivos de la semana" rows={4} value={plan?.objetivos} onChange={(v) => cambiar({ objetivos: v })} /></div>
        <Lista tareas={plan?.tareas} onChange={(t) => cambiar({ tareas: t })} />
        <div className="ag-box"><h4>Notas</h4><Area label="Notas de la semana" rows={4} value={plan?.notas} onChange={(v) => cambiar({ notas: v })} /></div>
      </div>
    </div>
  );
}

/* ---------- Mes ---------- */
function celdasMes(fecha: string) {
  const primero = `${fecha.slice(0, 7)}-01`; const ini = lunes(primero);
  const ultimo = addDays(addMonths(primero, 1), -1); const fin = addDays(lunes(ultimo), 6);
  const out: string[] = []; for (let s = ini; s <= fin; s = addDays(s, 1)) out.push(s);
  return out;
}
function VistaMes({ fecha, delDia, abrir, nuevo, irDia, hoy }: { fecha: string; delDia: (s: string) => Ev[]; abrir: (e: Ev) => void; nuevo: (f: string) => void; irDia: (s: string) => void; hoy: string }) {
  const { plan, cambiar, estado } = usePlan(claveMes(fecha));
  const mes = fecha.slice(0, 7);
  return (
    <div className="ag-mes">
      <div className="ag-box-h ag-noprint"><span /><Estado e={estado} /></div>
      <div className="ag-grid" role="grid" aria-label="Calendario del mes">
        {DSEM.map((d) => <div key={d} className="ag-gh" role="columnheader">{d.slice(0, 3)}</div>)}
        {celdasMes(fecha).map((s) => {
          const evs = delDia(s);
          return (
            <div key={s} role="gridcell" className={`ag-cel${s.slice(0, 7) !== mes ? " fuera" : ""}${s === hoy ? " hoy" : ""}`}>
              <div className="ag-celh"><button type="button" className="ag-num" onClick={() => irDia(s)} aria-label={`Abrir el ${largo(s)}`}>{toDate(s).getDate()}</button><button type="button" className="ag-mas ag-noprint" aria-label={`Nuevo evento el ${largo(s)}`} onClick={() => nuevo(s)}>+</button></div>
              {evs.slice(0, 4).map((e) => <Pill key={e.id} e={e} onClick={() => abrir(e)} />)}
              {evs.length > 4 && <button type="button" className="ag-masev" onClick={() => irDia(s)}>+{evs.length - 4} más</button>}
            </div>
          );
        })}
      </div>
      <div className="ag-pie3">
        <div className="ag-box"><h4>Objetivos del mes</h4><Area label="Objetivos del mes" rows={4} value={plan?.objetivos} onChange={(v) => cambiar({ objetivos: v })} /></div>
        <Lista tareas={plan?.tareas} onChange={(t) => cambiar({ tareas: t })} />
        <div className="ag-box"><h4>Notas del mes</h4><Area label="Notas del mes" rows={4} value={plan?.notas} onChange={(v) => cambiar({ notas: v })} /></div>
      </div>
    </div>
  );
}

/* ---------- Año ---------- */
function VistaAno({ fecha, delDia, irDia, hoy, irMes }: { fecha: string; delDia: (s: string) => Ev[]; irDia: (s: string) => void; hoy: string; irMes: (s: string) => void }) {
  const { plan, cambiar, estado } = usePlan(claveAno(fecha));
  const y = fecha.slice(0, 4);
  return (
    <div className="ag-ano">
      <div className="ag-box-h ag-noprint"><span /><Estado e={estado} /></div>
      <div className="ag-meses">
        {MESES.map((m, i) => {
          const f = `${y}-${String(i + 1).padStart(2, "0")}-01`;
          return (
            <div key={m} className="ag-mini">
              <button type="button" className="ag-minit" onClick={() => irMes(f)}>{m}</button>
              <div className="ag-minig">
                {["L", "M", "X", "J", "V", "S", "D"].map((d) => <span key={d} className="ag-mh">{d}</span>)}
                {celdasMes(f).map((s) => {
                  if (s.slice(0, 7) !== f.slice(0, 7)) return <span key={s} />;
                  const evs = delDia(s); const cs = [...new Set(evs.map((e) => tipoDe(e.tipo).c))].slice(0, 3);
                  return (
                    <button key={s} type="button" className={`ag-md${s === hoy ? " hoy" : ""}${cs.length ? " con" : ""}`} onClick={() => irDia(s)} aria-label={`${largo(s)}${evs.length ? `, ${evs.length} evento${evs.length > 1 ? "s" : ""}` : ""}`}
                      style={cs.length ? { background: cs.length === 1 ? cs[0] : `linear-gradient(135deg, ${cs.map((c, k) => `${c} ${(k * 100) / cs.length}% ${((k + 1) * 100) / cs.length}%`).join(", ")})` } : undefined}>
                      {toDate(s).getDate()}
                    </button>
                  );
                })}
              </div>
              <Area label={`Planes de ${m.toLowerCase()}`} rows={2} value={plan?.meses?.[String(i + 1)]} onChange={(v) => cambiar({ meses: { ...(plan?.meses || {}), [String(i + 1)]: v } })} placeholder="Planes del mes…" />
            </div>
          );
        })}
      </div>
      <div className="ag-pie3 dos">
        <div className="ag-box"><h4>Objetivos del año</h4><Area label="Objetivos del año" rows={5} value={plan?.objetivos} onChange={(v) => cambiar({ objetivos: v })} /></div>
        <div className="ag-box"><h4>Notas</h4><Area label="Notas del año" rows={5} value={plan?.notas} onChange={(v) => cambiar({ notas: v })} /></div>
      </div>
      <div className="ag-leyenda-print">{TIPOS.map((t) => <span key={t.id}><i style={{ background: t.c }} />{t.n}</span>)}</div>
    </div>
  );
}

/* ---------- Formulario de evento ---------- */
function FormEv({ ev, cerrar, guardar, borrar }: { ev: Ev; cerrar: () => void; guardar: (e: Ev) => Promise<void>; borrar: (e: Ev) => Promise<void> }) {
  const [e, setE] = useState<Ev>(ev); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = <K extends keyof Ev>(k: K, v: Ev[K]) => setE((x) => ({ ...x, [k]: v }));
  useEffect(() => { const esc = (k: KeyboardEvent) => { if (k.key === "Escape") cerrar(); }; addEventListener("keydown", esc); return () => removeEventListener("keydown", esc); }, [cerrar]);
  const enviar = async (f: React.FormEvent) => {
    f.preventDefault(); setBusy(true); setErr("");
    try { await guardar(e); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="ag-modal ag-noprint" role="dialog" aria-modal="true" aria-labelledby="ag-ftit" onClick={(x) => { if (x.target === x.currentTarget) cerrar(); }}>
      <form className="ag-form" onSubmit={enviar}>
        <h3 id="ag-ftit">{ev.id ? "Editar evento" : "Nuevo evento"}</h3>
        <label><span className="lbl">Título</span><input id="ag-titulo" required autoFocus value={e.titulo} onChange={(x) => set("titulo", x.target.value)} placeholder="Sesión de fotos en La Sonrisa Animal" /></label>
        <div className="ag-tipos" role="radiogroup" aria-label="Tipo">
          {TIPOS.map((t) => <button key={t.id} type="button" role="radio" aria-checked={e.tipo === t.id} className="ag-tipo" style={{ ["--c" as string]: t.c }} onClick={() => set("tipo", t.id)}><i />{t.n}</button>)}
        </div>
        <div className="ag-f2">
          <label><span className="lbl">Día</span><input id="ag-fecha" type="date" required value={e.fecha} onChange={(x) => set("fecha", x.target.value)} /></label>
          <label><span className="lbl">Hasta (si dura varios días)</span><input id="ag-hasta" type="date" min={e.fecha} value={e.hasta || ""} onChange={(x) => set("hasta", x.target.value || undefined)} /></label>
          <label><span className="lbl">Hora</span><input id="ag-hora" type="time" value={e.hora || ""} onChange={(x) => set("hora", x.target.value || undefined)} /></label>
          <label><span className="lbl">Hasta las</span><input id="ag-fin" type="time" value={e.fin || ""} disabled={!e.hora} onChange={(x) => set("fin", x.target.value || undefined)} /></label>
        </div>
        <label><span className="lbl">Lugar</span><input id="ag-lugar" value={e.lugar || ""} onChange={(x) => set("lugar", x.target.value)} placeholder="Brenes, oficina de Torneo, online…" /></label>
        <label><span className="lbl">Notas</span><textarea id="ag-notas" rows={3} value={e.notas || ""} onChange={(x) => set("notas", x.target.value)} placeholder="Qué llevar, con quién, teléfono de contacto…" /></label>
        {err && <p className="adm-err">{err}</p>}
        <div className="ag-facts">
          {ev.id && <button type="button" className="btn ghost danger" onClick={() => borrar(ev)}>Borrar</button>}
          <span style={{ flex: 1 }} />
          <button type="button" className="btn ghost" onClick={cerrar}>Cancelar</button>
          <button type="submit" className="btn" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

