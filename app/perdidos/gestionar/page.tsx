import type { Metadata } from "next";
import { Suspense } from "react";
import Gestionar from "@/components/GestionarAviso";
export const metadata: Metadata = { title: "Gestionar mi aviso", robots: { index: false, follow: false } };
export default function Page() {
  return <main className="wrap listhead"><span className="eyebrow">Perdidos y avistados</span><h1>Tu aviso</h1><Suspense fallback={<p className="lead">Cargando…</p>}><Gestionar /></Suspense></main>;
}
