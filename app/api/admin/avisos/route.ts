import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin";
import { listarTodo, publicarAdmin, resolver, reabrir, borrar, editar } from "@/lib/avisos-server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

/** Moderación de Perdidos y avistados: listar todo (GET) y actuar sobre un aviso (POST). */
export async function GET(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  return NextResponse.json({ avisos: await listarTodo() }, { headers: { "cache-control": "no-store" } });
}
export async function POST(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  let b: { id?: string; accion?: string; datos?: Record<string, unknown> } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  const id = String(b.id || "");
  if (!/^[a-f0-9]{16}$/.test(id)) return NextResponse.json({ error: "Aviso no válido." }, { status: 400 });
  let r: unknown = true;
  switch (b.accion) {
    case "publicar": r = await publicarAdmin(id); break;
    case "encasa": r = await resolver(id); break;
    case "reabrir": r = await reabrir(id); break;
    case "editar": r = await editar(id, b.datos || {}); break;
    case "borrar": await borrar(id); break;
    default: return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }
  if (!r) return NextResponse.json({ error: "Ese aviso ya no existe o no admite esta acción." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
