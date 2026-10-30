import { NextResponse } from "next/server";
import { verifyAlert } from "@/lib/guard";
import { sendMail, notifyWebhook, layout, esc, TEAM, SITE } from "@/lib/mail";

/** Confirma el alta: verifica la firma, avisa al equipo y al webhook, y lleva a la persona al listado con un aviso. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  const p = verifyAlert(t);
  if (!p) return NextResponse.redirect(`${SITE}/perros?alerta=caducada`);
  const email = String(p.email); const life = JSON.stringify(p.life || {});
  await notifyWebhook("alerta", { fecha: new Date().toISOString(), email, life });
  await sendMail({ to: TEAM, subject: `Nueva alerta confirmada · ${email}`, html: layout("Alta de alerta", `<p><b>${esc(email)}</b> quiere que le avisemos cuando entre un perro afín.</p><p style="font-size:13px"><code>${esc(life)}</code></p>`) });
  return NextResponse.redirect(`${SITE}/perros?alerta=ok`);
}
