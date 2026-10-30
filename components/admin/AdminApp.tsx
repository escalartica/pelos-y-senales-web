"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dog, Protectora } from "@/lib/data";
import { EST } from "@/lib/data";
import type { Madrina } from "@/lib/madrinas";
import type { Catalog } from "@/lib/catalog";
import { reducirFoto } from "@/lib/perdidos";
import AvisosAdmin from "./AvisosAdmin";

type Tab = "perros" | "protectoras" | "madrinas" | "perdidos" | "alertas" | "copia";
const TABS: [Tab, string][] = [["perros", "Perros"], ["protectoras", "Protectoras"], ["madrinas", "Madrinas y padrinos"], ["perdidos", "Perdidos y avistados"], ["alertas", "Alertas por zona"], ["copia", "Copia de seguridad"]];

export const slug = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "nuevo";
const unico = (base: string, usados: string[]) => { let id = base, i = 2; while (usados.includes(id)) id = `${base}-${i++}`; return id; };
const hoy = () => new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");

export async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { alert("Tu sesión ha caducado. Vuelve a entrar."); location.reload(); }
  if (!r.ok) throw new Error(j.error || "Algo ha fallado.");
  return j;
}

export default function AdminApp({ fotos }: { fotos: string[] }) {
  const [cat, setCat] = useState<Catalog | null>(null); const [base, setBase] = useState("");
  const [tab, setTab] = useState<Tab>("perros"); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false); const [kv, setKv] = useState(true);
  const load = useCallback(async () => { const j = await api("/api/admin/catalog"); setCat(j.cat); setBase(j.cat.upd || ""); setKv(j.kv); }, []);
  useEffect(() => { load().catch((e) => setMsg({ ok: false, t: e.message })); }, [load]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 5000); return () => clearTimeout(t); }, [msg]);

  const save = async (next: Catalog, ok: string) => {
    setBusy(true);
    try { const j = await api("/api/admin/catalog", "PUT", { cat: next, base }); setCat(j.cat); setBase(j.cat.upd); setMsg({ ok: true, t: ok + " Ya se ve en la web." }); return true; }
    catch (e) { setMsg({ ok: false, t: (e as Error).message }); return false; }
    finally { setBusy(false); }
  };
  const salir = async () => { await fetch("/api/admin/login", { method: "DELETE" }); location.href = "/"; };

  return (
    <div className="admapp">
      <div className="adm-head">
        <div><span className="eyebrow">Solo equipo</span><h1>Panel de administración</h1></div>
        <button className="btn ghost" type="button" onClick={salir}>Cerrar sesión</button>
      </div>
      {!kv && <p className="adm-warn">Sin base de datos conectada: los cambios no se guardarán. Conecta Upstash en Vercel.</p>}
      <nav className="adm-tabs" aria-label="Secciones del panel">{TABS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}</nav>
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="status">{msg.t}</p>}
      {!cat ? <p>Cargando…</p> : (
        <>
          {tab === "perros" && <Perros cat={cat} fotos={fotos} busy={busy} save={save} />}
          {tab === "protectoras" && <Protectoras cat={cat} busy={busy} save={save} />}
          {tab === "madrinas" && <Madrinas cat={cat} busy={busy} save={save} />}
          {tab === "perdidos" && <AvisosAdmin />}
          {tab === "alertas" && <Alertas />}
          {tab === "copia" && <Copia cat={cat} />}
        </>
      )}
    </div>
  );
}

type SaveFn = (next: Catalog, ok: string) => Promise<boolean>;

/* ---------- Fotos ---------- */
function FotoField({ value, onChange, fotos, label = "Foto" }: { value?: string; onChange: (v: string) => void; fotos: string[]; label?: string }) {
  const [up, setUp] = useState(false); const [ver, setVer] = useState(false); const [err, setErr] = useState("");
  const subir = async (f?: File) => {
    if (!f) return; setUp(true); setErr("");
    try { const data = await reducirFoto(f, 1600); const j = await api("/api/admin/img", "POST", { data }); onChange(j.url); }
    catch (e) { setErr((e as Error).message === "tipo" ? "Ese archivo no es una imagen." : (e as Error).message); }
    setUp(false);
  };
  return (
    <div className="fld adm-foto">
      <span className="lbl">{label}</span>
      <div className="adm-foto-row">
        <div className="adm-prev">{value ? <img src={value} alt="" /> : <span>Sin foto</span>}</div>
        <div className="adm-foto-acts">
          <label className="btn ghost">{up ? "Subiendo…" : "Subir foto"}<input type="file" accept="image/*" hidden onChange={(e) => subir(e.target.files?.[0])} /></label>
          {fotos.length > 0 && <button type="button" className="btn ghost" onClick={() => setVer(!ver)}>{ver ? "Ocultar fotos de la sesión" : "Elegir de la sesión"}</button>}
          {value && <button type="button" className="adm-link" onClick={() => onChange("")}>Quitar foto</button>}
          {err && <small className="adm-err">{err}</small>}
        </div>
      </div>
      {ver && <div className="adm-galeria">{fotos.map((f) => <button key={f} type="button" aria-pressed={value === f} onClick={() => { onChange(f); setVer(false); }}><img src={f} alt={f.split("/").pop()} loading="lazy" /></button>)}</div>}
    </div>
  );
}

/* ---------- Campos ---------- */
const T = ({ l, v, on, area, ph, req }: { l: string; v?: string; on: (v: string) => void; area?: boolean; ph?: string; req?: boolean }) => {
  const id = "f-" + slug(l);
  return <div className="fld"><label htmlFor={id}>{l}{req ? " *" : ""}</label>{area ? <textarea id={id} value={v ?? ""} placeholder={ph} onChange={(e) => on(e.target.value)} /> : <input id={id} value={v ?? ""} placeholder={ph} onChange={(e) => on(e.target.value)} />}</div>;
};
function S<V extends string>({ l, v, on, opts }: { l: string; v: V; on: (v: V) => void; opts: [V, string][] }) {
  const id = "f-" + slug(l);
  return <div className="fld"><label htmlFor={id}>{l}</label><select id={id} value={v} onChange={(e) => on(e.target.value as V)}>{opts.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>;
}

/* ---------- Perros ---------- */
const NUEVO_PERRO = (prot: string): Dog => ({ id: "", n: "", edadTxt: "", edad: "adulto", tam: "mediano", sexo: "macho", act: "media", c: "m", prot, raza: "Mestizo", rasgos: [], conv: { ninos: "desc", perros: "desc", gatos: "desc" }, esp: false, estado: "disponible", acogida: false, upd: "", desc: "", pers: "", nec: [], hist: "" });
const CONV: ["si" | "no" | "desc", string][] = [["si", "Sí"], ["no", "No"], ["desc", "No evaluado"]];

function Perros({ cat, fotos, busy, save }: { cat: Catalog; fotos: string[]; busy: boolean; save: SaveFn }) {
  const [ed, setEd] = useState<{ d: Dog; nuevo: boolean } | null>(null); const [q, setQ] = useState("");
  const list = useMemo(() => cat.dogs.filter((d) => !q || `${d.n} ${d.raza} ${cat.prot[d.prot]?.n}`.toLowerCase().includes(q.toLowerCase())), [cat, q]);
  const borrar = (d: Dog) => { if (confirm(`¿Borrar la ficha de ${d.n}? Desaparecerá de la web.`)) save({ ...cat, dogs: cat.dogs.filter((x) => x.id !== d.id), madrinas: cat.madrinas.map((m) => (m.perro === d.id ? { ...m, perro: undefined } : m)) }, `Ficha de ${d.n} borrada.`); };
  const guardar = async (d: Dog) => {
    const otros = cat.dogs.filter((x) => x !== ed?.d).map((x) => x.id);
    const id = ed?.nuevo ? unico(slug(d.id || d.n), otros) : d.id;
    const fix: Dog = { ...d, id, upd: hoy() };
    const dogs = ed?.nuevo ? [...cat.dogs, fix] : cat.dogs.map((x) => (x.id === d.id ? fix : x));
    if (await save({ ...cat, dogs }, `Ficha de ${d.n} guardada.`)) setEd(null);
  };
  const mover = (i: number, k: number) => { const a = [...cat.dogs]; const j = i + k; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; save({ ...cat, dogs: a }, "Orden guardado."); };
  if (ed) return <DogForm key={ed.d.id || "nuevo"} d={ed.d} nuevo={ed.nuevo} cat={cat} fotos={fotos} busy={busy} onSave={guardar} onCancel={() => setEd(null)} />;
  return (
    <section>
      <div className="adm-bar"><h2>{cat.dogs.length} perros</h2><input className="adm-q" placeholder="Buscar" aria-label="Buscar perro" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn" type="button" onClick={() => setEd({ d: NUEVO_PERRO(Object.keys(cat.prot)[0] || ""), nuevo: true })}>Añadir perro</button></div>
      <p className="small">El orden de esta lista es el de la web: los tres primeros que buscan familia salen en la portada.</p>
      <div className="adm-list">
        {list.map((d) => { const i = cat.dogs.indexOf(d); return (
          <article key={d.id} className="adm-item">
            <div className="adm-thumb">{d.photo ? <img src={d.photo} alt="" /> : <span>{d.n[0]}</span>}</div>
            <div className="adm-info"><b>{d.n}</b><small>{d.raza} · {d.edadTxt} · {cat.prot[d.prot]?.n || "¿protectora?"}</small><span className={`adm-pill ${d.estado}`}>{EST[d.estado]}</span></div>
            <div className="adm-acts">
              <button type="button" aria-label={`Subir a ${d.n}`} disabled={busy || i === 0} onClick={() => mover(i, -1)}>↑</button>
              <button type="button" aria-label={`Bajar a ${d.n}`} disabled={busy || i === cat.dogs.length - 1} onClick={() => mover(i, 1)}>↓</button>
              <a className="adm-link" href={`/perros/${d.id}`} target="_blank" rel="noreferrer">Ver</a>
              <button type="button" className="btn ghost" onClick={() => setEd({ d, nuevo: false })}>Editar</button>
              <button type="button" className="btn ghost danger" disabled={busy} onClick={() => borrar(d)}>Borrar</button>
            </div>
          </article>
        ); })}
      </div>
    </section>
  );
}

function DogForm({ d: d0, nuevo, cat, fotos, busy, onSave, onCancel }: { d: Dog; nuevo: boolean; cat: Catalog; fotos: string[]; busy: boolean; onSave: (d: Dog) => void; onCancel: () => void }) {
  const [d, setD] = useState<Dog>(d0); const set = <K extends keyof Dog>(k: K, v: Dog[K]) => setD((x) => ({ ...x, [k]: v }));
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!d.n.trim()) { setErr("Falta el nombre."); return; } if (!cat.prot[d.prot]) { setErr("Elige una protectora."); return; } setErr(""); onSave(d); };
  return (
    <form className="form adm-form" onSubmit={submit}>
      <div className="adm-bar"><h2>{nuevo ? "Nuevo perro" : `Editar a ${d0.n}`}</h2><button type="button" className="btn ghost" onClick={onCancel}>Volver sin guardar</button></div>
      <FotoField value={d.photo} onChange={(v) => set("photo", v || undefined)} fotos={fotos} />
      <div className="row"><T l="Nombre" v={d.n} on={(v) => set("n", v)} req />{nuevo ? <T l="Dirección de la ficha" v={d.id} on={(v) => set("id", slug(v))} ph={slug(d.n || "nombre")} /> : <div className="fld"><span className="lbl">Dirección de la ficha</span><p className="small">pelosysenales.es/perros/{d.id}</p></div>}</div>
      <div className="row"><S l="Protectora" v={d.prot} on={(v) => set("prot", v)} opts={Object.values(cat.prot).map((p) => [p.id, p.n])} /><S l="Estado" v={d.estado} on={(v) => set("estado", v)} opts={Object.entries(EST) as [Dog["estado"], string][]} /></div>
      <div className="row"><T l="Raza" v={d.raza} on={(v) => set("raza", v)} /><S l="Sexo" v={d.sexo} on={(v) => set("sexo", v)} opts={[["macho", "Macho"], ["hembra", "Hembra"]]} /></div>
      <div className="row"><T l="Edad (como se muestra)" v={d.edadTxt} on={(v) => set("edadTxt", v)} ph="3 años y medio" /><S l="Grupo de edad" v={d.edad} on={(v) => set("edad", v)} opts={[["cachorro", "Cachorro"], ["adulto", "Adulto"], ["senior", "Sénior"]]} /></div>
      <div className="row"><S l="Tamaño" v={d.tam} on={(v) => set("tam", v)} opts={[["pequeño", "Pequeño"], ["mediano", "Mediano"], ["grande", "Grande"]]} /><T l="Peso" v={d.peso} on={(v) => set("peso", v)} ph="20 kg" /></div>
      <div className="row"><S l="Energía" v={d.act} on={(v) => set("act", v)} opts={[["baja", "Tranquilo"], ["media", "Normal"], ["alta", "Muy activo"]]} /><S l="Color de fondo" v={d.c} on={(v) => set("c", v)} opts={[["m", "Mostaza"], ["c", "Coral"], ["l", "Lima"]]} /></div>
      <div className="row three"><S l="Con niños" v={d.conv.ninos} on={(v) => set("conv", { ...d.conv, ninos: v })} opts={CONV} /><S l="Con perros" v={d.conv.perros} on={(v) => set("conv", { ...d.conv, perros: v })} opts={CONV} /><S l="Con gatos" v={d.conv.gatos} on={(v) => set("conv", { ...d.conv, gatos: v })} opts={CONV} /></div>
      <label className="check"><input type="checkbox" checked={!!d.acogida} onChange={(e) => set("acogida", e.target.checked)} /> <span>También busca casa de acogida</span></label>
      <label className="check"><input type="checkbox" checked={d.esp} onChange={(e) => set("esp", e.target.checked)} /> <span>Necesidades especiales</span></label>
      {d.esp && <T l="Necesidades especiales: explicación" v={d.espTxt} on={(v) => set("espTxt", v)} area />}
      <T l="Rasgos (separados por comas, máximo 6)" v={d.rasgos.join(", ")} on={(v) => set("rasgos", v.split(",").map((x) => x.trimStart()))} ph="Juguetón, Cariñoso, Le encantan los niños" />
      <T l="Presentación corta (sale en la tarjeta)" v={d.desc} on={(v) => set("desc", v)} area />
      <T l="Cómo es" v={d.pers} on={(v) => set("pers", v)} area />
      <T l="Lo que necesita (una línea por punto)" v={d.nec.join("\n")} on={(v) => set("nec", v.split("\n"))} area />
      <T l="Su historia" v={d.hist} on={(v) => set("hist", v)} area />
      {err && <p className="adm-err" role="alert">{err}</p>}
      <div className="adm-bar"><button className="btn" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar ficha"}</button><button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

/* ---------- Protectoras ---------- */
const NUEVA_PROT: Protectora = { id: "", n: "", ciudad: "", prov: "", tel: "", mail: "", horas: "", desc: "", web: "", ig: "" };
function Protectoras({ cat, busy, save }: { cat: Catalog; busy: boolean; save: SaveFn }) {
  const [ed, setEd] = useState<{ p: Protectora; nuevo: boolean } | null>(null);
  const borrar = (p: Protectora) => {
    const n = cat.dogs.filter((d) => d.prot === p.id).length;
    if (n) { alert(`${p.n} tiene ${n} perro(s). Bórralos o cámbialos de protectora antes.`); return; }
    if (confirm(`¿Quitar ${p.n} de la web?`)) { const prot = { ...cat.prot }; delete prot[p.id]; save({ ...cat, prot }, `${p.n} quitada.`); }
  };
  const guardar = async (p: Protectora) => {
    const id = ed?.nuevo ? unico(slug(p.id || p.n), Object.keys(cat.prot)) : p.id;
    if (await save({ ...cat, prot: { ...cat.prot, [id]: { ...p, id } } }, `${p.n} guardada.`)) setEd(null);
  };
  if (ed) return <ProtForm key={ed.p.id || "nueva"} p={ed.p} nuevo={ed.nuevo} busy={busy} onSave={guardar} onCancel={() => setEd(null)} />;
  return (
    <section>
      <div className="adm-bar"><h2>{Object.keys(cat.prot).length} protectoras</h2><button className="btn" type="button" onClick={() => setEd({ p: NUEVA_PROT, nuevo: true })}>Añadir protectora</button></div>
      <div className="adm-list">{Object.values(cat.prot).map((p) => (
        <article key={p.id} className="adm-item">
          <div className="adm-info"><b>{p.n}</b><small>{[p.ciudad, p.prov].filter(Boolean).join(", ") || "Sin ubicación"} · {cat.dogs.filter((d) => d.prot === p.id).length} perros{p.lat == null ? " · no sale en el mapa" : ""}</small></div>
          <div className="adm-acts"><a className="adm-link" href={`/protectoras/${p.id}`} target="_blank" rel="noreferrer">Ver</a><button type="button" className="btn ghost" onClick={() => setEd({ p, nuevo: false })}>Editar</button><button type="button" className="btn ghost danger" disabled={busy} onClick={() => borrar(p)}>Quitar</button></div>
        </article>
      ))}</div>
    </section>
  );
}
function ProtForm({ p: p0, nuevo, busy, onSave, onCancel }: { p: Protectora; nuevo: boolean; busy: boolean; onSave: (p: Protectora) => void; onCancel: () => void }) {
  const [p, setP] = useState<Protectora>(p0); const set = <K extends keyof Protectora>(k: K, v: Protectora[K]) => setP((x) => ({ ...x, [k]: v }));
  const [err, setErr] = useState("");
  const [la, setLa] = useState(p0.lat == null ? "" : String(p0.lat)); const [lo, setLo] = useState(p0.lon == null ? "" : String(p0.lon));
  const coord = (v: string) => (v.trim() === "" ? undefined : Number(v.trim().replace(",", ".")));
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); if (!p.n.trim()) { setErr("Falta el nombre."); return; }
    const lat = coord(la), lon = coord(lo);
    if ((lat == null) !== (lon == null) || (lat != null && (!isFinite(lat) || !isFinite(lon!)))) { setErr("Pon latitud y longitud como números, o deja las dos vacías."); return; }
    onSave({ ...p, lat, lon });
  };
  return (
    <form className="form adm-form" onSubmit={submit}>
      <div className="adm-bar"><h2>{nuevo ? "Nueva protectora" : `Editar ${p0.n}`}</h2><button type="button" className="btn ghost" onClick={onCancel}>Volver sin guardar</button></div>
      <T l="Nombre" v={p.n} on={(v) => set("n", v)} req />
      <div className="row"><T l="Localidad" v={p.ciudad} on={(v) => set("ciudad", v)} /><T l="Provincia" v={p.prov} on={(v) => set("prov", v)} /></div>
      <div className="row"><T l="Teléfono público" v={p.tel} on={(v) => set("tel", v)} /><T l="Correo de adopciones" v={p.mail} on={(v) => set("mail", v)} /></div>
      <div className="row"><T l="Web o Facebook (enlace completo)" v={p.web} on={(v) => set("web", v)} ph="https://…" /><T l="Instagram (usuario)" v={p.ig} on={(v) => set("ig", v)} ph="sin @" /></div>
      <T l="Horario de visitas" v={p.horas} on={(v) => set("horas", v)} />
      <div className="row"><T l="Latitud (para el mapa)" v={la} on={setLa} ph="37.55" /><T l="Longitud" v={lo} on={setLo} ph="-5.87" /></div>
      <p className="small">Para sacar las coordenadas: busca la localidad en Google Maps, pulsa con el botón derecho sobre el punto y copia los dos números.</p>
      <T l="Descripción" v={p.desc} on={(v) => set("desc", v)} area />
      {err && <p className="adm-err" role="alert">{err}</p>}
      <div className="adm-bar"><button className="btn" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar protectora"}</button><button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

/* ---------- Madrinas ---------- */
const NUEVA_MAD: Madrina = { id: "", n: "", rol: "", bio: "", redes: {}, c: "m" };
function Madrinas({ cat, busy, save }: { cat: Catalog; busy: boolean; save: SaveFn }) {
  const [ed, setEd] = useState<{ m: Madrina; nuevo: boolean } | null>(null);
  const borrar = (m: Madrina) => { if (confirm(`¿Quitar a ${m.n} de la web?`)) save({ ...cat, madrinas: cat.madrinas.filter((x) => x.id !== m.id) }, `${m.n} quitada.`); };
  const guardar = async (m: Madrina) => {
    const otros = cat.madrinas.filter((x) => x !== ed?.m).map((x) => x.id);
    const id = ed?.nuevo ? unico(slug(m.n), otros) : m.id;
    const madrinas = ed?.nuevo ? [...cat.madrinas, { ...m, id }] : cat.madrinas.map((x) => (x.id === m.id ? m : x));
    if (await save({ ...cat, madrinas }, `${m.n} guardada.`)) setEd(null);
  };
  if (ed) return <MadForm key={ed.m.id || "nueva"} m={ed.m} nuevo={ed.nuevo} cat={cat} busy={busy} onSave={guardar} onCancel={() => setEd(null)} />;
  return (
    <section>
      <div className="adm-bar"><h2>{cat.madrinas.length} madrinas y padrinos</h2><button className="btn" type="button" onClick={() => setEd({ m: NUEVA_MAD, nuevo: true })}>Añadir madrina o padrino</button></div>
      <div className="adm-list">{cat.madrinas.map((m) => (
        <article key={m.id} className="adm-item">
          <div className="adm-thumb">{m.foto ? <img src={m.foto.src} alt="" /> : <span>{m.n[0]}</span>}</div>
          <div className="adm-info"><b>{m.n}</b><small>{m.rol}{m.perro ? ` · apadrina a ${cat.dogs.find((d) => d.id === m.perro)?.n}` : ""}</small></div>
          <div className="adm-acts"><button type="button" className="btn ghost" onClick={() => setEd({ m, nuevo: false })}>Editar</button><button type="button" className="btn ghost danger" disabled={busy} onClick={() => borrar(m)}>Quitar</button></div>
        </article>
      ))}</div>
    </section>
  );
}
function MadForm({ m: m0, nuevo, cat, busy, onSave, onCancel }: { m: Madrina; nuevo: boolean; cat: Catalog; busy: boolean; onSave: (m: Madrina) => void; onCancel: () => void }) {
  const [m, setM] = useState<Madrina>(m0); const set = <K extends keyof Madrina>(k: K, v: Madrina[K]) => setM((x) => ({ ...x, [k]: v }));
  const red = (k: keyof Madrina["redes"], v: string) => setM((x) => ({ ...x, redes: { ...x.redes, [k]: v } }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (m.n.trim()) onSave(m); };
  return (
    <form className="form adm-form" onSubmit={submit}>
      <div className="adm-bar"><h2>{nuevo ? "Nueva madrina o padrino" : `Editar a ${m0.n}`}</h2><button type="button" className="btn ghost" onClick={onCancel}>Volver sin guardar</button></div>
      <FotoField value={m.foto?.src} onChange={(v) => set("foto", v ? { src: v, alt: m.foto?.alt || m.n } : undefined)} fotos={[]} label="Foto (con su permiso)" />
      <div className="row"><T l="Nombre" v={m.n} on={(v) => set("n", v)} req /><T l="A qué se dedica" v={m.rol} on={(v) => set("rol", v)} ph="Cantante" /></div>
      <T l="Presentación" v={m.bio} on={(v) => set("bio", v)} area />
      <T l="Su frase, literal y con su permiso (opcional)" v={m.frase} on={(v) => set("frase", v)} area />
      <div className="row"><S l="Perro que apadrina" v={m.perro || ""} on={(v) => set("perro", v || undefined)} opts={[["", "Ninguno todavía"], ...cat.dogs.map((d) => [d.id, d.n] as [string, string])]} /><S l="Color de la tarjeta" v={m.c} on={(v) => set("c", v)} opts={[["m", "Mostaza"], ["c", "Coral"], ["l", "Lima"]]} /></div>
      <div className="row"><T l="Instagram (usuario)" v={m.redes.ig} on={(v) => red("ig", v)} /><T l="TikTok (usuario)" v={m.redes.tt} on={(v) => red("tt", v)} /></div>
      <div className="row"><T l="X (usuario)" v={m.redes.x} on={(v) => red("x", v)} /><T l="YouTube (usuario)" v={m.redes.yt} on={(v) => red("yt", v)} /></div>
      <div className="adm-bar"><button className="btn" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button><button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button></div>
    </form>
  );
}

/* ---------- Alertas por zona ---------- */
function Alertas() {
  const [subs, setSubs] = useState<{ email: string; ciudad: string; desde: string }[] | null>(null); const [err, setErr] = useState("");
  const load = useCallback(() => api("/api/admin/subs").then((j) => setSubs(j.subs)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const baja = async (email: string) => { if (!confirm(`¿Dar de baja a ${email}?`)) return; try { await api("/api/admin/subs", "DELETE", { email }); load(); } catch (e) { setErr((e as Error).message); } };
  return (
    <section>
      <div className="adm-bar"><h2>Alertas por zona</h2></div>
      <p className="small">Personas que reciben un correo cuando se publica un perdido o avistado a menos de 30 km.</p>
      {err && <p className="adm-err">{err}</p>}
      {!subs ? <p>Cargando…</p> : !subs.length ? <p>Nadie se ha suscrito todavía.</p> : (
        <div className="adm-list">{subs.map((s) => (
          <article key={s.email} className="adm-item"><div className="adm-info"><b>{s.email}</b><small>{s.ciudad || "Sin ciudad"}{s.desde ? ` · desde ${new Date(s.desde).toLocaleDateString("es-ES")}` : ""}</small></div><div className="adm-acts"><button type="button" className="btn ghost danger" onClick={() => baja(s.email)}>Dar de baja</button></div></article>
        ))}</div>
      )}
    </section>
  );
}

/* ---------- Copia ---------- */
function Copia({ cat }: { cat: Catalog }) {
  const bajar = () => { const b = new Blob([JSON.stringify(cat, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `pelosysenales-copia-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href); };
  return (
    <section>
      <div className="adm-bar"><h2>Copia de seguridad</h2></div>
      <p>Descarga un archivo con todos los perros, protectoras y madrinas tal como están ahora. Guárdalo en tu ordenador de vez en cuando.</p>
      <p className="small">{cat.upd ? `Último cambio: ${new Date(cat.upd).toLocaleString("es-ES")}.` : "Todavía no se ha guardado nada desde el panel: la web muestra los datos iniciales."} Además, la web guarda sola las 30 versiones anteriores.</p>
      <button className="btn" type="button" onClick={bajar}>Descargar copia</button>
    </section>
  );
}
