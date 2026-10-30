import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";
import DogCard from "@/components/DogCard";
import Reveal from "@/components/Reveal";
import ShareButton from "@/components/ShareButton";

type Props = { params: Promise<{ id: string }> };
export async function generateStaticParams() { return Object.keys((await getCatalog()).prot).map((id) => ({ id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; const p = (await getCatalog()).prot[id]; if (!p) return {};
  return { title: `${p.n}, perros en adopción${p.ciudad ? ` en ${p.ciudad}` : ""}`, description: p.desc };
}
const AYUDA = [["Adoptar", "Haz match con uno de sus perros y escríbeles desde su ficha."], ["Acoger", "Una casa temporal mientras encuentra la suya. Pregúntales si lo necesitan."], ["Ser voluntario", "Pasear, limpiar, ayudar en las jornadas. Más manos en los centros es nuestro segundo objetivo."], ["Compartir", "Una ficha en tu historia llega a gente a la que nadie más llega."]];

export default async function Protectora({ params }: Props) {
  const { id } = await params; const cat = await getCatalog(); const p = cat.prot[id]; if (!p) notFound();
  const dogs = dogsOfIn(cat, id);
  const facts: [string, React.ReactNode][] = [];
  if (p.ciudad) facts.push(["Dónde", `${p.ciudad}${p.prov && p.prov !== p.ciudad ? ` (${p.prov})` : ""}`]);
  if (p.horas) facts.push(["Horario de visitas", p.horas]);
  if (p.tel) facts.push(["Teléfono", <a key="t" href={`tel:${p.tel.replace(/\s/g, "")}`}>{p.tel}</a>]);
  if (p.mail) facts.push(["Correo", <a key="m" href={`mailto:${p.mail}`}>{p.mail}</a>]);
  if (p.web) facts.push(["En internet", <a key="w" href={p.web} target="_blank" rel="noopener noreferrer">Su página</a>]);
  return (
    <main>
      <div className="wrap ficha-top">
        <div className="crumbs"><Link href="/">Inicio</Link><span>›</span><Link href="/protectoras">Protectoras</Link><span>›</span><span>{p.n}</span></div>
        <div className="phero">
          <div>
            <span className="eyebrow">Colabora con Pelos y Señales</span>
            <h1>{p.n}</h1>
            <p className="lead">{p.desc}</p>
            {facts.length > 0 && <div className="pfacts">{facts.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>}
            <div className="ctas" style={{ marginTop: 22 }}>{p.mail && <a className="btn coral" href={`mailto:${p.mail}?subject=Consulta%20desde%20Pelos%20y%20Se%C3%B1ales`}>Escribir a la protectora <span className="ic">→</span></a>}<Link className="btn ghost" href="/perros">Ver todos los perros</Link><ShareButton /></div>
            <p className="note" style={{ marginTop: 14 }}>Ellos valoran, entrevistan y deciden. Nosotros solo os presentamos.</p>
          </div>
          <div className="pnum"><b>{dogs.length}</b><span>{dogs.length === 1 ? "perro en la web" : "perros en la web"}</span></div>
        </div>
      </div>

      <section className="band" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Sus perros</span><h2>{dogs.length === 1 ? "Quien te espera" : "Quiénes te esperan"}{p.ciudad ? ` en ${p.ciudad}` : ""}.</h2></Reveal>
          {dogs.length ? <div className="cards">{dogs.map((d) => <DogCard key={d.id} d={d} />)}</div> : <div className="empty">Estamos preparando sus fichas con la protectora. Muy pronto, aquí.</div>}
        </div>
      </section>

      <section className="band crema curve">
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Además de adoptar</span><h2>Cómo ayudar a {p.n}.</h2></Reveal>
          <Reveal className="ways" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>{AYUDA.map(([b, t]) => <div key={b} className="way"><b>{b}</b><p>{t}</p></div>)}</Reveal>
        </div>
      </section>
    </main>
  );
}
