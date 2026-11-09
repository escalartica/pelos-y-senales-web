import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import FavDrawer from "@/components/FavDrawer";
import Cursor from "@/components/Cursor";
import CatalogProvider from "@/components/CatalogProvider";
import { getCatalog } from "@/lib/catalog";

// Fuentes autoalojadas (las mismas instancias de Fraunces «Soft» del kit de marca, opsz 72 · SOFT 100 · WONK 1).
const fraunces = localFont({ variable: "--font-fraunces", display: "swap", src: [
  { path: "./fonts/fraunces-soft-700.ttf", weight: "700", style: "normal" },
  { path: "./fonts/fraunces-soft-800.ttf", weight: "800", style: "normal" },
  { path: "./fonts/fraunces-soft-900.ttf", weight: "900", style: "normal" },
  { path: "./fonts/fraunces-soft-900-italic.ttf", weight: "900", style: "italic" },
] });
const manrope = localFont({ variable: "--font-manrope", display: "swap", src: [
  { path: "./fonts/manrope-latin-500-normal.ttf", weight: "500" },
  { path: "./fonts/manrope-latin-600-normal.ttf", weight: "600" },
  { path: "./fonts/manrope-latin-700-normal.ttf", weight: "700" },
] });
const caveat = localFont({ variable: "--font-caveat", display: "swap", src: "./fonts/caveat-latin-700-normal.ttf", weight: "700" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xn--pelosyseales-hhb.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Pelos y Señales™ · Del match a casa", template: "%s · Pelos y Señales" },
  description: "Fotografiamos a los perros de las protectoras de toda España tal como son cuando están bien. Haz match con tu vida, mira el mapa de entidades y publica perdidos y avistados.",
  openGraph: { type: "website", locale: "es_ES", siteName: "Pelos y Señales", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Pelos y Señales · Del match a casa" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#FBF7EE", colorScheme: "light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { dogs, prot, madrinas } = await getCatalog();
  return (
    <html lang="es" className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}>
      <body>
        <CatalogProvider value={{ dogs, prot, madrinas }}>
        <a className="skip" href="#contenido">Saltar al contenido</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Pelos y Señales", url: SITE, logo: `${SITE}/brand/logo-principal.svg`, description: "Del match a casa: fotos reales de perros de protectoras y contacto directo con quien los cuida.", email: "info@pelosyseñales.com", telephone: "+34635025378", sameAs: ["https://www.instagram.com/pelosysenales.es/"], areaServed: "ES" }) }} />
        <div className="grain" aria-hidden="true" />
        <Nav />
        <div id="contenido">{children}</div>
        <div className="friso" aria-hidden="true"><img src="/brand/friso-mostaza.svg" alt="" width={2400} height={420} /></div>
        <Footer />
        <Toast />
        <FavDrawer />
        <Cursor />
        <div id="print-poster" aria-hidden="true" />
        </CatalogProvider>
      </body>
    </html>
  );
}
