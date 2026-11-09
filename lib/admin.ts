import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sign, verify, hmacHex } from "./guard";

/**
 * Acceso al panel de administración. La contraseña vive solo en Vercel (variable ADMIN_PASSWORD, mínimo 10 caracteres).
 * Al entrar se guarda una cookie firmada (httpOnly, segura, 12 horas; o 30 días si se marca «mantener la sesión en este dispositivo»).
 * Si se cambia la contraseña (o ALERTAS_SECRET), todas las sesiones caducan, y también el enlace privado del calendario.
 */
export const COOKIE = "pys_adm";
const HORAS = 12;
const DIAS_RECORDAR = 30;
const pass = () => process.env.ADMIN_PASSWORD || "";
export const adminConfigured = () => pass().length >= 10 || (process.env.NODE_ENV !== "production" && pass().length > 0);
const huella = () => hmacHex("pys-admin", pass()).slice(0, 32);

export function passwordOk(input: string) {
  if (!adminConfigured()) return false;
  const a = createHash("sha256").update(String(input)).digest(), b = createHash("sha256").update(pass()).digest();
  return timingSafeEqual(a, b);
}
/** Duración de la sesión en horas: 12 por defecto, 30 días si se pide recordar el dispositivo. */
export const horasSesion = (recordar = false) => (recordar ? DIAS_RECORDAR * 24 : HORAS);
export const sessionToken = (recordar = false) => sign({ a: "adm", h: huella(), hs: horasSesion(recordar) });
export const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: HORAS * 3600 };

function tokenOk(t?: string) {
  if (!t || !adminConfigured()) return false;
  const p = verify(t, DIAS_RECORDAR);
  if (!p || p.a !== "adm" || p.h !== huella()) return false;
  const hs = typeof p.hs === "number" ? Math.min(p.hs, DIAS_RECORDAR * 24) : HORAS;
  return Date.now() - (p.ts as number) <= hs * 3600 * 1000;
}

/** Clave del enlace privado del calendario (suscripción desde Google Calendar o el iPhone). Cambia si cambia la contraseña. */
export const calToken = () => hmacHex("pys-calendario", pass()).slice(0, 32);
export function calTokenOk(t: string) {
  if (!adminConfigured() || !/^[a-f0-9]{32}$/.test(t)) return false;
  return timingSafeEqual(Buffer.from(t), Buffer.from(calToken()));
}

/** Para páginas de servidor. */
export async function isAdmin() { return tokenOk((await cookies()).get(COOKIE)?.value); }

/** Para las rutas de la API: comprueba la sesión y, en escrituras, que la petición venga de nuestra propia web. */
export async function guardAdmin(req: Request): Promise<NextResponse | null> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Tu sesión ha caducado. Vuelve a entrar." }, { status: 401 });
  if (req.method !== "GET") {
    const origin = req.headers.get("origin"); const host = req.headers.get("host");
    let mismo = false; try { mismo = !!origin && !!host && new URL(origin).host === host; } catch { mismo = false; }
    if (origin && !mismo) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  return null;
}
