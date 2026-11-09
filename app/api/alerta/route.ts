import { NextResponse } from "next/server";
import { sendMail, layout, esc, SITE } from "@/lib/mail";
import { rateLimit, ipOf, isEmail, signAlert } from "@/lib/guard";

/**
 * Alta en «avísame cuando entre un perro que encaje». Doble confirmación: se envía un enlace firmado al correo;
 * el alta solo cuenta cuando la persona lo pulsa (ver ./confirmar). Sin base de datos: el token lleva los datos.
 */
export async function POST(req: Request) {
  if (!(await rateLimit("alerta:" + ipOf(req), 4))) return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  if (!isEmail(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  const life = typeof body.life === "object" && body.life ? body.life : {};
  if (JSON.stringify(life).length > 2000) return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  let token: string;
  try { token = signAlert({ email, life }); } catch (e) { console.error("[alerta]", e); return NextResponse.json({ error: "Las alertas se están activando. Vuelve a intentarlo en unos días." }, { status: 503 }); }
  const url = `${SITE}/api/alerta/confirmar?t=${encodeURIComponent(token)}`;
  const r = await sendMail({ to: email, subject: "Confirma tu alerta de Pelos y Señales", html: layout("Un clic y te avisamos", `
    <p>Has pedido que te avisemos cuando entre un perro que encaje con lo que nos has contado. Para activarlo, confirma que este correo es tuyo:</p>
    <p style="margin:22px 0"><a href="${url}" style="display:inline-block;background:#161616;color:#F4ECDC;text-decoration:none;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:13px;padding:14px 22px;border-radius:999px">Activar mi alerta</a></p>
    <p style="font-size:13px;opacity:.7">Si no has sido tú, ignora este correo: no se activará nada. El enlace caduca en siete días. Puedes darte de baja cuando quieras escribiendo a info@pelosyseñales.com.</p>`) });
  if (!r.ok) return NextResponse.json({ error: "No se pudo enviar el correo de confirmación." }, { status: 502 });
  return NextResponse.json({ ok: true, simulated: !!r.simulated, ...(r.simulated ? { debugUrl: url } : {}) });
}
