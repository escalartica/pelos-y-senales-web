import { NextResponse } from "next/server";
import { verify } from "@/lib/guard";
import { publicar } from "@/lib/avisos-server";
import { SITE } from "@/lib/mail";

export const dynamic = "force-dynamic";
/** Enlace del correo: publica el aviso y lleva a la persona a verlo en el mapa. */
export async function GET(req: Request) {
  const p = verify(new URL(req.url).searchParams.get("t") || "", 2);
  if (!p || p.a !== "pub") return NextResponse.redirect(`${SITE}/perdidos?aviso=caducado`);
  const x = await publicar(String(p.id));
  if (!x) return NextResponse.redirect(`${SITE}/perdidos?aviso=caducado`);
  return NextResponse.redirect(`${SITE}/perdidos?aviso=publicado#pa-${x.id}`);
}
