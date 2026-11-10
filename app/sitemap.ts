import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xn--pelosyseales-hhb.com";
// Sin fechas inventadas: Google desconfía de un «lastModified» que cambia en cada visita. Las fichas llevan sus fotos.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { dogs, prot } = await getCatalog();
  const main: [string, number][] = [["", 1], ["/perros", 0.9], ["/match", 0.8], ["/protectoras", 0.7], ["/mapa", 0.7], ["/perdidos", 0.7], ["/descubrir", 0.6], ["/madrinas", 0.6], ["/colabora", 0.6]];
  const legal = ["/aviso-legal", "/privacidad", "/cookies", "/accesibilidad"];
  return [
    ...main.map(([p, priority]) => ({ url: `${SITE}${p}`, priority })),
    ...dogs.map((d) => ({ url: `${SITE}/perros/${d.id}`, priority: 0.8, images: [d.photo, ...(d.photos || []).map((x) => x.src)].filter((x): x is string => !!x && x.startsWith("/")).slice(0, 10).map((x) => `${SITE}${x}`) })),
    ...Object.keys(prot).map((id) => ({ url: `${SITE}/protectoras/${id}`, priority: 0.6 })),
    ...legal.map((p) => ({ url: `${SITE}${p}`, priority: 0.2 })),
  ];
}
