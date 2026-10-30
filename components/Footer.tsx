import Link from "next/link";
export default function Footer() {
  return (
    <footer id="contacto">
      <div className="wrap grid">
        <div className="logo"><img src="/brand/logo-principal-negativo.svg" alt="Pelos y Señales · Del match a casa" width={1295} height={2430} /></div>
        <div><h2>Escríbenos</h2><p className="contact"><a href="mailto:infopelosysenales@gmail.com">infopelosysenales@gmail.com</a></p><p style={{ marginTop: 10, fontSize: 14, opacity: .85 }}><a href="tel:+34635025378">+34 635 025 378</a><br /><a href="https://www.instagram.com/pelosysenales.es/" target="_blank" rel="noopener noreferrer">Instagram @pelosysenales.es</a></p></div>
        <div><h2>El proyecto</h2><ul><li><Link href="/#problema">Por qué lo hacemos</Link></li><li><Link href="/#como">Cómo funciona</Link></li><li><Link href="/#expo">Exposición</Link></li><li><Link href="/#faq">Preguntas frecuentes</Link></li><li><Link href="/#quienes">Quiénes somos</Link></li><li><Link href="/colabora">Colabora</Link></li></ul></div>
        <div><h2>Perros y protectoras</h2><ul><li><Link href="/perros">Perros en adopción</Link></li><li><Link href="/match">Haz match</Link></li><li><Link href="/perros?fav=1">Mis favoritos</Link></li><li><Link href="/protectoras">Protectoras</Link></li><li><Link href="/madrinas">Madrinas y padrinos</Link></li><li><Link href="/mapa">Mapa de entidades</Link></li><li><Link href="/perdidos">Perdidos y avistados</Link></li><li><Link href="/perdidos#consejos">Si ves un perro suelto</Link></li></ul></div>
      </div>
      <div className="wrap"><div className="copy">
        <span>© 2026 Pelos y Señales™ · Del match a casa · No entregamos animales ni cobramos por la adopción.</span>
        <span><Link href="/aviso-legal">Aviso legal</Link> · <Link href="/privacidad">Privacidad</Link> · <Link href="/cookies">Cookies</Link> · <Link href="/accesibilidad">Accesibilidad</Link></span>
        <span>Pelos y Señales™ es una marca solicitada ante la OEPM (solicitud M4412157). Ilustraciones de la pandilla: <a href="https://www.vecteezy.com/" target="_blank" rel="noopener noreferrer">Vecteezy</a>.</span>
      </div></div>
    </footer>
  );
}
