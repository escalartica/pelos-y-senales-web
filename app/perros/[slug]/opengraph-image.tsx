import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCatalog, getDogIn } from "@/lib/catalog";
import { protOf, EST } from "@/lib/data";
import { kv } from "@/lib/kv";
import { foco } from "@/lib/foco";

// Imagen que sale al compartir una ficha (WhatsApp, Instagram, Facebook…).
// El retrato va entero en un panel 2:3, con la misma proporción que la foto: así nunca se corta la cara.
export const alt = "Perro en adopción en Pelos y Señales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PUB = join(process.cwd(), "public");
const FONTS = join(process.cwd(), "app", "fonts");

async function fotoDataUrl(src?: string): Promise<string | null> {
  if (!src) return null;
  try {
    if (src.startsWith("/img/")) {
      const buf = await readFile(join(PUB, src));
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }
    const m = /^\/api\/img\/([a-f0-9]{20})$/.exec(src);
    if (m) {
      const v = await kv<string | null>("GET", `img:${m[1]}`);
      if (v && /^data:image\/(jpeg|png);base64,/.test(v)) return v;
    }
  } catch {}
  return null;
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCatalog();
  const d = getDogIn(cat, slug);
  const [fr, mr, logo] = await Promise.all([
    readFile(join(FONTS, "fraunces-soft-900.ttf")),
    readFile(join(FONTS, "manrope-latin-700-normal.ttf")),
    readFile(join(PUB, "brand", "logo-horizontal.svg")),
  ]);
  const logoUrl = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  const foto = await fotoDataUrl(d?.photo);
  const p = d ? protOf(cat.prot, d.prot) : null;
  const sub = d ? [d.edadTxt, d.raza].filter(Boolean).join(" · ") : "";
  const donde = p ? `${p.n.split(" · ")[0]}${p.ciudad ? ` · ${p.ciudad}` : ""}` : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F4ECDC", fontFamily: "Manrope", color: "#161616" }}>
        <div style={{ width: 420, height: 630, display: "flex", background: "#F2A93B", borderRight: "6px solid #161616" }}>
          {foto ? <img src={foto} width={420} height={630} style={{ width: 420, height: 630, objectFit: "cover", objectPosition: foco(d?.photo, 420 / 630) }} /> : null}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px 52px" }}>
          <img src={logoUrl} height={92} style={{ height: 92, width: 218 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {d ? <div style={{ display: "flex" }}><span style={{ background: "#161616", color: "#F4ECDC", borderRadius: 999, padding: "10px 22px", fontSize: 24, letterSpacing: 3, textTransform: "uppercase" }}>{EST[d.estado]}</span></div> : null}
            <div style={{ fontFamily: "Fraunces", fontSize: d && d.n.length > 9 ? 120 : 150, lineHeight: 1, marginTop: 22 }}>{d ? d.n : "Pelos y Señales"}</div>
            {sub ? <div style={{ fontSize: sub.length > 32 ? 27 : 34, marginTop: 18 }}>{sub}</div> : null}
            {donde ? <div style={{ fontSize: 26, marginTop: 10, color: "#4a4a4a" }}>{donde}</div> : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
            <span>pelosyseñales.com</span>
            <span style={{ color: "#E8734A" }}>Del match a casa</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Fraunces", data: fr, weight: 900 }, { name: "Manrope", data: mr, weight: 700 }] },
  );
}
