import { NextResponse } from "next/server";
import { rateLimit, ipOf } from "@/lib/guard";
import { limpiar, crear, listar, mandarConfirmacion, linkConfirmar, kvConfigured } from "@/lib/avisos-server";

export const dynamic = "force-dynamic";

/** Avisos publicados (perdidos y avistados). */
export async function GET() {
  try {
    const avisos = await listar();
    return NextResponse.json({ avisos, activo: process.env.NODE_ENV !== "production" || (kvConfigured() && !!process.env.RESEND_API_KEY && (process.env.ALERTAS_SECRET || "").length >= 24) }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (e) { console.error("[avisos GET]", e); return NextResponse.json({ avisos: [], error: "No se pudieron cargar los avisos." }, { status: 503 }); }
}

/** Nuevo aviso: queda pendiente hasta que la persona confirma desde su correo. */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && (!kvConfigured() || !process.env.RESEND_API_KEY || (process.env.ALERTAS_SECRET || "").length < 24)) return NextResponse.json({ error: "La publicación de avisos se está activando. Mientras tanto, escríbenos a infopelosysenales@gmail.com." }, { status: 503 });
  if (!(await rateLimit("aviso:" + ipOf(req), 5, 3600))) return NextResponse.json({ error: "Has enviado varios avisos seguidos. Espera un rato." }, { status: 429 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  if (String(b.web || "")) return NextResponse.json({ ok: true }); // cebo para bots
  if (b.priv !== true) return NextResponse.json({ error: "Hace falta tu permiso para publicar el aviso." }, { status: 400 });
  const { a, error } = limpiar(b); if (!a) return NextResponse.json({ error }, { status: 400 });
  let foto: string | undefined;
  if (b.foto) {
    const f = String(b.foto);
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(f) || f.length > 900_000) return NextResponse.json({ error: "La foto no es válida o pesa demasiado." }, { status: 400 });
    foto = f;
  }
  try {
    const x = await crear(a, foto);
    const r = await mandarConfirmacion(x);
    if (!r.ok) return NextResponse.json({ error: "No pudimos enviarte el correo de confirmación. Revisa la dirección." }, { status: 502 });
    return NextResponse.json({ ok: true, ...(r.simulated && process.env.NODE_ENV !== "production" ? { debugUrl: linkConfirmar(x.id) } : {}) });
  } catch (e) { console.error("[avisos POST]", e); return NextResponse.json({ error: "No se pudo guardar el aviso. Prueba de nuevo en unos minutos." }, { status: 503 }); }
}
