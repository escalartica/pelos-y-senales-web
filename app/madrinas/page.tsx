import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import MadrinaCard from "@/components/MadrinaCard";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";

export const metadata: Metadata = { title: "Madrinas y padrinos", description: "Personas conocidas que prestan su voz a un perro del proyecto: comparten su ficha, cuentan su historia y vienen a la sesión si pueden." };

const PEDIMOS = [["Una frase", "Para la ficha de su ahijado o ahijada. Con su nombre, en sus palabras."], ["Una publicación al mes", "Su ahijado en sus redes, con el enlace a la ficha. Nosotros preparamos el material."], ["Venir si pueden", "A la sesión de fotos o a la exposición. Sin obligación: ya ayudan con lo anterior."], ["Cuando se adopta, contarlo", "La mejor noticia es la que cierra el círculo. Y elegir otro ahijado, si quieren."]];
const NO = ["No les pedimos dinero.", "No hay exclusividad: pueden apoyar a otras causas.", "No firman nada; se van cuando quieran.", "No eligen quién adopta: eso lo hace la protectora."];

export default async function Madrinas() {
  const cat = await getCatalog(); const MADRINAS = cat.madrinas;
  return (
    <main>
      <div className="wrap listhead">
        <span className="eyebrow">Madrinas y padrinos</span>
        <h1>Gente conocida que presta su voz a un perro.</h1>
        <p className="lead">Gente con voz y con público que la presta a los perros del proyecto: comparte sus fichas, cuenta sus historias y nos ayuda a llegar a quien puede adoptar. Cada madrina o padrino elige a un perro y lo acompaña hasta que tiene casa.</p>
        <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn" href="/colabora#contacto">Quiero ser madrina o padrino</Link><Link className="btn ghost" href="/perros">Ver los perros</Link></div>
      </div>

      <section className="band" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <Reveal className="mgrid">{MADRINAS.map((m, i) => <MadrinaCard key={m.id} m={m} i={i} as="h2" d={m.perro ? getDogIn(cat, m.perro) : undefined} />)}</Reveal>
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
