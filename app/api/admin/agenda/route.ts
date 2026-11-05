import { NextResponse } from "next/server";
import { calToken, guardAdmin } from "@/lib/admin";
import { kv, kvPipe, kvConfigured } from "@/lib/kv";
import { AGENDA_EV, eventosAgenda } from "@/lib/agenda-store";
import { CLAVE_RE, limpiarEv, limpiarPlan, type Plan } from "@/lib/agenda";

export const dynamic = "force-dynamic";
const EV = AGENDA_EV;
const PL = (k: string) => `agenda:pl:${k}`;
const NO_CACHE = { "cache-control": "no-store" };

const todos = eventosAgenda;

/** GET: todos los eventos. Con ?pl=clave1,clave2 devuelve además esos planificadores. */
export async function GET(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  const claves = (new URL(req.url).searchParams.get("pl") || "").split(",").filter((k) => CLAVE_RE.test(k)).slice(0, 20);
  if (claves.length) {
    const vals = (await kvPipe(claves.map((k) => ["GET", PL(k)]))) as (string | null)[];
    const pl: Record<string, Plan> = {};
    claves.forEach((k, i) => { try { pl[k] = vals[i] ? JSON.parse(vals[i] as string) : {}; } catch { pl[k] = {}; } });
    return NextResponse.json({ pl }, { headers: NO_CACHE });
  }
  return NextResponse.json({ evs: await todos(), kv: kvConfigured(), cal: `/api/calendario/${calToken()}/agenda.ics` }, { headers: NO_CACHE });
}

/** PUT: guarda un evento ({ ev }) o un planificador ({ pl: clave, data }). */
export async function PUT(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  let b: { ev?: unknown; pl?: string; data?: unknown } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición vacía." }, { status: 400 }); }
  if (b.pl !== undefined) {
    if (!CLAVE_RE.test(String(b.pl))) return NextResponse.json({ error: "Periodo no válido." }, { status: 400 });
    const plan = limpiarPlan(b.data);
    const s = JSON.stringify(plan);
    if (s.length > 40000) return NextResponse.json({ error: "Hay demasiado texto en este planificador." }, { status: 413 });
    await kv("SET", PL(String(b.pl)), s);
    return NextResponse.json({ ok: true });
  }
  const ev = limpiarEv(b.ev);
  if (typeof ev === "string") return NextResponse.json({ error: ev }, { status: 400 });
  await kv("HSET", EV, ev.id, JSON.stringify(ev));
  return NextResponse.json({ ev });
}

/** DELETE: borra un evento ({ id }). */
export async function DELETE(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  let b: { id?: string } = {};
  try { b = await req.json(); } catch { /* vacío */ }
  if (!b.id) return NextResponse.json({ error: "Falta el evento." }, { status: 400 });
  await kv("HDEL", EV, String(b.id));
  return NextResponse.json({ ok: true });
}
