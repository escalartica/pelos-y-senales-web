import { NextResponse } from "next/server";
import { verify, rateLimit, ipOf } from "@/lib/guard";
import { leer, resolver, borrar, publico } from "@/lib/avisos-server";

export const dynamic = "force-dynamic";
/** Gestión del aviso con el enlace firmado del correo: ver, marcar «en casa» o retirar. */
export async function POST(req: Request) {
  if (!(await rateLimit("gest:" + ipOf(req), 20))) return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: "Petición no válida." }, { status: 400 }); }
  const p = verify(String(b.t || ""), 90);
  if (!p || p.a !== "gest") return NextResponse.json({ error: "El enlace no es válido o ha caducado." }, { status: 403 });
  const id = String(p.id);
  if (b.accion === "ver") { const x = await leer(id); return x ? NextResponse.json({ aviso: publico(x), estado: x.estadoPub }) : NextResponse.json({ error: "Este aviso ya no existe." }, { status: 404 }); }
  if (b.accion === "encasa") { const x = await resolver(id); return x ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "El aviso no está publicado." }, { status: 404 }); }
  if (b.accion === "retirar") { await borrar(id); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
