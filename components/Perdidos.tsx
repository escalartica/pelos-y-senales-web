"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EsMap, { type Pin } from "@/components/EsMap";
import { CITIES, nearestCity } from "@/lib/spain";
import { TAM, cls, label, fmtFecha, shareText, matches, useAvisos, reducirFoto, type Aviso, type Tam, type EstadoAvistado } from "@/lib/perdidos";
import { toast } from "@/lib/store";

type Tab = "perdido" | "avistado" | "mapa";
type Modo = "ambos" | "perdido" | "avistado";
type Loc = { lat: number; lon: number; ciudad?: string } | null;

function DogSil() { return <svg viewBox="0 0 100 60" aria-hidden="true"><path d="M8 48c0-14 10-26 26-26h20c10 0 16 6 22 6l8-10c3-4 10-2 10 4v14c0 6-6 8-10 8h-4v6H70v-6H40v6H28v-6c-10 0-20-2-20 4z" fill="none" stroke="#161616" strokeWidth="3" strokeLinejoin="round" /></svg>; }

export function printPoster(html: string) {
  const pp = document.getElementById("print-poster"); if (!pp) return;
  pp.innerHTML = html; document.body.classList.add("printing");
  setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove("printing"), 500); }, 50);
}
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
export function posterLost(x: Aviso) {
  return `<div class="pp"><div><div class="big">SE BUSCA</div><div class="n">${esc(x.nombre)}</div></div><div><div class="im">${x.foto ? `<img src="${x.foto}" alt="">` : ""}</div><p>${esc(x.sexo)} · ${TAM[x.tam]} · ${esc(x.color)}${x.collar ? " · " + esc(x.collar) : ""}</p><p>Visto por última vez en <b>${esc(x.lugar)}</b> (${esc(x.ciudad)}), ${fmtFecha(x.fecha)}.</p>${x.caracter ? `<p>${esc(x.caracter)}. No lo persigas: avisa.</p>` : ""}</div><div><div class="tel">${esc(x.tel)}</div><div class="foot">pelosyseñales.com/perdidos</div></div></div>`;
}

function share(x: Aviso) {
  const text = shareText(x);
  if (navigator.share) navigator.share({ title: "Pelos y Señales", text }).catch(() => {});
  else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
}

function LocPicker({ k, loc, setLoc }: { k: string; loc: Loc; setLoc: (l: Loc) => void }) {
  const [info, setInfo] = useState("O toca el mapa para fijar el punto.");
  const geo = () => {
    if (!navigator.geolocation) { setInfo("Tu navegador no da la ubicación: elige la ciudad o toca el mapa."); return; }
    setInfo("Buscando tu posición…");
    navigator.geolocation.getCurrentPosition((p) => { setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }); setInfo(`Ubicación tomada (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}).`); }, () => setInfo("No se pudo obtener la ubicación: elige la ciudad o toca el mapa."), { enableHighAccuracy: true, timeout: 8000 });
  };
  return (
    <div className="fld">
      <label htmlFor={`${k}-ciudad`}>Ubicación en el mapa</label>
      <div className="loc">
        <button className="btn ghost" type="button" onClick={geo}>Usar mi ubicación</button>
        <select id={`${k}-ciudad`} aria-label="Ciudad aproximada" value={loc?.ciudad || ""} onChange={(e) => { const c = CITIES[e.target.value]; if (c) { setLoc({ lat: c[0], lon: c[1], ciudad: e.target.value }); setInfo(`Ciudad: ${e.target.value}. Toca el mapa para afinar.`); } }}>
          <option value="">Elegir ciudad…</option>{Object.keys(CITIES).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="hint">{info}</span>
      </div>
      <div className="locmap"><EsMap pins={[]} pick here={loc} onPick={(lat, lon) => { setLoc({ lat, lon }); setInfo(`Punto fijado en el mapa (${lat.toFixed(3)}, ${lon.toFixed(3)}). Afínalo con la calle.`); }} /></div>
    </div>
  );
}

function FotoInput({ k, foto, setFoto, hint }: { k: string; foto: string | null; setFoto: (f: string | null) => void; hint: string }) {
  return (
    <div className="photo">
      <label className="ph" htmlFor={`${k}-foto`}>{foto ? <img src={foto} alt="" /> : <>Foto<br />(toca para subir)</>}</label>
      <div><input id={`${k}-foto`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; reducirFoto(f).then(setFoto).catch(() => toast("No hemos podido leer esa foto. Prueba con otra.")); }} /><p className="hint">{hint}</p></div>
    </div>
  );
}

export default function Perdidos() {
  const [tab, setTab] = useState<Tab>("mapa");
  const [modo, setModo] = useState<Modo>("ambos");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const { avisos: all, estado: carga, activo, recargar } = useAvisos();
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const msg: Record<string, string> = { "aviso:publicado": "Aviso publicado. Ya está en el mapa: compártelo.", "aviso:caducado": "Ese enlace ha caducado o el aviso ya no existe. Vuelve a enviarlo.", "zona:ok": "Avisos de tu zona activados.", "zona:baja": "Te hemos dado de baja de los avisos de zona.", "zona:caducado": "Ese enlace ha caducado. Vuelve a pedir los avisos." };
    for (const k of ["aviso", "zona"]) { const v = qs.get(k); if (v && msg[`${k}:${v}`]) toast(msg[`${k}:${v}`]); }
    const h = location.hash.replace("#", ""); if (h === "perdido" || h === "avistado") setTab(h); else if (h.startsWith("pa-")) setSel(h.slice(3));
    const onHash = () => { const hh = location.hash.replace("#", ""); if (hh === "perdido" || hh === "avistado") setTab(hh); if (hh === "mapa") setTab("mapa"); };
    window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const list = useMemo(() => { const qq = q.trim().toLowerCase(); return all.filter((x) => (modo === "ambos" || x.tipo === modo) && (!qq || `${x.ciudad} ${x.lugar}`.toLowerCase().includes(qq))).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")); }, [all, modo, q]);
  const stats = useMemo(() => all.reduce((s, x) => { if (x.resuelto) s.h++; else if (x.tipo === "perdido") s.p++; else s.a++; return s; }, { p: 0, a: 0, h: 0 }), [all]);
  const coinc = useMemo(() => matches(all), [all]);

  // --- formulario perdido ---
  const [lp, setLp] = useState({ nombre: "", sexo: "Macho", tam: "m" as Tam, color: "", chip: "Sí, con mis datos al día", collar: "", fecha: "", lugar: "", caracter: "Confiado, se acerca a la gente", tel: "", notas: "", email: "", priv: false, web: "" });
  const [busy, setBusy] = useState(false);
  const [lpLoc, setLpLoc] = useState<Loc>(null); const [lpFoto, setLpFoto] = useState<string | null>(null); const [lpOk, setLpOk] = useState("");
  // --- formulario avistado ---
  const [la, setLa] = useState({ lugar: "", fecha: "", estado: "avistado" as EstadoAvistado, tam: "m" as Tam, color: "", collar: "No lo sé", dir: "", tel: "", notas: "", email: "", priv: false, web: "" });
  const [laLoc, setLaLoc] = useState<Loc>(null); const [laFoto, setLaFoto] = useState<string | null>(null); const [laOk, setLaOk] = useState("");
  // --- alerta ---
  const [al, setAl] = useState({ c: "", m: "" }); const [alOk, setAlOk] = useState("Te escribimos cuando se publique un perdido o un avistamiento a menos de 30 km. Sin registro; te das de baja con un clic.");

  const enviar = async (body: Record<string, unknown>, setMsg: (m: string) => void, reset: () => void) => {
    setBusy(true); setMsg("Enviando…");
    try {
      const r = await fetch("/api/avisos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg(j.error || "No se pudo enviar. Prueba de nuevo."); setBusy(false); return; }
      setMsg(`Casi está: te hemos enviado un correo a ${body.email}. Pulsa el enlace que contiene para publicarlo (revisa también la carpeta de spam).${j.debugUrl ? " Entorno de pruebas: " + j.debugUrl : ""}`);
      reset(); toast("Revisa tu correo para publicar el aviso");
    } catch { setMsg("No se pudo enviar. Revisa tu conexión y prueba de nuevo."); }
    setBusy(false);
  };
  const submitLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lp.nombre.trim() || !lp.tel.trim()) { setLpOk("Nos falta su nombre y un teléfono de contacto."); return; }
    if (!lpLoc) { setLpOk("Marca dónde se perdió: usa tu ubicación, elige la ciudad o toca el mapa."); return; }
    if (!/.+@.+\..+/.test(lp.email)) { setLpOk("Escribe tu correo: te mandamos el enlace para publicarlo."); return; }
    if (!lp.priv) { setLpOk("Marca la casilla para darnos permiso para publicar el aviso."); return; }
    enviar({ tipo: "perdido", ...lp, lat: lpLoc.lat, lon: lpLoc.lon, ciudad: lpLoc.ciudad || nearestCity(lpLoc.lat, lpLoc.lon), foto: lpFoto }, setLpOk, () => { setLpFoto(null); });
  };
  const submitSeen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!laLoc) { setLaOk("La ubicación es lo más importante: usa tu posición, elige la ciudad o toca el mapa."); return; }
    if (!la.lugar.trim()) { setLaOk("Dinos el lugar: calle, parque o carretera."); return; }
    if (!/.+@.+\..+/.test(la.email)) { setLaOk("Escribe tu correo: te mandamos el enlace para publicarlo."); return; }
    if (!la.priv) { setLaOk("Marca la casilla para darnos permiso para publicar el aviso."); return; }
    enviar({ tipo: "avistado", ...la, lat: laLoc.lat, lon: laLoc.lon, ciudad: laLoc.ciudad || nearestCity(laLoc.lat, laLoc.lon), foto: laFoto }, setLaOk, () => { setLaFoto(null); });
  };
  const alerta = async () => {
    if (!al.c || !/.+@.+\..+/.test(al.m)) { setAlOk("Elige una ciudad y escribe un correo válido."); return; }
    try {
      const r = await fetch("/api/avisos/zona", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: al.m, ciudad: al.c }) });
      const j = await r.json().catch(() => ({}));
      setAlOk(r.ok ? `Te hemos enviado un correo a ${al.m} para confirmar.${j.debugUrl ? " Entorno de pruebas: " + j.debugUrl : ""}` : j.error || "No se pudo activar. Prueba de nuevo.");
    } catch { setAlOk("No se pudo activar. Prueba de nuevo."); }
  };
  void recargar;

  const pins: Pin[] = list.map((x) => ({ id: x.id, lat: x.lat, lon: x.lon, cls: cls(x), title: `${x.tipo === "perdido" ? "Se busca: " + (x.nombre || "") : label(x)} · ${x.ciudad}`, on: sel === x.id }));
  const Tabs = (
    <div className="ptabs" role="group" aria-label="Qué quieres hacer">
      <button type="button" className="ptab p" aria-pressed={tab === "perdido"} onClick={() => setTab("perdido")}>He perdido a mi perro</button>
      <button type="button" className="ptab a" aria-pressed={tab === "avistado"} onClick={() => setTab("avistado")}>He visto un perro suelto</button>
      <button type="button" className="ptab" aria-pressed={tab === "mapa"} onClick={() => setTab("mapa")}>Ver los mapas</button>
    </div>
  );

  return (
    <>
      <div className="wrap listhead">
        <span className="eyebrow">Perdidos y avistados</span>
        <h1>Si se ha perdido, que se vea. Si lo has visto, que se sepa.</h1>
        <p className="lead">Dos tablones y dos mapas que se hablan entre sí: el de los perros que alguien busca y el de los perros que alguien ha visto sueltos. Cuanto más cerca estén un punto y otro, antes vuelve a casa. Es gratis, sin registro, y la ubicación es lo que más ayuda.</p>
        <div className="avisos" aria-live="polite"><span className="p">{stats.p} perro{stats.p === 1 ? "" : "s"} que alguien busca</span><span className="a">{stats.a} avistado{stats.a === 1 ? "" : "s"} sin resolver</span><span className="h">{stats.h} ya en casa</span></div>
        {Tabs}
        {carga === "ok" && !activo && <p className="note" role="status" style={{ marginTop: 14, fontWeight: 700 }}>Estamos activando la publicación de avisos. Mientras tanto, si has perdido o encontrado un perro, escríbenos a <a href="mailto:infopelosysenales@gmail.com">infopelosysenales@gmail.com</a> o llama al <a href="tel:+34635025378">+34 635 025 378</a> y lo difundimos.</p>}
      </div>
      <div className="wrap">
        {tab === "perdido" && (
          <div className="pform on">
            <form className="form" onSubmit={submitLost} noValidate style={{ position: "relative" }}>
              <h2>Se busca: cuéntanos cómo es y dónde se perdió.</h2>
              <p className="small">Lo que más ayuda a encontrarlo: una foto reciente de cuerpo entero, el lugar exacto y la hora de la última vez que lo viste, y un teléfono que cojas siempre. Con esto generamos su ficha, un cartel para imprimir y lo colocamos en el mapa.</p>
              <FotoInput k="lp" foto={lpFoto} setFoto={setLpFoto} hint="Mejor de cuerpo entero y con luz. Si tiene una mancha o una cicatriz que lo identifique, otra foto de eso." />
              <div className="row3">
                <div className="fld"><label htmlFor="lp-nombre">Nombre</label><input id="lp-nombre" type="text" value={lp.nombre} onChange={(e) => setLp({ ...lp, nombre: e.target.value })} /></div>
                <div className="fld"><label htmlFor="lp-sexo">Sexo</label><select id="lp-sexo" value={lp.sexo} onChange={(e) => setLp({ ...lp, sexo: e.target.value })}><option>Macho</option><option>Hembra</option></select></div>
                <div className="fld"><label htmlFor="lp-tam">Tamaño</label><select id="lp-tam" value={lp.tam} onChange={(e) => setLp({ ...lp, tam: e.target.value as Tam })}><option value="p">Pequeño (hasta 10 kg)</option><option value="m">Mediano (10–25 kg)</option><option value="g">Grande (más de 25 kg)</option></select></div>
              </div>
              <div className="row3">
                <div className="fld"><label htmlFor="lp-color">Color y raza o tipo</label><input id="lp-color" type="text" placeholder="Canela y blanco, bodeguero" value={lp.color} onChange={(e) => setLp({ ...lp, color: e.target.value })} /></div>
                <div className="fld"><label htmlFor="lp-chip">Microchip</label><select id="lp-chip" value={lp.chip} onChange={(e) => setLp({ ...lp, chip: e.target.value })}><option>Sí, con mis datos al día</option><option>Sí, pero no sé si están al día</option><option>No lo sé</option><option>No</option></select></div>
                <div className="fld"><label htmlFor="lp-collar">Collar, placa o arnés</label><input id="lp-collar" type="text" placeholder="Collar rojo con placa" value={lp.collar} onChange={(e) => setLp({ ...lp, collar: e.target.value })} /></div>
              </div>
              <div className="row">
                <div className="fld"><label htmlFor="lp-fecha">Última vez que lo viste</label><input id="lp-fecha" type="datetime-local" value={lp.fecha} onChange={(e) => setLp({ ...lp, fecha: e.target.value })} /></div>
                <div className="fld"><label htmlFor="lp-lugar">Dónde (calle, parque, carretera)</label><input id="lp-lugar" type="text" placeholder="Parque de María Luisa, junto a la glorieta" value={lp.lugar} onChange={(e) => setLp({ ...lp, lugar: e.target.value })} /></div>
              </div>
              <LocPicker k="lp" loc={lpLoc} setLoc={setLpLoc} />
              <div className="row">
                <div className="fld"><label htmlFor="lp-caracter">Cómo es con desconocidos</label><select id="lp-caracter" value={lp.caracter} onChange={(e) => setLp({ ...lp, caracter: e.target.value })}><option>Confiado, se acerca a la gente</option><option>Tímido, hay que darle tiempo</option><option>Muy asustadizo, huye si lo llaman</option><option>Puede gruñir si lo acorralan</option></select></div>
                <div className="fld"><label htmlFor="lp-tel">Teléfono de contacto</label><input id="lp-tel" type="tel" placeholder="6xx xxx xxx" value={lp.tel} onChange={(e) => setLp({ ...lp, tel: e.target.value })} /></div>
              </div>
              <div className="fld"><label htmlFor="lp-notas">Algo más que ayude</label><textarea id="lp-notas" placeholder="Responde a su nombre, le encantan las salchichas, cojea de la pata trasera, está en tratamiento…" value={lp.notas} onChange={(e) => setLp({ ...lp, notas: e.target.value })} /></div>
              <div className="fld"><label htmlFor="lp-email">Tu correo (no se publica)</label><input id="lp-email" type="email" autoComplete="email" value={lp.email} onChange={(e) => setLp({ ...lp, email: e.target.value })} /><p className="hint">Te mandamos un enlace para publicar el aviso y otro para marcarlo «en casa» o retirarlo.</p></div>
              <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true"><label htmlFor="lp-web">Deja este campo vacío</label><input id="lp-web" type="text" tabIndex={-1} autoComplete="off" value={lp.web} onChange={(e) => setLp({ ...lp, web: e.target.value })} /></div>
              <label className="check"><input type="checkbox" checked={lp.priv} onChange={(e) => setLp({ ...lp, priv: e.target.checked })} /> <span>Publico esta ficha, con su foto, el lugar y mi teléfono, para que quien lo vea pueda avisarme. Caduca sola a los 60 días y puedo retirarla cuando quiera. He leído la <Link href="/privacidad">política de privacidad</Link>.</span></label>
              <button className="btn coral" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar y publicar la ficha"}</button>
              <div className={`ok${lpOk ? " show" : ""}`}>{lpOk}</div>
            </form>
            <div className="split" style={{ marginTop: 28, alignItems: "start" }}>
              <div><span className="eyebrow">Para encontrarlo</span><h2>Las primeras 24 horas cuentan el doble.</h2>
                <ol style={{ marginTop: 14, display: "grid", gap: 10, paddingLeft: 22, fontSize: 15, lineHeight: 1.5 }}>
                  <li><b>Busca primero cerca de casa</b>, en patios, garajes y solares: muchos perros se esconden a pocas calles y no responden.</li>
                  <li><b>Vuelve al punto donde se perdió al atardecer</b> con algo que huela a ti (una sudadera, su manta), agua y comida. Muchos vuelven solos a ese sitio.</li>
                  <li><b>No lo persigas si lo ves</b>: agáchate de lado, no lo mires fijamente y deja que venga. Si está en «modo huida», hasta su nombre puede hacer que corra.</li>
                  <li><b>Avisa a los que lo pueden tener</b>: veterinarios de la zona, perrera o centro municipal, protectoras del <Link href="/mapa">mapa</Link> y policía local. Deja tu teléfono en todos.</li>
                  <li><b>Comprueba el chip</b>: llama al registro de identificación de tu comunidad y confirma que tus datos están al día.</li>
                  <li><b>Carteles grandes</b> en cruces, paradas y comercios, con la foto, el nombre y tu teléfono en letras que se lean desde un coche. Aquí te generamos uno.</li>
                  <li><b>Redes y grupos locales</b> de perdidos de tu ciudad, con la misma foto y el enlace a esta ficha.</li>
                  <li><b>Cuidado con quien pide dinero</b> por «información» antes de ver al perro: suele ser una estafa.</li>
                </ol></div>
              <div className="poster"><div className="big">SE BUSCA</div><div className="im">{lpFoto && <img src={lpFoto} alt="" />}</div><p><b>{lp.nombre || "Tu perro"}</b></p><p>{lp.color || lp.lugar ? `${lp.color}${lp.color && lp.lugar ? " · " : ""}${lp.lugar ? "Visto por última vez en " + lp.lugar : ""}` : "Rellena la ficha y el cartel se compone solo."}</p><div className="tel">{lp.tel}</div><p className="small" style={{ fontSize: 12 }}>pelosyseñales.com/perdidos</p></div>
            </div>
          </div>
        )}
        {tab === "avistado" && (
          <div className="pform on">
            <form className="form" onSubmit={submitSeen} noValidate style={{ position: "relative" }}>
              <h2>Lo has visto: la ubicación es lo más importante.</h2>
              <p className="small">No hace falta que lo cojas. Una foto, el sitio exacto y cómo estaba bastan para que su familia o una protectora cercana puedan actuar. Si lo tienes contigo, márcalo y lo pondremos como «recogido».</p>
              <FotoInput k="la" foto={laFoto} setFoto={setLaFoto} hint="Desde lejos vale. Lo importante es que se vea el color, el tamaño y si lleva collar." />
              <LocPicker k="la" loc={laLoc} setLoc={setLaLoc} />
              <div className="row3">
                <div className="fld"><label htmlFor="la-lugar">Calle, parque o carretera</label><input id="la-lugar" type="text" placeholder="Carretera A-4 km 532, arcén derecho" value={la.lugar} onChange={(e) => setLa({ ...la, lugar: e.target.value })} /></div>
                <div className="fld"><label htmlFor="la-fecha">Cuándo</label><input id="la-fecha" type="datetime-local" value={la.fecha} onChange={(e) => setLa({ ...la, fecha: e.target.value })} /></div>
                <div className="fld"><label htmlFor="la-estado">Cómo estaba</label><select id="la-estado" value={la.estado} onChange={(e) => setLa({ ...la, estado: e.target.value as EstadoAvistado })}><option value="avistado">Suelto, parecía bien</option><option value="asustado">Suelto y muy asustado</option><option value="herido">Herido o cojeando</option><option value="recogido">Lo tengo conmigo</option></select></div>
              </div>
              <div className="row3">
                <div className="fld"><label htmlFor="la-tam">Tamaño</label><select id="la-tam" value={la.tam} onChange={(e) => setLa({ ...la, tam: e.target.value as Tam })}><option value="p">Pequeño</option><option value="m">Mediano</option><option value="g">Grande</option></select></div>
                <div className="fld"><label htmlFor="la-color">Color y tipo</label><input id="la-color" type="text" placeholder="Negro con pecho blanco, tipo podenco" value={la.color} onChange={(e) => setLa({ ...la, color: e.target.value })} /></div>
                <div className="fld"><label htmlFor="la-collar">Collar o placa</label><select id="la-collar" value={la.collar} onChange={(e) => setLa({ ...la, collar: e.target.value })}><option>No lo sé</option><option>Sí, llevaba collar</option><option>No llevaba nada</option></select></div>
              </div>
              <div className="row">
                <div className="fld"><label htmlFor="la-dir">Hacia dónde iba</label><input id="la-dir" type="text" placeholder="Hacia el río, siguiendo la vía" value={la.dir} onChange={(e) => setLa({ ...la, dir: e.target.value })} /></div>
                <div className="fld"><label htmlFor="la-tel">Tu teléfono (opcional, se verá en el aviso)</label><input id="la-tel" type="tel" autoComplete="tel" value={la.tel} onChange={(e) => setLa({ ...la, tel: e.target.value })} /></div>
              </div>
              <div className="fld"><label htmlFor="la-notas">Algo más</label><textarea id="la-notas" placeholder="Se dejaba acercar, iba con otro perro, lo vi dos días seguidos a la misma hora…" value={la.notas} onChange={(e) => setLa({ ...la, notas: e.target.value })} /></div>
              <div className="fld"><label htmlFor="la-email">Tu correo (no se publica)</label><input id="la-email" type="email" autoComplete="email" value={la.email} onChange={(e) => setLa({ ...la, email: e.target.value })} /><p className="hint">Te mandamos un enlace para publicarlo y otro para retirarlo cuando ya no haga falta.</p></div>
              <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true"><label htmlFor="la-web">Deja este campo vacío</label><input id="la-web" type="text" tabIndex={-1} autoComplete="off" value={la.web} onChange={(e) => setLa({ ...la, web: e.target.value })} /></div>
              <label className="check"><input type="checkbox" checked={la.priv} onChange={(e) => setLa({ ...la, priv: e.target.checked })} /> <span>Publico este avistamiento (foto, lugar y, si lo he puesto, mi teléfono) para que su familia o una protectora puedan encontrarlo. Caduca solo a los 60 días. He leído la <Link href="/privacidad">política de privacidad</Link>.</span></label>
              <button className="btn" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar el avistamiento"}</button>
              <div className={`ok${laOk ? " show" : ""}`}>{laOk}</div>
            </form>
          </div>
        )}
        {tab === "mapa" && (
          <div className="pform on">
            <div className="ptabs" role="group" aria-label="Qué mapa ver" style={{ marginTop: 6 }}>
              <button type="button" className="ptab" aria-pressed={modo === "ambos"} onClick={() => setModo("ambos")}>Los dos</button>
              <button type="button" className="ptab p" aria-pressed={modo === "perdido"} onClick={() => setModo("perdido")}>Mapa de perdidos</button>
              <button type="button" className="ptab a" aria-pressed={modo === "avistado"} onClick={() => setModo("avistado")}>Mapa de avistados</button>
              <input className="chip" type="search" placeholder="Ciudad o provincia" aria-label="Filtrar por ciudad" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontWeight: 600, fontSize: 14, border: "2px solid var(--tinta)", padding: "9px 14px", background: "var(--paper)", minWidth: 180 }} />
            </div>
            <div className="mapgrid">
              <div>
                <EsMap pins={pins} onPin={(id) => { setSel(id); document.getElementById("pa-" + id)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }} />
                <div className="maplegend"><span className="lp"><i />Perdido (se busca)</span><span className="la"><i />Avistado suelto</span><span className="lr"><i />Recogido, a salvo</span><span className="lh"><i />Ya en casa</span></div>
                <p className="small" style={{ fontSize: 13, color: "var(--ink-60)", marginTop: 10 }}>{carga === "cargando" ? "Cargando avisos…" : carga === "error" ? "No se han podido cargar los avisos. Prueba a recargar la página." : !activo ? "La publicación de avisos se está activando estos días." : "Cada aviso lo confirma por correo quien lo envía y caduca solo a los 60 días. Para retirar uno que no deba estar, escríbenos."}</p>
              </div>
              <div className="mapside">
                <div className="matchbox"><h2>Posibles coincidencias</h2><p className="small" style={{ margin: 0, fontSize: 13 }}>Cruzamos perdidos y avistados por cercanía, tamaño y fecha. Si alguno te cuadra, llama.</p>
                  {coinc.length ? coinc.map((m) => <div className="m" key={m.l.id + m.v.id}><span><b>{m.l.nombre}</b> ({m.l.ciudad}) y un perro {TAM[m.v.tam]} («{m.v.color}») visto a {m.km.toFixed(1)} km, {fmtFecha(m.v.fecha)}.{m.l.tel && <> <a href={`tel:${m.l.tel.replace(/\s/g, "")}`}>Avisar a su familia</a></>}</span></div>) : <div className="m">Ninguna coincidencia clara ahora mismo.</div>}
                </div>
                <div className="alerta"><h2>Avísame si hay avisos en mi zona</h2><div className="row"><select aria-label="Ciudad" value={al.c} onChange={(e) => setAl({ ...al, c: e.target.value })}><option value="">Ciudad…</option>{Object.keys(CITIES).map((c) => <option key={c} value={c}>{c}</option>)}</select><input type="email" placeholder="Tu correo" aria-label="Tu correo" autoComplete="email" value={al.m} onChange={(e) => setAl({ ...al, m: e.target.value })} /></div><div className="row"><button className="btn" type="button" onClick={alerta}>Activar aviso</button></div><p>{alOk}</p></div>
                <div className="rescard"><h2>Teléfonos y recursos</h2><dl><dt>112</dt><dd>Emergencias: perro herido, en carretera o en peligro.</dd><dt>062</dt><dd>Guardia Civil · SEPRONA: abandono y maltrato.</dd><dt>092</dt><dd>Policía local en la mayoría de ciudades: recogida de animales sueltos.</dd><dt>Chip</dt><dd>Cualquier veterinario lo lee gratis. Consulta por número en <a href="https://www.reiac.es" target="_blank" rel="noopener">REIAC</a> o en el registro de tu comunidad.</dd></dl></div>
              </div>
            </div>
            <div className="lcards">
              {list.length ? list.map((x) => (
                <article key={x.id} id={"pa-" + x.id} className={`lcard${sel === x.id ? " on" : ""}${x.resuelto ? " resuelto" : ""}`}>
                  <div className="im">{x.foto ? <img src={x.foto} alt={`Foto del aviso: ${x.color}`} loading="lazy" /> : <DogSil />}<span className={`st ${cls(x)}`}>{label(x)}{x.resuelto && ` · ${fmtFecha(x.resuelto).split(" · ")[0]}`}</span></div>
                  <div className="b">
                    <b>{x.tipo === "perdido" ? x.nombre || "Sin nombre" : x.estado === "recogido" ? "A salvo, busca a su familia" : "Visto suelto"}</b>
                    <p>{x.tipo === "perdido" && `${x.sexo} · `}{TAM[x.tam]} · {x.color}{x.collar && ` · ${x.collar}`}</p>
                    <div className="d">{x.lugar} · {x.ciudad}<br /><span style={{ color: "var(--ink-60)", fontWeight: 700, fontSize: 13 }}>{fmtFecha(x.fecha)}{x.dir && ` · iba ${x.dir.toLowerCase()}`}</span></div>
                    {x.notas && <div className="d" style={{ fontSize: 13 }}>{x.notas}</div>}
                    <div className="ct">
                      <button type="button" onClick={() => share(x)}>Compartir</button>
                      {x.tipo === "perdido" && !x.resuelto && <button type="button" onClick={() => printPoster(posterLost(x))}>Cartel</button>}
                                            {x.tel && <a href={`tel:${x.tel.replace(/\s/g, "")}`}>Llamar {x.tel}</a>}
                      <button type="button" onClick={() => { setSel(x.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Ver en el mapa</button>
                      {x.tipo === "perdido" && !x.resuelto && <button type="button" onClick={() => setTab("avistado")}>Lo he visto</button>}
                    </div>
                  </div>
                </article>)) : <div className="empty">{carga === "cargando" ? "Cargando avisos…" : "Nada publicado con ese filtro. Ojalá siga así."}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
