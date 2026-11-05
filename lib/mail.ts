/**
 * Envío de correo con Resend (API REST, sin SDK). Si no hay RESEND_API_KEY, se simula:
 * se registra en consola y se devuelve ok para que la web funcione igual en desarrollo.
 */
export interface Mail { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string }
export const FROM = process.env.MAIL_FROM || "Pelos y Señales <hola@pelosysenales.es>";
export const TEAM = process.env.CONSULTAS_TO || "infopelosysenales@gmail.com";
export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xn--pelosyseales-hhb.com";

export async function sendMail(m: Mail): Promise<{ ok: boolean; simulated?: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") { console.error("[mail] Falta RESEND_API_KEY: no se ha enviado", m.subject); return { ok: false, error: "Correo sin configurar" }; }
    console.log("[mail simulado]", JSON.stringify({ to: m.to, subject: m.subject })); return { ok: true, simulated: true };
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM, to: Array.isArray(m.to) ? m.to : [m.to], subject: m.subject, html: m.html, text: m.text || toText(m.html), reply_to: m.replyTo }),
  });
  if (!r.ok) { const t = await r.text(); console.error("[mail] error", r.status, t); return { ok: false, error: `Resend ${r.status}` }; }
  const j = (await r.json()) as { id?: string };
  return { ok: true, id: j.id };
}

/** Aviso opcional a un webhook (Make, Zapier, Apps Script → hoja de cálculo) para llevar el registro de consultas y altas. */
export async function notifyWebhook(kind: string, payload: Record<string, unknown>) {
  const url = process.env.CONSULTAS_WEBHOOK_URL; if (!url) return;
  try { await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, ...payload }) }); } catch (e) { console.error("[webhook]", e); }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Plantilla sencilla con la marca: papel crema, tinta, un acento mostaza. */
export function layout(title: string, body: string, foot = "Pelos y Señales · Fotografía para adoptar · No entregamos animales ni cobramos por la adopción.") {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#FBF7EE;font-family:Manrope,Helvetica,Arial,sans-serif;color:#161616">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
  <div style="font-weight:800;letter-spacing:.2em;font-size:11px;text-transform:uppercase;color:#161616;opacity:.7;margin-bottom:18px">Pelos y Señales</div>
  <div style="background:#F4ECDC;border:2px solid #161616;border-radius:22px;padding:26px 24px">
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.1;margin:0 0 14px">${esc(title)}</h1>
    <div style="font-size:15px;line-height:1.55">${body}</div>
  </div>
  <p style="font-size:12px;color:#5a5a5a;margin-top:18px;line-height:1.5">${esc(foot)}</p>
</div></body></html>`;
}
export function row(k: string, v: string) { return `<tr><td style="padding:6px 10px 6px 0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;opacity:.6;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;font-size:15px">${esc(v)}</td></tr>`; }
export { esc };

/** Versión en texto plano del correo: los filtros antispam desconfían de los correos que solo traen HTML. */
function toText(html?: string) {
  if (!html) return undefined;
  return html.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)").replace(/<(br|\/p|\/tr|\/h1|\/h2|\/div)[^>]*>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}
