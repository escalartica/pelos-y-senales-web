import type { Metadata } from "next";
import Link from "next/link";
import { TITULAR as T } from "@/lib/legal";
export const metadata: Metadata = { title: "Aviso legal", description: "Datos del titular de pelosysenales.es y condiciones de uso de la web." };
export default function Page() {
  return (
    <main className="wrap legal">
      <span className="eyebrow">Legal</span>
      <h1>Aviso legal</h1>
      <p className="upd">Última actualización: {T.actualizado}</p>
      <h2>Quién está detrás de esta web</h2>
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI):</p>
      <ul>
        <li><b>Titular:</b> {T.nombre}</li>
        <li><b>NIF:</b> {T.nif}</li>
        <li><b>Domicilio:</b> {T.domicilio}</li>
        <li><b>Inscripción:</b> {T.registro}</li>
        <li><b>Correo:</b> <a href={`mailto:${T.email}`}>{T.email}</a> · <b>Teléfono:</b> <a href="tel:+34635025378">{T.tel}</a></li>
      </ul>
      <h2>Qué es Pelos y Señales</h2>
      <p>Un proyecto sin ánimo de lucro que fotografía a perros de protectoras, refugios y centros municipales y publica sus fichas para que encuentren familia. <b>No entregamos animales ni cobramos por la adopción</b>: cada adopción la valora, decide y formaliza la protectora responsable del perro, con su propio proceso.</p>
      <h2>Contenidos</h2>
      <ul>
        <li>Las fichas de los perros se publican con la autorización de su protectora, que confirma los datos. Si ves algo desfasado, <Link href="/colabora#contacto">avísanos</Link> y lo corregimos.</li>
        <li>El mapa de entidades recoge datos públicos de cada protectora o ayuntamiento. Cualquier entidad puede pedir que corrijamos sus datos o retirarse.</li>
        <li>Los avisos de perdidos y avistados los publican las personas que los envían, tras confirmar su correo, y caducan a los 60 días. Retiramos cualquier aviso falso, ofensivo o que no trate de un animal perdido o encontrado.</li>
        <li>La orientación del «match» es una ayuda, no una valoración profesional: no garantiza la convivencia.</li>
      </ul>
      <h2>Propiedad intelectual</h2>
      <p>«Pelos y Señales» es una marca solicitada ante la Oficina Española de Patentes y Marcas (solicitud M4412157). Las fotografías de los perros son del proyecto y se publican con permiso de cada protectora; no pueden usarse con fines comerciales sin autorización. Las ilustraciones de la pandilla proceden de <a href="https://www.vecteezy.com/" target="_blank" rel="noopener noreferrer">Vecteezy</a>, con su licencia.</p>
      <p>Las protectoras pueden compartir las fotos y fichas de sus propios perros en sus canales, citando a Pelos y Señales.</p>
      <h2>Enlaces</h2>
      <p>Enlazamos a webs de protectoras, ayuntamientos y otros servicios. No somos responsables de su contenido.</p>
      <h2>Ley aplicable</h2>
      <p>Esta web se rige por la ley española. Para cualquier duda, escríbenos a <a href={`mailto:${T.email}`}>{T.email}</a>.</p>
      <p>Más información: <Link href="/privacidad">política de privacidad</Link> · <Link href="/cookies">cookies</Link> · <Link href="/accesibilidad">accesibilidad</Link>.</p>
    </main>
  );
}
