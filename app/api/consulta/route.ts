import { NextResponse } from "next/server";
import { ACT_TXT } from "@/lib/data";
import { getCatalog, getDogIn } from "@/lib/catalog";
import { sendMail, notifyWebhook, layout, row, esc, TEAM, SITE } from "@/lib/mail";
import { rateLimit, ipOf } from "@/lib/guard";

/**
 * Consulta de una familia sobre un perro. Se valida, se envía a la protectora (o al equipo, mientras
 * SEND_TO_PROTECTORAS no sea "true"), se acusa recibo a la familia si dejó un correo y se avisa al webhook.
 * Solo los datos mínimos (RGPD). El campo "web" es un cebo para bots: si viene relleno, se ignora en silencio.
 */
export async function POST(req: Request) {
  if (!(await rateLimit("consulta:" + ipOf(req)))) return NextResponse.json({ error: "Demasiadas consultas seguidas. Espera unos minutos." }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  if (String(body.web || "")) return NextResponse.json({ ok: true }); // honeypot
  const cat = await getCatalog(); const dog = getDogIn(cat, String(body.dog || "")); const prot = dog && cat.prot[dog.prot];
  const nombre = String(body.nombre || "").trim().slice(0, 120);
  const contacto = String(body.contacto || "").trim().slice(0, 160);
  const ciudad = String(body.ciudad || "").trim().slice(0, 120);
  const casa = String(body.casa || "").trim().slice(0, 40);
  const msg = String(body.msg || "").trim().slice(0, 2000);
  if (!dog || !prot) return NextResponse.json({ error: "Ese perro ya no está publicado." }, { status: 404 });
  if (!nombre || !contacto) return NextResponse.json({ error: "Falta tu nombre o una forma de contactarte." }, { status: 400 });
  if (body.priv !== true) return NextResponse.json({ error: "Hace falta aceptar el aviso de privacidad." }, { status: 400 });
  if (dog.estado === "adoptado") return NextResponse.json({ error: `${dog.n} ya ha sido adoptado.` }, { status: 409 });

  const ficha = `${SITE}/perros/${dog.id}`;
  const toProt = process.env.SEND_TO_PROTECTORAS === "true" && prot.mail ? [prot.mail, TEAM] : [TEAM];
  const esMail = /@/.test(contacto);
  const html = layout(`Consulta por ${dog.n}`, `
    <p>Una familia quiere conocer a <b>${esc(dog.n)}</b> (${esc(dog.raza)}, ${esc(ACT_TXT[dog.act].toLowerCase())}). Os llega desde la web de Pelos y Señales; la valoración y la decisión son vuestras.</p>
    <table style="border-collapse:collapse;margin:14px 0">${row("Nombre", nombre)}${row("Contacto", contacto)}${ciudad ? row("Dónde vive", ciudad) : ""}${casa ? row("Casa", casa) : ""}${msg ? row("Mensaje", msg) : ""}</table>
    <p><a href="${ficha}" style="color:#161616;font-weight:800">Ver la ficha de ${esc(dog.n)}</a></p>
    <p style="font-size:13px;opacity:.7">Si la ficha está desfasada (adoptado, reservado, en proceso), respondednos a este correo y la actualizamos.</p>`);
  const r1 = await sendMail({ to: toProt, subject: `Consulta por ${dog.n} · ${prot.n}`, html, replyTo: esMail ? contacto : undefined });
  if (!r1.ok) return NextResponse.json({ error: "Ahora mismo no podemos enviarlo desde la web. Escríbenos a infopelosysenales@gmail.com o llámanos al +34 635 025 378 y te ponemos en contacto con la protectora." }, { status: 502 });

  if (esMail) {
    await sendMail({ to: contacto, subject: `Hemos pasado tu consulta por ${dog.n} a ${prot.n}`, html: layout(`Tu consulta por ${dog.n} ya está en manos de ${prot.n}`, `
      <p>Hola, ${esc(nombre)}. Hemos enviado tu mensaje a <b>${esc(prot.n)}</b>${prot.ciudad ? ` (${esc(prot.ciudad)})` : ""}. Ellos valoran cada caso y te contestarán directamente; enviar una consulta no reserva al perro.</p>
      ${prot.tel ? `<p>Si quieres adelantar, puedes llamarles al <b>${esc(prot.tel)}</b>${prot.horas ? ` (${esc(prot.horas)})` : ""}.</p>` : ""}
      <p><a href="${ficha}" style="color:#161616;font-weight:800">Volver a la ficha de ${esc(dog.n)}</a></p>
      <p style="font-size:13px;opacity:.7">Tus datos solo se han enviado a esa protectora para atender tu consulta. Para que los borremos, responde a este correo.</p>`) });
  }
  await notifyWebhook("consulta", { fecha: new Date().toISOString(), perro: dog.id, protectora: prot.id, nombre, contacto, ciudad, casa, msg, simulado: !!r1.simulated });
  return NextResponse.json({ ok: true, simulated: !!r1.simulated });
}
