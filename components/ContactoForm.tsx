"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** Si el envío desde la web falla, abre el correo del visitante con el mensaje ya escrito. */
function mailtoFallback(subject: string, body: string) {
  return `mailto:infopelosysenales@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const TIPOS = ["Soy una protectora o un centro", "Quiero añadir o corregir una entidad del mapa", "Tengo una clínica, tienda o peluquería", "Quiero acoger la exposición", "Quiero ser madrina, padrino o voluntario", "Prensa o instituciones", "Otra cosa"];

/** Formulario general de contacto: llega al buzón del equipo. Datos mínimos, aviso de privacidad y campo cebo. */
export default function ContactoForm({ tipo = "", titulo = "Escríbenos" }: { tipo?: string; titulo?: string }) {
  const [st, setSt] = useState<{ ok?: boolean; msg: string; mail?: string } | null>(null); const [busy, setBusy] = useState(false);
  const sel = useRef<HTMLSelectElement>(null);
  useEffect(() => { const t = new URLSearchParams(location.search).get("tipo"); const m: Record<string, string> = { mapa: TIPOS[1], placa: TIPOS[2], expo: TIPOS[3], madrina: TIPOS[4] }; if (t && m[t] && sel.current) sel.current.value = m[t]; }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form);
    const body = { nombre: String(fd.get("nombre") || "").trim(), email: String(fd.get("email") || "").trim(), tel: String(fd.get("tel") || "").trim(), tipo: String(fd.get("tipo") || ""), msg: String(fd.get("msg") || "").trim(), priv: fd.get("priv") === "on", web: String(fd.get("web") || "") };
    if (!body.nombre || !body.email || !body.msg) { setSt({ msg: "Faltan tu nombre, tu correo o el mensaje." }); return; }
    if (!body.priv) { setSt({ msg: "Marca que has leído la política de privacidad para poder enviarlo." }); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/contacto", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      const mail = mailtoFallback(`${body.tipo} · ${body.nombre}`, `${body.msg}\n\n${body.nombre}\n${body.email}${body.tel ? "\n" + body.tel : ""}`);
      setSt(r.ok ? { ok: true, msg: "Mensaje enviado. Te contestaremos lo antes posible." } : { msg: r.status >= 500 ? "No hemos podido enviarlo desde la web. Pulsa el botón y se abrirá tu correo con el mensaje ya escrito, o llámanos al +34 635 025 378." : j.error || "No se pudo enviar.", mail: r.status >= 500 ? mail : undefined });
      if (r.ok) form.reset();
    } catch { setSt({ msg: "No se pudo enviar. Escríbenos a infopelosysenales@gmail.com." }); }
    setBusy(false);
  };
  return (
    <form className="form" onSubmit={submit} noValidate style={{ position: "relative" }} aria-label={titulo}>
      <h3 style={{ margin: 0 }}>{titulo}</h3>
      <div className="row"><div className="fld"><label htmlFor="ct-nombre">Nombre</label><input id="ct-nombre" name="nombre" type="text" autoComplete="name" required /></div><div className="fld"><label htmlFor="ct-email">Correo</label><input id="ct-email" name="email" type="email" autoComplete="email" required /></div></div>
      <div className="row"><div className="fld"><label htmlFor="ct-tel">Teléfono (opcional)</label><input id="ct-tel" name="tel" type="tel" autoComplete="tel" /></div><div className="fld"><label htmlFor="ct-tipo">Sobre qué</label><select ref={sel} id="ct-tipo" name="tipo" defaultValue={tipo || TIPOS[0]}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></div></div>
      <div className="fld"><label htmlFor="ct-msg">Mensaje</label><textarea id="ct-msg" name="msg" required maxLength={3000} /></div>
      <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true"><label htmlFor="ct-web">Deja este campo vacío</label><input id="ct-web" name="web" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="check"><input name="priv" type="checkbox" /> <span>He leído la <Link href="/privacidad">política de privacidad</Link>. Usaréis mis datos solo para contestarme.</span></label>
      <button className="btn" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar"}</button>
      {st && <div className="ok show" style={st.ok ? undefined : { background: "var(--coral)", color: "var(--tinta)" }} role="status">{st.msg}{st.mail && <><br /><a className="btn" style={{ marginTop: 12 }} href={st.mail}>Enviarlo desde mi correo</a></>}</div>}
    </form>
  );
}
