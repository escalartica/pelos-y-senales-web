import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sign, verify } from "./guard";

/**
 * Acceso al panel de administración. La contraseña vive solo en Vercel (variable ADMIN_PASSWORD, mínimo 10 caracteres).
 * Al entrar se guarda una cookie firmada (httpOnly, segura, 12 horas). Si se cambia la contraseña, todas las sesiones caducan.
 */
export const COOKIE = "pys_adm";
const HORAS = 12;
const pass = () => process.env.ADMIN_PASSWORD || "";
export const adminConfigured = () => pass().length >= 10 || (process.env.NODE_ENV !== "production" && pass().length > 0);
const huella = () => createHash("sha256").update("pys-admin:" + pass()).digest("hex").slice(0, 16);

export function passwordOk(input: string) {
  if (!adminConfigured()) return false;
  const a = createHash("sha256").update(String(input)).digest(), b = createHash("sha256").update(pass()).digest();
  return timingSafeEqual(a, b);
}
export const sessionToken = () => sign({ a: "adm", h: huella() });
export const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: HORAS * 3600 };

function tokenOk(t?: string) {
  if (!t || !adminConfigured()) return false;
  const p = verify(t, HORAS / 24);
  return !!p && p.a === "adm" && p.h === huella();
}

/** Para páginas de servidor. */
export async function isAdmin() { return tokenOk((await cookies()).get(COOKIE)?.value); }

/** Para las rutas de la API: comprueba la sesión y, en escrituras, que la petición venga de nuestra propia web. */
export async function guardAdmin(req: Request): Promise<NextResponse | null> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Tu sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  if (req.method !== "GET") {
    const origin = req.headers.get("origin"); const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  return null;
}
