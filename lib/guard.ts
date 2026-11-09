import { createHmac, timingSafeEqual } from "crypto";
import { kvPipe } from "./kv";

/** Límite por IP con ventana fija, compartido entre instancias a través del almacén (o en memoria en desarrollo). */
export async function rateLimit(key: string, max = 6, windowSec = 600) {
  try {
    const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
    const [n] = (await kvPipe([["INCR", k], ["EXPIRE", k, windowSec]])) as number[];
    return Number(n) <= max;
  } catch (e) { console.error("[rateLimit]", e); return !key.startsWith("admlogin:"); } // el login falla cerrado
}
export function ipOf(req: Request) { return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local"; }
export const isEmail = (s: string) => /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 160;

/** Clave para firmar enlaces (confirmaciones, gestión de avisos, bajas). Obligatoria en producción. */
function secret() {
  const s = process.env.ALERTAS_SECRET;
  if (s && s.length >= 24) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Falta ALERTAS_SECRET (mínimo 24 caracteres) en las variables de entorno.");
  return "solo-para-desarrollo-local-no-usar-en-produccion";
}
/** Huella secreta derivada de la clave del servidor: no permite adivinar el valor de origen sin conocer ALERTAS_SECRET. */
export const hmacHex = (label: string, value: string) => createHmac("sha256", secret()).update(label + ":" + value).digest("hex");
/** Token firmado: base64url(JSON) + "." + HMAC. Caduca a los `days` días. */
export function sign(payload: Record<string, unknown>) {
  const data = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}
export function verify(token: string, days = 7): Record<string, unknown> | null {
  const [data, sig] = String(token || "").split("."); if (!data || !sig) return null;
  const exp = createHmac("sha256", secret()).update(data).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(exp); if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(data, "base64url").toString()); if (typeof p.ts !== "number" || Date.now() - p.ts > days * 24 * 3600 * 1000) return null; return p; } catch { return null; }
}
// Compatibilidad con las alertas de perros
export const signAlert = (p: Record<string, unknown>) => sign({ ...p, a: "alerta" });
export const verifyAlert = (t: string) => { const p = verify(t, 7); return p && p.a === "alerta" ? p : null; };
