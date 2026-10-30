import { NextResponse } from "next/server";
import { COOKIE, adminConfigured, cookieOpts, passwordOk, sessionToken } from "@/lib/admin";
import { rateLimit, ipOf } from "@/lib/guard";

/** Entrar (POST) y salir (DELETE) del panel. Máximo 5 intentos cada 15 minutos por conexión. */
export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "El panel aún no tiene contraseña. Añade ADMIN_PASSWORD en Vercel y vuelve a desplegar." }, { status: 503 });
  if (!(await rateLimit("admlogin:" + ipOf(req), 5, 900))) return NextResponse.json({ error: "Demasiados intentos. Espera 15 minutos." }, { status: 429 });
  let b: { password?: string } = {};
  try { b = await req.json(); } catch { /* vacío */ }
  if (!passwordOk(String(b.password || ""))) return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionToken(), cookieOpts);
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}
