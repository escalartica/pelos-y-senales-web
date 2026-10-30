import { kv } from "@/lib/kv";

/** Fotos subidas desde el panel (perros y madrinas). Son públicas y no cambian: caché larga. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{20}$/.test(id)) return new Response("No encontrada", { status: 404 });
  const v = await kv<string | null>("GET", `img:${id}`);
  const m = v && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(v);
  if (!m) return new Response("No encontrada", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), { headers: { "content-type": m[1], "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
}
