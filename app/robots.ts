import type { MetadataRoute } from "next";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pelosysenales.es";
// En modo privado (SITE_PASSWORD definido) se pide a los buscadores que no rastreen nada.
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_PASSWORD) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }, sitemap: `${SITE}/sitemap.xml` };
}
