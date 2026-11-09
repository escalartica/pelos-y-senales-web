import { NextResponse } from "next/server";
import { sendMail, notifyWebhook, layout, row, esc, TEAM } from "@/lib/mail";
import { rateLimit, ipOf, isEmail } from "@/lib/guard";

/** Mensaje general (protectoras, colaboradores, entidades del mapa, prensa). Llega al buzón del equipo. */
export async function POST(req: Request) {
  if (!(await rateLimit("contacto:" + ipOf(req), 5))) return NextResponse.json({ error: "Demasiados mensajes seguidos. Espera unos minutos." }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  if (String(body.web || "")) return NextResponse.json({ ok: true }); // cebo para bots
  const nombre = String(body.nombre || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const tel = String(body.tel || "").trim().slice(0, 40);
  const tipo = String(body.tipo || "").trim().slice(0, 120);
  const msg = String(body.msg || "").trim().slice(0, 3000);
  if (!nombre || !msg) return NextResponse.json({ error: "Faltan tu nombre o el mensaje." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  if (body.priv !== true) return NextResponse.json({ error: "Hace falta aceptar la política de privacidad." }, { status: 400 });

  const r = await sendMail({ to: TEAM, subject: `Contacto web · ${tipo || "mensaje"} · ${nombre}`.replace(/[\r\n\t]+/g, " "), replyTo: email, html: layout(`Mensaje de ${nombre}`, `
    <table style="border-collapse:collapse;margin:0 0 14px">${row("Sobre", tipo)}${row("Nombre", nombre)}${row("Correo", email)}${tel ? row("Teléfono", tel) : ""}</table>
    <p style="white-space:pre-wrap">${esc(msg)}</p>`) });
  if (!r.ok) return NextResponse.json({ error: "Ahora mismo no podemos enviarlo desde la web. Escríbenos a info@pelosyseñales.com o llámanos al +34 635 025 378." }, { status: 502 });
  await notifyWebhook("contacto", { fecha: new Date().toISOString(), nombre, email, tel, tipo, msg });
  return NextResponse.json({ ok: true });
}
