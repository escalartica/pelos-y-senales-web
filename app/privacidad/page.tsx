import type { Metadata } from "next";
import Link from "next/link";
import { TITULAR as T } from "@/lib/legal";
export const metadata: Metadata = { title: "Política de privacidad", description: "Qué datos tratamos en pelosyseñales.com, para qué, durante cuánto tiempo y cómo ejercer tus derechos." };
export default function Page() {
  return (
    <main className="wrap legal">
      <span className="eyebrow">Legal</span>
      <h1>Política de privacidad</h1>
      <p className="upd">Última actualización: {T.actualizado}</p>
      <p>Pedimos solo los datos necesarios para cada cosa y no los vendemos ni los cedemos a nadie salvo lo que se explica aquí. Cumplimos el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>
      <h2>Responsable</h2>
      <p>{T.nombre} · NIF {T.nif} · {T.domicilio} · <a href={`mailto:${T.emailLink}`}>{T.email}</a></p>
      <h2>Qué datos tratamos y para qué</h2>
      <div className="tw" tabIndex={0} role="region" aria-label="Tabla desplazable"><table>
        <thead><tr><th scope="col">Cuándo</th><th scope="col">Datos</th><th scope="col">Para qué y base legal</th><th scope="col">Cuánto tiempo</th></tr></thead>
        <tbody>
          <tr><td>Escribes a una protectora desde la ficha de un perro</td><td>Nombre, teléfono o correo, ciudad, tipo de casa y tu mensaje</td><td>Hacer llegar tu consulta a la protectora de ese perro, que te responde y decide. Base: tu consentimiento.</td><td>Lo que tarde la gestión y como máximo 12 meses en nuestro buzón. La protectora los conserva según su propia política.</td></tr>
          <tr><td>Nos escribes con el formulario de contacto</td><td>Nombre, correo, teléfono si lo das, mensaje</td><td>Contestarte. Base: tu consentimiento.</td><td>Hasta 12 meses después de cerrar la conversación.</td></tr>
          <tr><td>Publicas un perro perdido o un avistamiento</td><td>Foto, descripción del perro, lugar, fecha, teléfono (público si lo das) y tu correo (nunca público)</td><td>Publicar el aviso para que quien lo vea pueda avisarte, y enviarte los enlaces para confirmarlo, marcarlo «en casa» o retirarlo. Base: tu consentimiento.</td><td>60 días desde su publicación (15 si lo marcas «en casa»). Se borra solo. Puedes retirarlo antes.</td></tr>
          <tr><td>Pides avisos de tu zona o alertas de perros</td><td>Correo y ciudad o preferencias</td><td>Enviarte esos avisos. Base: tu consentimiento, confirmado por correo.</td><td>Hasta que te des de baja (enlace en cada correo).</td></tr>
        </tbody>
      </table></div>
      <p>Los favoritos y las respuestas de «cómo vives» se guardan solo en tu navegador; no nos llegan.</p>
      <h2>Quién más ve tus datos</h2>
      <ul>
        <li><b>La protectora del perro</b> por el que preguntas: recibe tu consulta para contestarte.</li>
        <li><b>Cualquier visitante</b> ve los avisos de perdidos y avistados que publiques (sin tu correo).</li>
        <li><b>Proveedores técnicos</b> que tratan datos por nuestra cuenta: Vercel Inc. (alojamiento de la web), Resend (envío de correos) y Upstash (base de datos de avisos). Algunos están en Estados Unidos y se acogen al Marco de Privacidad de Datos UE-EE. UU. o a cláusulas contractuales tipo de la Comisión Europea.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad de tus datos, y retirar tu consentimiento cuando quieras, escribiendo a <a href={`mailto:${T.emailLink}`}>{T.email}</a>. Si crees que no lo hemos hecho bien, puedes reclamar ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a>.</p>
      <h2>Menores</h2>
      <p>Los formularios son para mayores de 14 años. Para adoptar, la protectora pedirá siempre una persona adulta.</p>
      <h2>Seguridad</h2>
      <p>La web funciona solo con conexión cifrada (HTTPS), los enlaces que te enviamos van firmados y caducan, y limitamos los envíos repetidos para evitar abusos.</p>
      <p>Más información: <Link href="/aviso-legal">aviso legal</Link> · <Link href="/cookies">cookies</Link>.</p>
    </main>
  );
}
