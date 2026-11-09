import { NextResponse } from "next/server";
import { verifyAlert, rateLimit, ipOf } from "@/lib/guard";
import { kvPipe } from "@/lib/kv";
import { createHash } from "crypto";
import { sendMail, notifyWebhook, layout, esc, TEAM, SITE } from "@/lib/mail";

/** Confirma el alta: verifica la firma, avisa al equipo y al webhook, y lleva a la persona al listado con un aviso. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!(await rateLimit("alertaok:" + ipOf(req), 10))) return NextResponse.redirect(`${SITE}/perros?alerta=ok`);
  const p = verifyAlert(t);
  if (!p) return NextResponse.redirect(`${SITE}/perros?alerta=caducada`);
  // Cada enlace avisa al equipo una sola vez, aunque se abra muchas veces (o lo abra el antivirus del correo).
  try {
    const k = "alerta:usada:" + createHash("sha256").update(t).digest("hex").slice(0, 32);
    const [r] = (await kvPipe([["SET", k, "1", "EX", 8 * 24 * 3600, "NX"]])) as (string | null)[];
    if (r !== "OK") return NextResponse.redirect(`${SITE}/perros?alerta=ok`);
  } catch (e) { console.error("[alerta/confirmar]", e); }
  const email = String(p.email); const life = JSON.stringify(p.life || {});
  await notifyWebhook("alerta", { fecha: new Date().toISOString(), email, life });
  await sendMail({ to: TEAM, subject: `Nueva alerta confirmada · ${email}`, html: layout("Alta de alerta", `<p><b>${esc(email)}</b> quiere que le avisemos cuando entre un perro afín.</p><p style="font-size:13px"><code>${esc(life)}</code></p>`) });
  return NextResponse.redirect(`${SITE}/perros?alerta=ok`);
}
