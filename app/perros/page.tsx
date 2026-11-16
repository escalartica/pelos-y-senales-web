import { Suspense } from "react";
import type { Metadata } from "next";
import PerrosExplorer from "@/components/PerrosExplorer";
import DogCard from "@/components/DogCard";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { alternates: { canonical: "/perros" }, title: "Perros en adopción", description: "Fichas autorizadas por su protectora, con estado y fecha de revisión. Filtra, guarda favoritos y escribe a la protectora." };

// PerrosExplorer usa useSearchParams(), así que Next deja en el HTML estático solo el
// fallback de <Suspense> y construye el listado ya en el navegador. Con un fallback de
// texto, el rastreador no encontraba ni un enlace a las fichas y se quedaban en
// «descubierta: actualmente sin indexar». Por eso el fallback es la lista completa
// renderizada en el servidor: es lo que ve Google en su primera pasada, y lo que ve
// quien entra antes de que hidrate el explorador con sus filtros.
export default async function Perros() {
  const { dogs } = await getCatalog();
  const listaInicial = (
    <div className="wrap listbody">
      <div className="cards">
        {dogs.map((d) => <DogCard key={d.id} d={d} />)}
      </div>
    </div>
  );
  return (
    <main>
      <div className="wrap listhead">
        <span className="eyebrow">Perros en adopción</span>
        <h1>Mira quién te espera.</h1>
        <p className="lead">Fichas autorizadas por su protectora, con estado y fecha de revisión. Filtra, guarda favoritos y escribe a la protectora del perro que te interese.</p>
      </div>
      <Suspense fallback={listaInicial}><PerrosExplorer /></Suspense>
    </main>
  );
}
