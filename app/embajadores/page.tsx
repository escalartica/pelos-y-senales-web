import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import MadrinaCard from "@/components/MadrinaCard";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";

export const metadata: Metadata = { alternates: { canonical: "/embajadores" }, title: "Embajadores", description: "Los embajadores de Pelos y Señales prestan su voz a los perros del proyecto: comparten su ficha, cuentan su historia y vienen a la sesión si pueden." };

const PEDIMOS = [["Una frase", "Para la ficha del perro al que acompaña. Con su nombre, en sus palabras."], ["Una publicación al mes", "Su perro en sus redes, con el enlace a la ficha. Nosotros preparamos el material."], ["Venir si pueden", "A la sesión de fotos o a la exposición. Sin obligación: ya ayudan con lo anterior."], ["Cuando se adopta, contarlo", "La mejor noticia es la que cierra el círculo. Y elegir otro perro, si quieren."]];
const NO = ["No les pedimos dinero.", "No hay exclusividad: pueden apoyar a otras causas.", "No firman nada; se van cuando quieran.", "No eligen quién adopta: eso lo hace la protectora."];

export default async function Madrinas() {
  const cat = await getCatalog();
  // Una madrina o padrino se muestra cuando ya tiene foto propia o ahijado: sin ninguna de las dos la tarjeta sale vacía.
  const MADRINAS = cat.madrinas.filter((m) => m.foto || m.perro);
  return (
    <main>
      <div className="wrap listhead emb">
        <span className="eyebrow">Embajadores</span>
        <h1>Gente que presta su voz.</h1>
        <p className="lead">Corazones solidarios que serán nuestro altavoz para hacer realidad que el máximo número de familias y peludos se encuentren.</p>
        <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn" href="/colabora#contacto">Quiero ser embajador</Link><Link className="btn ghost" href="/perros">Ver los perros</Link></div>
      </div>

      {MADRINAS.length > 0 && <section className="band" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <Reveal className="mgrid">{MADRINAS.map((m, i) => <MadrinaCard key={m.id} m={m} i={i} as="h2" d={m.perro ? getDogIn(cat, m.perro) : undefined} />)}</Reveal>
        </div>
      </section>}

      <section className="band" id="mini-embajadora" style={{ paddingTop: MADRINAS.length ? 0 : 44 }}>
        <div className="wrap">
          <Reveal className="lola">
            <figure><img src="/img/embajadoras/lola-retrato.jpg" alt="Lola, mini embajadora de Pelos y Señales, con su perro Chico en brazos" width={1200} height={1800} loading="lazy" /></figure>
            <div className="txt">
              <span className="eyebrow">Mini embajadora</span>
              <h2>Lola, la voz más joven de Pelos y Señales.</h2>
              <p>Lola es nuestra mini embajadora. Se ha puesto la camiseta y ha posado con su peludo Chico con la misma naturalidad que los perros a los que queremos dar voz.</p>
              <p>Además de ayudar acompañándonos a algunas protectoras, nuestra pequeña todoterreno será la encargada de contar el proyecto entre los más jóvenes.</p>
              <p className="hand">Gracias, Lola. Contigo llegamos a quienes van a decidir cómo se trata a los animales mañana.</p>
              <figure><img src="/img/embajadoras/lola-estudio.jpg" alt="Lola sentada en el estudio con la camiseta de Pelos y Señales, acariciando a su perro Chico" width={1800} height={1200} loading="lazy" /></figure>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band crema curve" id="como-funciona">
        <div className="wrap">
          <Reveal className="split" style={{ alignItems: "start" }}>
            <div>
              <span className="eyebrow">Qué les pedimos</span>
              <h2>Poco, pero de verdad.</h2>
              <div className="ways" style={{ gridTemplateColumns: "repeat(2,1fr)", marginTop: 24 }}>{PEDIMOS.map(([b, p]) => <div key={b} className="way"><b>{b}</b><p>{p}</p></div>)}</div>
            </div>
            <div className="guide" style={{ flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
              <img src="/brand/perro-scottie.svg" alt="" style={{ width: 150, height: 150 }} />
              <span className="eyebrow">Y lo que no</span>
              <ul className="mno">{NO.map((x) => <li key={x}>{x}</li>)}</ul>
              <Link className="btn" href="/colabora#contacto">Proponer a alguien <span className="ic">→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
