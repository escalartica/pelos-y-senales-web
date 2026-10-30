import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin";
import { listarSubs, baja } from "@/lib/avisos-server";

export const dynamic = "force-dynamic";

/** Personas suscritas a los avisos por zona: ver (GET) y dar de baja (DELETE). */
export async function GET(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  return NextResponse.json({ subs: await listarSubs() }, { headers: { "cache-control": "no-store" } });
}
export async function DELETE(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  let b: { email?: string } = {};
  try { b = await req.json(); } catch { /* vacío */ }
  if (!b.email) return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  await baja(String(b.email).toLowerCase());
  return NextResponse.json({ ok: true });
}
