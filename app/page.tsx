import Image from "next/image";
import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/" } };
import { foco } from "@/lib/foco";
import Link from "next/link";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";
import DogCard from "@/components/DogCard";
import Reveal from "@/components/Reveal";
import Zonas from "@/components/Zonas";
import Pandilla from "@/components/Pandilla";
import Manifesto from "@/components/Manifesto";
import Counter from "@/components/Counter";
import Faq from "@/components/Faq";
import HeroVideo from "@/components/HeroVideo";
import FilmStrip from "@/components/FilmStrip";
import MadrinaCard from "@/components/MadrinaCard";
import { LASA_FOTOS } from "@/lib/fotos";
import Wall from "@/components/Wall";
import Seal from "@/components/Seal";
import HomeAvisos from "@/components/HomeAvisos";

export default async function Home() {
  const cat = await getCatalog(); const DOGS = cat.dogs; const PROT = cat.prot; const MADRINAS = cat.madrinas;
  const destacados = DOGS.filter((d) => d.estado === "disponible").slice(0, 3);
  const nProt = Object.keys(PROT).length;
  const usadas = new Set(DOGS.flatMap((d) => [d.photo, ...(d.photos ?? []).map((x) => x.src)]));
  const pronto = LASA_FOTOS.filter((f) => !usadas.has(f.src));
  return (
    <main>
      <header className="hero" id="inicio">
        <div className="wrap">
          <div className="copy">
            <span className="eyebrow">Del match a casa · España</span>
            <h1>Del perro que espera al perro que <span className="i">ilusiona.</span></h1>
            <p className="lead">El «match» entre perros y familias, con la protectora al mando. Cuéntanos cómo vives en cuatro preguntas y te enseñamos, uno a uno, los perros que encajan contigo, fotografiados como son cuando están bien.</p>
            <div className="cta"><Link className="btn" href="/match">Haz match en un minuto <span className="ic">→</span></Link><Link className="btn ghost" href="/perros">Ver todos los perros</Link></div>
            <div className="trust">{DOGS.length > 0 && <span>{DOGS.length} perros en adopción</span>}<span>Fotos reales de cada perro</span><span>Fichas revisadas por su protectora</span><span>Sin registro para hacer match</span></div>
          </div>
          <div className="stage" aria-hidden="true">
            <div className="blob"><HeroVideo /></div>
            <div className="tag t1">Te mira</div>
            <div className="tag t2">Te encaja</div>
            <div className="tag t3">Te espera</div>
            <div className="sticker">Fuera de la jaula<small>Así los retratamos</small></div>
            <Seal />
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true"><div className="track">
        {[0, 1].map((k) => <span key={k}>Te mira <i>·</i> Te encaja <i>·</i> Te espera <i>·</i> Pelos y Señales <i>·</i> Del match a casa <i>·</i> Te mira <i>·</i> Te encaja <i>·</i> Te espera <i>·</i> Pelos y Señales <i>·</i> Del match a casa <i>·</i></span>)}
      </div></div>

      <div className="trustbar"><div className="wrap"><span>{nProt === 1 ? "Colabora con nosotros" : "Colaboran con nosotros"}</span>{Object.values(PROT).map((p) => <b key={p.id}>{p.n}</b>)}<span style={{ marginLeft: "auto" }}>Sumamos protectoras de toda España, una a una</span></div></div>

      <section className="band" id="perros">
        <div className="wrap">
          <Reveal className="head row"><div><span className="eyebrow">Quién te espera</span><h2>{destacados.length ? "Ya puedes conocerles." : "Los perros de APAAL, muy pronto con su ficha."}</h2></div>{destacados.length ? <Link className="btn ghost" href="/perros">Ver {DOGS.length === 1 ? "su ficha" : `los ${DOGS.length} perros`}</Link> : <a className="btn ghost" href="https://www.instagram.com/pelosysenales.es/" target="_blank" rel="noopener noreferrer">Síguelos en Instagram</a>}</Reveal>
          {destacados.length > 0 && <Reveal className="cards">{destacados.map((d) => <DogCard key={d.id} d={d} />)}</Reveal>}
          {pronto.length > 0 && (<>
            {destacados.length > 0 && <h3 style={{ margin: "40px 0 16px", fontFamily: "var(--f-display)", fontSize: "clamp(22px,2.4vw,30px)" }}>Y muy pronto, con su ficha:</h3>}
            <Reveal className="soongrid">{pronto.slice(0, destacados.length ? 3 : 6).map((f) => <figure key={f.src}><Image src={f.src} alt={f.alt} width={600} height={750} sizes="(max-width: 760px) 50vw, 33vw" style={{ objectPosition: foco(f.src, 4 / 5) }} /></figure>)}</Reveal>
            <p className="source">Fotografías de nuestra primera sesión. Estamos preparando sus fichas con sus protectoras.</p>
          </>)}
        </div>
      </section>

      <section className="band crema" id="gracias">
        <div className="wrap">
          <Reveal className="head">
            <span className="eyebrow">Gracias a ellas</span>
            <h2>Antes de cada foto hubo alguien que no miró hacia otro lado.</h2>
            <p className="lead">Cada perro de esta web está vivo, sano y listo para una familia gracias a una protectora y a su voluntariado. Gente que lo recogió de la calle, lo llevó al veterinario, le dio de comer cada día y lo saca a pasear aunque llueva. Casi siempre en su tiempo libre y muchas veces pagando de su bolsillo.</p>
          </Reveal>
          <Reveal className="gracias">
            <div><b>Rescatan</b><span>Recogen a los perros abandonados, los curan y les devuelven la confianza en las personas.</span></div>
            <div><b>Cuidan</b><span>Comida, paseos, veterinario y cariño, un día tras otro, mientras llega su familia.</span></div>
            <div><b>Conocen</b><span>Saben quién es cada perro y qué casa le hace falta. Por eso deciden ellas cada adopción.</span></div>
          </Reveal>
          <p className="gracias-cierre">Nosotros ponemos la cámara y la difusión, y queremos ser una ayuda para las protectoras, nunca una carga más. Porque cada perro merece ser visto y cada historia merece una oportunidad.</p>
          <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn" href="/protectoras">Conoce a las protectoras</Link><Link className="btn ghost" href="/colabora">Hazte voluntario o colabora</Link></div>
        </div>
      </section>

      <Manifesto />
      <FilmStrip />

      <section className="band crema curve" id="problema">
        <div className="wrap">
          <Reveal className="head">
            <span className="eyebrow">Por qué</span>
            <h2>Cada perro que espera una casa merece una buena primera foto.</h2>
            <p className="lead">La primera foto decide si alguien se para a leer la ficha. Casi todos los perros en adopción se presentan con la peor: tras una reja, con la mirada apagada. Nosotros los retratamos como son cuando están bien, contamos lo bonito y lo importante, y los llevamos a donde está la gente.</p>
          </Reveal>
          <Reveal className="stats">
            <div className="stat m"><Counter to={169000} /><span>perros recogidos en España en 2025</span></div>
            <div className="stat c"><Counter to={43} suffix=" %" locale={false} /><span>adoptados ese mismo año</span></div>
            <div className="stat l"><b>1.ª foto</b><span>el factor que más acorta la espera de un perro en adopción</span></div>
          </Reveal>
          <p className="source">Fuentes: Fundación Affinity, estudio «Él nunca lo haría» con datos de 2025 (<a href="https://www.elespanol.com/mascotario/20260924/oficial-espana-adopciones-perros-gatos-bajado-marcando-minimo-historico/1003744392905_0.html" target="_blank" rel="noopener noreferrer">El Español, 24 sep 2026</a>: 169.000 perros recogidos y 72.000 adoptados) · Lampe &amp; Witte (2014), Journal of Applied Animal Welfare Science · Nakamura et al. (2020), Animals 10(1).</p>
        </div>
      </section>

      <Pandilla />

      <section className="band" id="como">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Cómo funciona</span><h2>Tres pasos, y en los tres mandan el perro y su protectora.</h2></Reveal>
          <div className="steps stack">
            <article className="step"><svg className="ico" viewBox="0 0 110 110" aria-hidden="true"><circle cx="62" cy="62" r="34" fill="none" stroke="#161616" strokeWidth="5" /><circle cx="62" cy="62" r="16" fill="#F2A93B" stroke="#161616" strokeWidth="5" /><rect x="46" y="20" width="32" height="14" rx="5" fill="#161616" /></svg><div className="n">1</div><h3>Te mira</h3><div className="guide"><img src="/brand/perro-galgo.svg" alt="" /><span>Lo cuida el Galgo, el fotógrafo</span></div><p>Una mañana en el centro. Sacamos al perro de la jaula, le dejamos correr, comer y olisquear, y le retratamos cuando se olvida de la cámara. La protectora revisa cada texto antes de publicarlo.</p></article>
            <article className="step"><svg className="ico" viewBox="0 0 110 110" aria-hidden="true"><path d="M62 92 L30 60 a16 16 0 0 1 23-23 l9 9 9-9 a16 16 0 0 1 23 23z" fill="#E8734A" stroke="#161616" strokeWidth="5" strokeLinejoin="round" /></svg><div className="n">2</div><h3>Te encaja</h3><div className="guide"><img src="/brand/perro-carlino.svg" alt="" /><span>Lo cuida el Carlino, el del match</span></div><p>Filtras por zona, tamaño, edad y convivencia, guardas favoritos y lees la ficha completa: carácter con ejemplos, lo que necesita y lo que aún no sabemos. Si nos cuentas cómo vives, te señalamos afinidades y avisos. Orientan; no deciden.</p></article>
            <article className="step"><svg className="ico" viewBox="0 0 110 110" aria-hidden="true"><ellipse cx="62" cy="74" rx="20" ry="16" fill="#C9CF58" stroke="#161616" strokeWidth="5" /><circle cx="38" cy="50" r="9" fill="#C9CF58" stroke="#161616" strokeWidth="5" /><circle cx="56" cy="38" r="9" fill="#C9CF58" stroke="#161616" strokeWidth="5" /><circle cx="76" cy="40" r="9" fill="#C9CF58" stroke="#161616" strokeWidth="5" /><circle cx="90" cy="56" r="8" fill="#C9CF58" stroke="#161616" strokeWidth="5" /></svg><div className="n">3</div><h3>Te espera</h3><div className="guide"><img src="/brand/perro-caniche.svg" alt="" /><span>Lo cuida la Caniche, la de las protectoras</span></div><p>Escribes a la protectora desde la ficha, con los datos mínimos. Ellos te contestan, os conocéis y seguís su proceso de siempre: entrevista, valoración y contrato. Nosotros no entregamos animales ni cobramos por la adopción.</p></article>
          </div>
        </div>
      </section>

      <section className="band mostaza curve" id="sesion">
        <div className="wrap">
          <Reveal className="split">
            <div className="bezel"><div className="pic"><Image src="/img/lasa/4e6a6428.jpg" alt="Perro blanco y negro sentado sobre fondo mostaza, con la lengua fuera, en la sesión de APAAL" width={1067} height={1600} sizes="(max-width: 860px) 100vw, 50vw" style={{ objectPosition: foco("/img/lasa/4e6a6428.jpg", 1) }} /></div></div>
            <div>
              <span className="eyebrow">La sesión</span>
              <h2>Para ellos, la sesión es un juego.</h2>
              <p className="lead" style={{ color: "rgba(22,22,22,.72)" }}>Corretean, olisquean, comen chuches y se lo pasan en grande. Durante un rato reciben mimos y devuelven todo el cariño que tienen dentro, y nosotros solo esperamos a que se olviden de la cámara. Así salen como son cuando están felices. Luego, en su ficha, contamos lo bonito y lo importante: energía, convivencia y salud. Si algo no está evaluado, lo decimos.</p>
              <p className="hand" style={{ marginTop: 22 }}>«Chuches, carreras y mucho amor.»</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band tinta curve" id="expo">
        <div className="wrap">
          <Reveal className="split">
            <div>
              <span className="eyebrow">Exposición itinerante · próximamente</span>
              <h2>Perros de exposición. De los que se adoptan.</h2>
              <p className="lead">Sus retratos, en grande, colgados en bares, centros cívicos, asociaciones y museos. Una galería donde las obras mueven la cola: cada sede expone durante un mes a los perros de su zona, y cada lámina lleva un QR a su ficha. Te tomas un café, te enamoras de un cuadro y te lo llevas a casa.</p>
              <p className="note">Estamos buscando las primeras sedes. Si tienes un bar, una sala o una tienda, escríbenos.</p>
              <div style={{ marginTop: 26 }}><Link className="btn cream" href="/colabora#sedes">Quiero acoger la exposición <span className="ic">→</span></Link></div>
            </div>
            <Wall />
          </Reveal>
        </div>
      </section>

      <section className="band lima curve" id="zonas">
        <div className="wrap">
          <Reveal className="split">
            <Zonas />
            <div className="pic"><Image src="/img/lasa/4e6a6596.jpg" alt="Perro negro y blanco tumbado y sonriente sobre fondo crema, en la sesión de APAAL" width={1067} height={1600} sizes="(max-width: 860px) 100vw, 50vw" style={{ objectPosition: foco("/img/lasa/4e6a6596.jpg", 1) }} /></div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="mapa-perdidos">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Más que adopción</span><h2>Información y lazos, en toda España.</h2><p className="lead" style={{ marginTop: 12 }}>Dos herramientas abiertas a todo el mundo, colabore o no su protectora con nosotros.</p></Reveal>
          <Reveal className="homefeat">
            <Link className="m" href="/mapa"><h3>El mapa de quien cuida de ellos.</h3><p>Protectoras, refugios y centros municipales de toda España, con su enlace y su contacto. Los que trabajan con nosotros, con sus perros; los demás, con la información para llegar a ellos.</p><span className="go">Ver el mapa →</span></Link>
            <Link className="c" href="/perdidos"><h3>Perdidos y avistados.</h3><p>Si se te ha perdido, publica su ficha y su cartel en un minuto. Si has visto un perro suelto, dinos dónde: la ubicación es lo que lo trae de vuelta. Y qué hacer para que no salga huyendo.</p><span className="go">Ir a perdidos y avistados →</span></Link>
          </Reveal>
          <HomeAvisos />
        </div>
      </section>

      <section className="band crema curve" id="madrinas">
        <div className="wrap">
          <Reveal className="mteaser">
            <div>
              <span className="eyebrow">Madrinas y padrinos</span>
              <h2>Gente conocida que presta su voz a un perro.</h2>
              <p className="lead" style={{ marginTop: 14 }}>Cada madrina o padrino acompaña a los perros del proyecto: comparte sus fichas, cuenta sus historias y, si puede, viene a una sesión. Hasta que tengan casa.</p>
              <p className="hand" style={{ marginTop: 14 }}>Ni dinero ni exclusividad. Solo su voz.</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}><Link className="btn" href="/madrinas">Conócelas <span className="ic">→</span></Link><Link className="btn ghost" href="/colabora#contacto">Quiero apadrinar</Link></div>
            </div>
            <div className="mgrid">{MADRINAS.slice(0, 3).map((m, i) => <MadrinaCard key={m.id} m={m} i={i} d={m.perro ? getDogIn(cat, m.perro) : undefined} />)}</div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="colabora">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Colabora</span><h2>Para quien tiene perros, para quien tiene sedes y para quien quiere volver algo a los centros.</h2></Reveal>
          <Reveal className="trio">
            <article className="tcard l"><span className="phase">Protectoras y centros</span><h3>Una mañana. Fotos para siempre.</h3><p>Vosotros ponéis los perros y una persona que los conozca. Nosotros, el equipo, el material y las fichas. Participar en el piloto no tiene coste y vosotros mantenéis el control del proceso de adopción.</p><ul><li>Sesión en vuestro centro</li><li>Perfiles publicados solo con vuestra autorización</li><li>Las consultas os llegan a vosotros</li></ul><Link className="btn" href="/colabora#protectoras">Ver cómo participar</Link></article>
            <article className="tcard m"><span className="phase">Instituciones</span><h3>Un programa con nombre, imagen y datos.</h3><p>Convenio para el piloto, acceso a los centros municipales y presencia en fichas, carteles y web. Indicadores trimestrales de perfiles, consultas y adopciones reportadas.</p><ul><li>Piloto: 5–10 protectoras, 30–50 perros</li><li>Captación nacional, despliegue por fases</li><li>Alineado con la Ley 7/2023</li></ul><Link className="btn" href="/colabora#instituciones">Pedir el dossier</Link></article>
            <article className="tcard c"><span className="phase">Empresas · más adelante</span><h3>Tu marca donde está la gente que adopta.</h3><p>Cuando haya audiencia, las empresas de alimentación, veterinaria y peluquería canina tendrán espacio en la web y el merchandising, con condiciones transparentes. Un porcentaje de cada acuerdo vuelve a los centros.</p><ul><li>Donativos a las protectoras colaboradoras</li><li>Ventajas para quien adopta con nosotros</li><li>Resultados publicados</li></ul><Link className="btn" href="/colabora#empresas">Hablemos</Link></article>
          </Reveal>
        </div>
      </section>

      <section className="band" id="promesas">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Para que no haya sorpresas</span><h2>Lo que hacemos y lo que no.</h2></Reveal>
          <Reveal className="promise">
            <div className="col si"><h3>Hacemos</h3><ul><li><i>✓</i>Fotografiar gratis a los perros de los centros del piloto, fuera de la jaula.</li><li><i>✓</i>Publicar fichas revisadas por su protectora, con fecha y estado.</li><li><i>✓</i>Pasar tu consulta tal cual a la protectora, con los datos mínimos.</li><li><i>✓</i>Decir «no evaluado» cuando no sabemos algo.</li><li><i>✓</i>Publicar cada trimestre cuántos perros, consultas y adopciones ha habido.</li></ul></div>
            <div className="col no"><h3>Nunca</h3><ul><li><i>✕</i>Entregar animales ni cobrar por una adopción.</li><li><i>✕</i>Prometer que un match garantiza una buena convivencia.</li><li><i>✕</i>Decidir por la protectora o saltarnos su proceso.</li><li><i>✕</i>Vender o ceder tus datos a nadie que no sea la protectora del perro.</li><li><i>✕</i>Publicar un perro sin autorización escrita de su entidad.</li></ul></div>
          </Reveal>
        </div>
      </section>

      <section className="band crema curve" id="faq">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Preguntas que nos hacen</span><h2>Antes de escribir a una protectora.</h2></Reveal>
          <Reveal><Faq /></Reveal>
        </div>
      </section>

      <section className="band crema curve" id="app">
        <div className="wrap">
          <Reveal className="split">
            <div>
              <span className="eyebrow">Web móvil hoy · app cuando haya uso</span>
              <h2>El match, en el bolsillo.</h2>
              <p className="lead">Empezamos con esta web, que ya funciona en el móvil: perfiles, filtros, favoritos y contacto con la protectora. El cuestionario de compatibilidad y las alertas llegan cuando los datos digan que ayudan. La app nativa, cuando haya uso recurrente que la justifique.</p>
              <div className="feat">
                <div><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#F2A93B" stroke="#161616" strokeWidth="2.5" /><path d="M11 17l4 4 8-9" fill="none" stroke="#161616" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg><span><b>Orientación, no sentencia</b>Afinidades y avisos explicados con palabras; la protectora valora cada caso.</span></div>
                <div><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#E8734A" stroke="#161616" strokeWidth="2.5" /><path d="M17 9v8l5 3" fill="none" stroke="#161616" strokeWidth="3" strokeLinecap="round" /></svg><span><b>Fichas al día</b>Estado visible, fecha de revisión y un canal para avisar si algo ha cambiado.</span></div>
                <div><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#C9CF58" stroke="#161616" strokeWidth="2.5" /><path d="M10 20h14M12 14h10" fill="none" stroke="#161616" strokeWidth="3" strokeLinecap="round" /></svg><span><b>Solo los datos necesarios</b>Tu consulta va a la protectora del perro, con aviso de privacidad antes de enviarla.</span></div>
              </div>
            </div>
            <div className="bezel"><div className="pic"><Image src="/img/lasa/4e6a6933.jpg" alt="Perro marrón sonriendo a la cámara sobre fondo mostaza, en la sesión de APAAL" width={1067} height={1600} sizes="(max-width: 860px) 100vw, 50vw" style={{ objectPosition: foco("/img/lasa/4e6a6933.jpg", 1) }} /></div></div>
          </Reveal>
        </div>
      </section>

      <section className="band crema curve" id="quienes">
        <div className="wrap">
          <Reveal className="team">
            <div>
              <span className="eyebrow">Quiénes somos</span>
              <h2>La idea nace de una fotógrafa profesional. La sacamos adelante un equipo y una red de voluntarios.</h2>
              <p className="q" style={{ marginTop: 22 }}>«Mira quién te espera.»</p>
            </div>
            <dl>
              <div><dt>Fotografía y dirección creativa</dt><dd>Una fotógrafa profesional, origen de la idea. Pone el ojo, la cámara y las mañanas en los centros.</dd></div>
              <div><dt>Tecnología, diseño y producto</dt><dd>Arquitectura del producto, diseño de la web y la app, seguridad y mantenimiento. Hacen que las fichas lleguen a quien tiene que verlas.</dd></div>
              <div><dt>Desarrollo e instituciones</dt><dd>Captación de protectoras en toda España, reuniones con ayuntamientos y patrocinadores, merchandising y vídeo.</dd></div>
              <div><dt>Voluntariado</dt><dd>Sujetan correas, montan exposiciones, reparten placas y comparten fichas. Si quieres ser parte, escríbenos.</dd></div>
            </dl>
          </Reveal>
        </div>
      </section>
      <section className="final" id="final">
        <div className="ghost-t" aria-hidden="true">TE ESPERA</div>
        <div className="wrap">
          <div><span className="eyebrow" style={{ borderColor: "rgba(244,236,220,.45)" }}>Empieza ahora</span><h2>Hay un perro que ya te está esperando.</h2><p className="lead" style={{ marginTop: 18 }}>Cuatro preguntas, un minuto, y te lo presentamos. Sin registro, sin compromiso: la protectora valora cada caso.</p><div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn cream" href="/match">Haz match en un minuto <span className="ic">→</span></Link><Link className="btn ghost" style={{ color: "var(--crema)", borderColor: "var(--crema)" }} href="/perros">Ver todos los perros</Link></div></div>
          <div className="art"><img src="/brand/perro-galgo.svg" alt="" /></div>
        </div>
      </section>
    </main>
  );
}
