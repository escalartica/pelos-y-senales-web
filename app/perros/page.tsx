import { Suspense } from "react";
import type { Metadata } from "next";
import PerrosExplorer from "@/components/PerrosExplorer";
export const metadata: Metadata = { title: "Perros en adopción", description: "Fichas autorizadas por su protectora, con estado y fecha de revisión. Filtra, guarda favoritos y escribe a la protectora." };
export default function Perros() {
  return (
    <main>
      <div className="wrap listhead">
        <span className="eyebrow">Perros en adopción</span>
        <h1>Mira quién te espera.</h1>
        <p className="lead">Fichas autorizadas por su protectora, con estado y fecha de revisión. Filtra, guarda favoritos y escribe a la protectora del perro que te interese.</p>
      </div>
      <Suspense fallback={<div className="wrap listbody"><p className="lead">Cargando perros…</p></div>}><PerrosExplorer /></Suspense>
    </main>
  );
}
