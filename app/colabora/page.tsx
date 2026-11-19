import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Image from "next/image";
import { foco } from "@/lib/foco";
import ContactoForm from "@/components/ContactoForm";
export const metadata: Metadata = { alternates: { canonical: "/colabora" }, title: "Colabora", description: "Protectoras, instituciones, veterinarios, educadores, peluquerías, comercios, minisesiones solidarias y seis maneras de ayudar." };
const QUIEN = [
  ["🩺", "Clínicas y hospitales veterinarios", "Revisión inicial, vacunas, microchip y esterilización a tarifa solidaria. Un bono de bienvenida para quien adopta con nosotros.", "Prioridad alta"],
  ["🎓", "Educadores caninos", "Sesiones de adaptación en las primeras semanas en casa, cuando más se devuelven perros. Charlas de convivencia en los centros.", "Prioridad alta"],
  ["✂️", "Peluquerías caninas", "Baño y arreglo de bienvenida para cada perro adoptado. Jornadas solidarias de higiene en la protectora.", ""],
  ["🛒", "Tiendas y distribuidores", "Primer saco de pienso, accesorios, vales y puntos de recogida de donaciones. Una placa QR en el mostrador.", ""],
  ["🏛️", "Ayuntamientos y diputaciones", "Jornadas de adopción, difusión municipal y acceso a los centros de recogida. Un convenio sencillo para el piloto.", "Prioridad alta"],
  ["🏭", "Empresas y comercios", "Impresión, transporte, espacios para la exposición. Pedimos una aportación concreta y medible, nunca un cheque en blanco.", ""],
  ["📚", "Universidades y centros educativos", "Voluntariado estable, prácticas compatibles con la normativa y campañas de sensibilización en el aula.", ""],
  ["🎪", "Asociaciones vecinales y ferias", "Un stand, una recogida de alimentos o una jornada de adopción en la fiesta del barrio. Con permiso municipal y plan de bienestar.", ""],
];
const WAYS = [["Adoptar", "La forma más directa. Haz match, conoce al perro y sigue el proceso de su protectora."], ["Acoger", "Un perro en tu casa unas semanas mientras encuentra la suya."], ["Ser voluntario", "Pasear, limpiar, sujetar en una sesión de fotos."], ["Compartir", "Una ficha en tu historia llega a gente a la que nosotros no llegamos."], ["Acoger la exposición", "¿Tienes un bar, una tienda, una sala? Un mes con veinte perros en la pared."], ["Una minisesión solidaria", "Un retrato de tu peludo en nuestro stand o en el estudio. Con cada una colaboras con el proyecto."]];
export default function Colabora() {
  return (
    <main>
      <div className="wrap listhead"><span className="eyebrow">Colabora</span><h1>Colabora a tu manera.</h1></div>
      <section className="band" id="protectoras" style={{ paddingTop: 40 }}>
        <div className="wrap"><Reveal className="trio">
          <article className="tcard l"><span className="phase">Protectoras y centros</span><h2>Una mañana. Fotos para siempre.</h2><p>Vosotros ponéis los perros y una persona que los conozca. Nosotros, el equipo, el material y las fichas. Participar en el piloto no tiene coste y vosotros mantenéis el control del proceso de adopción.</p><ul><li>Sesión en vuestro centro</li><li>Perfiles publicados solo con vuestra autorización escrita</li><li>Las consultas os llegan a vosotros, con los datos mínimos</li><li>Podéis corregir, pausar o retirar una ficha cuando queráis</li></ul><a className="btn" href="#contacto">Pedir una reunión de 20 minutos</a></article>
          <article className="tcard m" id="instituciones"><span className="phase">Instituciones</span><h2>Un programa con nombre, imagen y datos.</h2><p>Convenio para el piloto, acceso a los centros municipales y presencia en fichas, carteles y web. Indicadores trimestrales de perfiles, consultas y adopciones reportadas.</p><ul><li>Piloto: 5–10 protectoras, 30–50 perros</li><li>Captación nacional, despliegue por fases</li><li>Alineado con la Ley 7/2023</li></ul><a className="btn" href="#contacto">Pedir el dossier</a></article>
          <article className="tcard c" id="empresas"><span className="phase">Empresas · más adelante</span><h2>Tu marca donde está la gente que adopta.</h2><p>Cuando haya audiencia, las empresas de alimentación, veterinaria y peluquería canina tendrán espacio en la web y el merchandising, con condiciones transparentes. Un porcentaje de cada acuerdo vuelve a los centros.</p><ul><li>Donativos a las protectoras colaboradoras</li><li>Ventajas para quien adopta con nosotros</li><li>Resultados publicados</li></ul><a className="btn" href="#contacto">Hablemos</a></article>
        </Reveal></div>
      </section>
      <section className="band" id="quien" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Con quién queremos contar</span><h2>Lo que le pedimos a cada uno es concreto y cabe en una frase.</h2><p className="lead">A cada uno le proponemos algo pequeño, concreto y medible. Si te ves en esta lista, escríbenos.</p></Reveal>
          <Reveal className="cgrid">{QUIEN.map(([ico, b, p, tag]) => <article key={b} className="ccard"><span className="ico" aria-hidden="true">{ico}</span><b>{b}</b><p>{p}</p>{tag && <small>{tag}</small>}</article>)}</Reveal>
        </div>
      </section>
      <section className="band crema" id="sedes">
        <div className="wrap">
          <Reveal className="split" style={{ marginBottom: 40 }}><div><span className="eyebrow">Seis maneras de ayudar</span><h2>Tanto si puedes adoptar como si solo puedes compartir.</h2><p className="lead" style={{ marginTop: 14 }}>Más manos en los centros es el segundo objetivo del proyecto. Elige la tuya.</p></div><div className="bezel"><div className="pic"><Image src="/img/lasa/4e6a6645.jpg" alt="Pastor alemán con collar naranja y la lengua fuera sobre fondo mostaza, en la sesión de APAAL" width={1067} height={1600} sizes="(max-width: 860px) 100vw, 50vw" style={{ objectPosition: foco("/img/lasa/4e6a6645.jpg", 1) }} /></div></div></Reveal>
          <Reveal className="ways">{WAYS.map(([b, p]) => <div key={b} className="way"><b>{b}</b><p>{p}</p></div>)}<div className="way" style={{ background: "var(--tinta)", color: "var(--crema)", borderColor: "var(--tinta)" }}><b>Y una más</b><p style={{ color: "rgba(244,236,220,.75)" }}>Si trabajas en una clínica o una tienda, pide una placa QR de tu zona para el mostrador.</p></div></Reveal>
        </div>
      </section>
      <section className="band" id="minisesiones">
        <div className="wrap"><Reveal className="minis">
          <div className="txt">
            <span className="eyebrow">Otra forma de colaborar</span>
            <h2>Minisesiones solidarias</h2>
            <p className="lead">Un retrato divertido de tu animal en un turno corto. Con cada minisesión colaboras con Pelos y Señales, en beneficio de los perros de protectora que todavía esperan casa.</p>
            <p>Dorian y su hermano peludo Konchu vinieron a pasarlo en grande delante de la cámara. Se llevaron un recuerdo lleno de risas y lametones… y, sin darse cuenta, ayudaron a que otros perros de Pelos y Señales estén un poco más cerca de encontrar su hogar.</p>
            <p className="hand">¿Os animáis a ser los siguientes? Una minisesión, un recuerdo para siempre y un gesto que cambia vidas.</p>
            <div className="minimodos"><div><b>En nuestro stand</b><p>En exposiciones, conciertos y otros eventos donde esté Pelos y Señales. Sin reserva: te acercas y la hacemos en el momento.</p></div><div><b>En el estudio de fotografía</b><p>Con día y hora reservados. Escríbenos y buscamos un hueco.</p></div></div>
            <div><a className="btn" href="/colabora?tipo=minisesion#contacto">Quiero una minisesión <span className="ic">→</span></a></div>
          </div>
          <div className="fotos">
            <figure><img src="/img/minisesiones/dorian-konchu-minisesion.jpg" alt="Dorian, un bebé con la camiseta de Pelos y Señales, riendo junto a su perro Konchu, un teckel con sudadera azul, sobre fondo mostaza" width={1200} height={1799} loading="lazy" /></figure>
            <figure><img src="/img/minisesiones/konchu-minisesion.jpg" alt="Konchu, un teckel con sudadera azul, mirando a cámara con la lengua fuera sobre fondo mostaza" width={1200} height={1800} loading="lazy" /></figure>
          </div>
        </Reveal></div>
      </section>
      <section className="band" id="contacto">
        <div className="wrap"><Reveal className="split">
          <div><span className="eyebrow">Escríbenos</span><h2>Veinte minutos para escucharte.</h2><p className="lead">En la primera conversación solo pedimos eso: escuchar qué necesitáis y, si encaja, una segunda llamada para estudiar una colaboración piloto. Nada más.</p><p className="contactbig"><a href="mailto:info@xn--pelosyseales-hhb.com">info@pelosyseñales.com</a></p><p style={{ marginTop: 10, fontWeight: 700 }}><a href="tel:+34635025378">+34 635 025 378</a> · <a href="https://www.instagram.com/pelosysenales.es/" target="_blank" rel="noopener noreferrer">@pelosysenales.es</a></p></div>
          <ContactoForm />
        </Reveal></div>
      </section>
    </main>
  );
}
