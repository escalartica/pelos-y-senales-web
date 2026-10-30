import { foto } from "@/lib/avisos-server";
export const dynamic = "force-dynamic";
/** Sirve la foto de un aviso (guardada ya reducida y sin metadatos). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const f = await foto(id);
  const m = f && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(f);
  if (!m) return new Response("No encontrada", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}
