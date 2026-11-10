import type { Metadata } from "next";
import Link from "next/link";
import { TITULAR as T } from "@/lib/legal";
export const metadata: Metadata = { alternates: { canonical: "/cookies" }, title: "Cookies", description: "Esta web no usa cookies de publicidad ni de analítica." };
export default function Page() {
  return (
    <main className="wrap legal">
      <span className="eyebrow">Legal</span>
      <h1>Cookies</h1>
      <p className="upd">Última actualización: {T.actualizado}</p>
      <p><b>No usamos cookies de publicidad, de analítica ni de redes sociales.</b> Por eso no te mostramos ningún aviso para aceptarlas.</p>
      <h2>Lo que sí guardamos en tu navegador</h2>
      <p>Para que la web funcione como pides, guardamos en el almacenamiento local de tu navegador (no son cookies y no nos llegan):</p>
      <div className="tw" tabIndex={0} role="region" aria-label="Tabla desplazable"><table>
        <thead><tr><th scope="col">Nombre</th><th scope="col">Para qué</th><th scope="col">Duración</th></tr></thead>
        <tbody>
          <tr><td>pys-favs</td><td>Los perros que guardas en favoritos</td><td>Hasta que lo borres</td></tr>
          <tr><td>pys-life</td><td>Tus respuestas de «cómo vives» para ordenar los perros por afinidad</td><td>Hasta que lo borres</td></tr>
        </tbody>
      </table></div>
      <p>Son estrictamente necesarios para un servicio que tú pides, por lo que están exentos de consentimiento (artículo 22.2 de la LSSI). Puedes borrarlos desde la configuración de tu navegador.</p>
      <p>Si algún día añadimos analítica, será respetuosa con la privacidad y te lo preguntaremos antes. Dudas: <a href={`mailto:${T.emailLink}`}>{T.email}</a>. Ver también la <Link href="/privacidad">política de privacidad</Link>.</p>
    </main>
  );
}
