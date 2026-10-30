import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/admin";
import { kv } from "@/lib/kv";

/** Sube una foto (ya reducida en el navegador) y devuelve su dirección pública /api/img/<id>. */
export async function POST(req: Request) {
  const no = await guardAdmin(req); if (no) return no;
  let b: { data?: string } = {};
  try { b = await req.json(); } catch { /* vacío */ }
  const data = String(b.data || "");
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data)) return NextResponse.json({ error: "Formato de imagen no válido." }, { status: 400 });
  if (data.length > 2_500_000) return NextResponse.json({ error: "La foto es demasiado grande." }, { status: 413 });
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  await kv("SET", `img:${id}`, data);
  return NextResponse.json({ url: `/api/img/${id}` });
}
