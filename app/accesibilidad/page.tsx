import type { Metadata } from "next";
import { TITULAR as T } from "@/lib/legal";
export const metadata: Metadata = { alternates: { canonical: "/accesibilidad" }, title: "Accesibilidad", description: "Nuestro compromiso con la accesibilidad de pelosyseñales.com (WCAG 2.1 AA)." };
export default function Page() {
  return (
    <main className="wrap legal">
      <span className="eyebrow">Accesibilidad</span>
      <h1>Declaración de accesibilidad</h1>
      <p className="upd">Última revisión: {T.actualizado}</p>
      <p>Queremos que cualquier persona pueda encontrar a su perro y ayudar a uno perdido. Diseñamos esta web para cumplir las pautas <b>WCAG 2.1 nivel AA</b>, la referencia de la norma europea EN 301 549.</p>
      <h2>Qué hemos hecho</h2>
      <ul>
        <li>Revisión automática con axe-core de todas las páginas, en móvil y en ordenador.</li>
        <li>Navegación completa con teclado, enlace para saltar al contenido y foco visible.</li>
        <li>Contraste de color suficiente, textos alternativos en las fotos y formularios con etiquetas.</li>
        <li>Animaciones que se detienen si tu sistema pide reducir el movimiento.</li>
      </ul>
      <h2>Lo que aún puede fallar</h2>
      <ul>
        <li>El mapa de puntos es visual; la misma información está en la lista que lo acompaña.</li>
        <li>Las fotos que suben las personas en los avisos de perdidos no siempre tienen una descripción detallada.</li>
      </ul>
      <h2>Cuéntanos si algo no funciona</h2>
      <p>Si encuentras una barrera, escríbenos a <a href={`mailto:${T.emailLink}`}>{T.email}</a> o llama al <a href="tel:+34635025378">{T.tel}</a> y te daremos la información por otra vía.</p>
    </main>
  );
}
