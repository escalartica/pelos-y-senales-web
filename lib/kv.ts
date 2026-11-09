/**
 * Almacén clave-valor para lo que la gente publica (perdidos, avistados, avisos por zona) y para el límite por IP.
 * En producción usa Upstash Redis por su API REST (sin SDK): variables KV_REST_API_URL + KV_REST_API_TOKEN
 * (las crea la integración de Upstash en Vercel) o UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 * Sin esas variables funciona en memoria: vale para desarrollo, pero NO guarda nada entre despliegues.
 */
type Cmd = (string | number)[];
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const kvConfigured = () => !!(URL_ && TOKEN);

async function remote(cmds: Cmd[]): Promise<unknown[]> {
  const r = await fetch(`${URL_}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(cmds), cache: "no-store" });
  if (!r.ok) throw new Error(`KV ${r.status}`);
  const j = (await r.json()) as { result?: unknown; error?: string }[];
  return j.map((x) => { if (x.error) throw new Error(x.error); return x.result; });
}

/* ---- Memoria (desarrollo) ---- */
type Entry = { v: unknown; exp?: number };
const mem: Map<string, Entry> = (globalThis as unknown as { __pysMem?: Map<string, Entry> }).__pysMem ?? new Map();
(globalThis as unknown as { __pysMem?: Map<string, Entry> }).__pysMem = mem;
function g(k: string) { const e = mem.get(k); if (!e) return undefined; if (e.exp && e.exp < Date.now()) { mem.delete(k); return undefined; } return e; }
function local(c: Cmd): unknown {
  const [op, k, ...a] = c.map(String); const O = op.toUpperCase();
  switch (O) {
    case "GET": return (g(k)?.v as string) ?? null;
    case "SET": { if (a.includes("NX") && g(k)) return null; const i = a.indexOf("EX"); const keep = a.includes("KEEPTTL") ? g(k)?.exp : undefined; mem.set(k, { v: a[0], exp: i >= 0 ? Date.now() + Number(a[i + 1]) * 1000 : keep }); return "OK"; }
    case "DEL": return mem.delete(k) ? 1 : 0;
    case "EXPIRE": { const e = g(k); if (!e) return 0; e.exp = Date.now() + Number(a[0]) * 1000; return 1; }
    case "INCR": { const e = g(k); const n = Number(e?.v ?? 0) + 1; mem.set(k, { v: String(n), exp: e?.exp }); return n; }
    case "INCRBY": { const e = g(k); const n = Number(e?.v ?? 0) + Number(a[0]); mem.set(k, { v: String(n), exp: e?.exp }); return n; }
    case "ZADD": { const e = g(k) ?? { v: new Map<string, number>() }; (e.v as Map<string, number>).set(a[1], Number(a[0])); mem.set(k, e); return 1; }
    case "ZREM": { const z = g(k)?.v as Map<string, number> | undefined; return z?.delete(a[0]) ? 1 : 0; }
    case "ZREVRANGE": { const z = g(k)?.v as Map<string, number> | undefined; if (!z) return []; return [...z.entries()].sort((x, y) => y[1] - x[1]).map((x) => x[0]).slice(Number(a[0]), Number(a[1]) + 1); }
    case "ZREMRANGEBYRANK": { const z = g(k)?.v as Map<string, number> | undefined; if (!z) return 0; const ks = [...z.entries()].sort((x, y) => x[1] - y[1]).map((x) => x[0]); const st = Number(a[0]), en = Number(a[1]) < 0 ? ks.length + Number(a[1]) : Number(a[1]); let n = 0; ks.slice(st, en + 1).forEach((m) => { z.delete(m); n++; }); return n; }
    case "ZCARD": { const z = g(k)?.v as Map<string, number> | undefined; return z ? z.size : 0; }
    case "HSET": { const e = g(k) ?? { v: new Map<string, string>() }; (e.v as Map<string, string>).set(a[0], a[1]); mem.set(k, e); return 1; }
    case "HDEL": { const h = g(k)?.v as Map<string, string> | undefined; return h?.delete(a[0]) ? 1 : 0; }
    case "HGETALL": { const h = g(k)?.v as Map<string, string> | undefined; return h ? [...h.entries()].flat() : []; }
    case "MGET": return [k, ...a].map((x) => (g(x)?.v as string) ?? null);
    default: throw new Error("KV local: " + O);
  }
}

export async function kv<T = unknown>(...cmd: Cmd): Promise<T> {
  if (kvConfigured()) return (await remote([cmd]))[0] as T;
  return local(cmd) as T;
}
export async function kvPipe(cmds: Cmd[]): Promise<unknown[]> {
  if (kvConfigured()) return remote(cmds);
  return cmds.map(local);
}
