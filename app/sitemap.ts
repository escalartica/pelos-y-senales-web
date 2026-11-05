import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xn--pelosyseales-hhb.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { dogs, prot } = await getCatalog();
  const pages = ["", "/match", "/perros", "/descubrir", "/protectoras", "/madrinas", "/colabora", "/mapa", "/perdidos", "/aviso-legal", "/privacidad", "/cookies", "/accesibilidad"].map((p) => ({ url: `${SITE}${p}`, lastModified: new Date() }));
  return [...pages, ...Object.keys(prot).map((id) => ({ url: `${SITE}/protectoras/${id}`, lastModified: new Date() })), ...dogs.map((d) => ({ url: `${SITE}/perros/${d.id}`, lastModified: new Date() }))];
}
