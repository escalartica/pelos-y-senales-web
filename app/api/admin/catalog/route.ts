import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin";
import { getCatalogFresh, saveCatalog } from "@/lib/catalog";
import { limpiarCatalogo } from "@/lib/catalog-validate";
import { kvConfigured } from "@/lib/kv";

export const dynamic = "force-dynamic";

/** Catálogo completo para el panel (GET) y guardado (PUT). Si otra persona ha guardado mientras tanto, avisa en vez de pisarlo. */
export async function GET(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  return NextResponse.json({ cat: await getCatalogFresh(), kv: kvConfigured() }, { headers: { "cache-control": "no-store" } });
}
export async function PUT(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  if (!kvConfigured() && process.env.NODE_ENV === "production") return NextResponse.json({ error: "Falta la base de datos (Upstash) en Vercel." }, { status: 503 });
  let b: { cat?: unknown; base?: string } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  const cur = await getCatalogFresh();
  if ((cur.upd || "") !== (b.base || "")) return NextResponse.json({ error: "Alguien ha guardado cambios mientras editabas. Recarga el panel y repite el último cambio.", conflict: true }, { status: 409 });
  const { cat, error } = limpiarCatalogo(b.cat);
  if (!cat) return NextResponse.json({ error }, { status: 400 });
  const saved = await saveCatalog(cat);
  return NextResponse.json({ ok: true, cat: saved });
}
