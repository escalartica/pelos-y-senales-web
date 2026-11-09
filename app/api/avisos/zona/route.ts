import { NextResponse } from "next/server";
import { rateLimit, ipOf, isEmail, sign, verify } from "@/lib/guard";
import { suscribir, baja } from "@/lib/avisos-server";
import { sendMail, layout, esc, SITE } from "@/lib/mail";
import { CITIES } from "@/lib/spain";

export const dynamic = "force-dynamic";
/** Alta en avisos por zona: doble confirmación por correo. */
export async function POST(req: Request) {
  if (!(await rateLimit("zona:" + ipOf(req), 4))) return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  const email = String(b.email || "").trim().toLowerCase(); const ciudad = String(b.ciudad || "");
  if (!isEmail(email) || !Object.hasOwn(CITIES, ciudad)) return NextResponse.json({ error: "Elige una ciudad y escribe un correo válido." }, { status: 400 });
  let url: string;
  try { url = `${SITE}/api/avisos/zona?alta=${encodeURIComponent(sign({ email, ciudad, a: "zona" }))}`; } catch (e) { console.error("[zona]", e); return NextResponse.json({ error: "Los avisos por zona se están activando. Vuelve a intentarlo en unos días." }, { status: 503 }); }
  const r = await sendMail({ to: email, subject: "Confirma tus avisos de perros perdidos", html: layout("Un clic y te avisamos", `
    <p>Has pedido que te escribamos cuando alguien publique un perro perdido o visto suelto cerca de <b>${esc(ciudad)}</b>. Confírmalo aquí:</p>
    <p style="margin:22px 0"><a href="${url}" style="display:inline-block;background:#161616;color:#F4ECDC;text-decoration:none;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:13px;padding:14px 22px;border-radius:999px">Activar avisos</a></p>
    <p style="font-size:13px;opacity:.7">Si no has sido tú, ignora este correo. Cada aviso que te enviemos lleva un enlace para darte de baja.</p>`) });
  if (!r.ok) return NextResponse.json({ error: "No se pudo enviar el correo de confirmación." }, { status: 502 });
  return NextResponse.json({ ok: true, ...(r.simulated && process.env.NODE_ENV !== "production" ? { debugUrl: url } : {}) });
}
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const alta = q.get("alta"), bajaT = q.get("baja");
  if (alta) { const p = verify(alta, 7); if (!p || p.a !== "zona") return NextResponse.redirect(`${SITE}/perdidos?zona=caducado`); const c = Object.hasOwn(CITIES, String(p.ciudad)) ? CITIES[String(p.ciudad)] : undefined; if (!c) return NextResponse.redirect(`${SITE}/perdidos?zona=caducado`); await suscribir(String(p.email), String(p.ciudad), c[0], c[1]); return NextResponse.redirect(`${SITE}/perdidos?zona=ok`); }
  if (bajaT) { const p = verify(bajaT, 3650); if (p && p.a === "baja") await baja(String(p.email)); return NextResponse.redirect(`${SITE}/perdidos?zona=baja`); }
  return NextResponse.redirect(`${SITE}/perdidos`);
}
