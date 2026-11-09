"use client";
import { useState } from "react";
import type { Dog, Protectora } from "@/lib/data";

/** Si el envío desde la web falla, abre el correo del visitante con el mensaje ya escrito. */
function mailtoFallback(subject: string, body: string) {
  return `mailto:info@xn--pelosyseales-hhb.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ContactForm({ d, p }: { d: Dog; p: Protectora }) {
  const [st, setSt] = useState<{ ok?: boolean; msg: string; mail?: string } | null>(null); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form);
    const body = { dog: d.id, prot: p.id, nombre: String(fd.get("nombre") || "").trim(), contacto: String(fd.get("contacto") || "").trim(), ciudad: String(fd.get("ciudad") || ""), casa: String(fd.get("casa") || ""), msg: String(fd.get("msg") || ""), priv: fd.get("priv") === "on", web: String(fd.get("web") || "") };
    if (!body.nombre || !body.contacto) { setSt({ msg: "Falta tu nombre o una forma de contactarte." }); return; }
    if (!body.priv) { setSt({ msg: "Marca el aviso de privacidad para que podamos enviar la consulta." }); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/consulta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      const mail = mailtoFallback(`Me interesa ${d.n} (${p.n})`, `Hola, me interesa conocer a ${d.n}, de ${p.n}.\n\n${body.msg}\n\nNombre: ${body.nombre}\nContacto: ${body.contacto}${body.ciudad ? "\nDónde vivo: " + body.ciudad : ""}\nCasa: ${body.casa}\n\nFicha: https://pelosysenales.es/perros/${d.id}`);
      if (!r.ok && r.status >= 500) { setSt({ msg: "No hemos podido enviarla desde la web. Pulsa el botón y se abrirá tu correo con la consulta ya escrita; nosotros se la pasamos a la protectora.", mail }); setBusy(false); return; }
      setSt(r.ok ? { ok: true, msg: `Consulta enviada a ${p.n}.${/@/.test(body.contacto) ? " Te hemos mandado un acuse de recibo a tu correo." : ""} Te contestarán ellos; enviar una consulta no reserva al perro.${j.simulated ? " (Entorno de pruebas: el correo se ha simulado.)" : ""}` } : { msg: j.error || "No se pudo enviar. Prueba de nuevo o escribe directamente a la protectora." });
      if (r.ok) form.reset();
    } catch { setSt({ msg: "No se pudo enviar. Prueba de nuevo o escribe directamente a la protectora." }); }
    setBusy(false);
  };
  return (
    <form className="form" id="consulta" onSubmit={submit} noValidate style={{ position: "relative" }}>
      <h2>Me interesa conocer a {d.n}</h2>
      <p className="small">{p.mail ? <>Esta consulta va directamente a <b>{p.n}</b>.</> : <>Esta consulta nos llega a nosotros y se la pasamos a <b>{p.n}</b> enseguida.</>} Te pedimos solo lo necesario para que puedan contestarte; ellos valoran cada caso y deciden. Enviar una consulta no reserva al perro.</p>
      <div className="row"><div className="fld"><label htmlFor="c-nombre">Tu nombre</label><input id="c-nombre" name="nombre" type="text" autoComplete="name" required /></div><div className="fld"><label htmlFor="c-contacto">Teléfono o email</label><input id="c-contacto" name="contacto" type="text" autoComplete="tel" required /></div></div>
      <div className="row"><div className="fld"><label htmlFor="c-ciudad">Dónde vives</label><input id="c-ciudad" name="ciudad" type="text" placeholder="Ciudad o barrio" /></div><div className="fld"><label htmlFor="c-casa">Tu casa</label><select id="c-casa" name="casa" defaultValue="Piso"><option>Piso</option><option>Casa con patio</option><option>Otra</option></select></div></div>
      <div className="fld"><label htmlFor="c-msg">Cuéntales por qué te interesa y con quién vives</label><textarea id="c-msg" name="msg" placeholder="Horarios, otros animales, niños, experiencia con perros…" /></div>
      <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true"><label htmlFor="c-web">Deja este campo vacío</label><input id="c-web" name="web" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="check"><input name="priv" type="checkbox" /> <span>He leído la <a href="/privacidad">política de privacidad</a>: mis datos se envían solo a esta protectora para atender mi consulta y puedo pedir que los borren.</span></label>
      <button className="btn coral" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar la consulta a la protectora"}</button>
      {st && <div className={`ok show`} style={st.ok ? undefined : { background: "var(--coral)", color: "var(--crema)" }} role="status">{st.msg}{st.mail && <><br /><a className="btn" style={{ marginTop: 12 }} href={st.mail}>Enviarla desde mi correo</a></>}</div>}
    </form>
  );
}
