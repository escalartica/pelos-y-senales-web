import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONV_TXT, ACT_TXT, protOf } from "@/lib/data";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";
import DogArt from "@/components/DogArt";
import { foco } from "@/lib/foco";
import DogCard from "@/components/DogCard";
import FavButton from "@/components/FavButton";
import ShareButton from "@/components/ShareButton";
import PosterButton from "@/components/PosterButton";
import StickyBar from "@/components/StickyBar";
import Orient from "@/components/Orient";
import ContactForm from "@/components/ContactForm";
import EstadoBadge from "@/components/EstadoBadge";
import Upd from "@/components/Upd";
import EstadoAviso from "@/components/EstadoAviso";

type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return (await getCatalog()).dogs.map((d) => ({ slug: d.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const cat = await getCatalog(); const d = getDogIn(cat, slug); if (!d) return {};
  const p = protOf(cat.prot, d.prot);
  return { title: `${d.n}, ${d.raza.toLowerCase()} en adopción${p.ciudad ? ` en ${p.ciudad}` : ""}`, description: d.desc };
}

export default async function Ficha({ params }: Props) {
  const { slug } = await params; const cat = await getCatalog(); const d = getDogIn(cat, slug); if (!d) notFound();
  const p = protOf(cat.prot, d.prot);
  const facts: [string, string][] = [["Edad", d.edadTxt], ["Tamaño", d.peso ? `${d.tam} · ${d.peso}` : d.tam], ["Sexo", d.sexo], ["Actividad", ACT_TXT[d.act]], ["Con niños", CONV_TXT[d.conv.ninos]], ["Con perros", CONV_TXT[d.conv.perros]], ["Con gatos", CONV_TXT[d.conv.gatos]], ["Zona", p.ciudad ? `${p.ciudad}${p.prov && p.prov !== p.ciudad ? ` (${p.prov})` : ""}` : p.n], ["Raza o mezcla", d.raza]];
  const related = dogsOfIn(cat, d.prot).filter((x) => x.id !== d.id);
  const mad = madrinaOfIn(cat, d.id);
  return (
    <main>
      <div className="wrap ficha-top">
        <div className="crumbs"><Link href="/">Inicio</Link><span>›</span><Link href="/perros">Perros</Link><span>›</span><span>{d.n}</span></div>
        <div className="ficha">
          <div className="gallery">
            <DogArt d={d} className="main" sizes="(max-width: 900px) 100vw, 50vw" priority />
            <div className="thumbs">{d.photo ? <div className="has" aria-hidden="true"><img src={d.photo} alt="" style={{ objectPosition: foco(d.photo, 1) }} /><span>Retrato</span></div> : <div className="soon"><span>Retrato</span><small>próxima sesión</small></div>}{(d.photos ?? []).slice(0, 2).map((ph) => <div key={ph.src} className="has" aria-hidden="true"><img src={ph.src} alt="" style={{ objectPosition: foco(ph.src, 1) }} /><span>{ph.cap}</span></div>)}{Array.from({ length: Math.max(0, 2 - (d.photos?.length ?? 0)) }).map((_, i) => <div key={i} className="soon"><span>{i === 0 && !(d.photos?.length) ? "Corriendo" : "Comiendo"}</span><small>próxima sesión</small></div>)}</div>
            {d.provisional && <p className="note" style={{ color: "var(--coral)" }}>Ficha provisional: nombre y datos pendientes de confirmar con la protectora.</p>}<p className="note">Fotografías autorizadas por {p.n}. Ficha revisada el <Upd d={d} />. <Link href="/colabora#contacto">Avisar de un dato desfasado</Link>.</p>
          </div>
          <div className="info">
            <h1>{d.n}</h1>
            <div className="sub"><EstadoBadge d={d} kind="status" /><span>{d.raza}</span><span>·</span><span>{p.n}{p.ciudad && `, ${p.ciudad}`}</span></div>
            <div className="tags" style={{ marginTop: 16 }}>{d.rasgos.map((t) => <span key={t} className="hit">{t}</span>)}</div>
            <div className="facts">{facts.map(([k, v]) => <div key={k} className="fact"><small>{k}</small><b className={v === "No evaluado" ? "na" : ""}>{v}</b></div>)}</div>
            <div className="ctas"><a className="btn coral" href="#consulta">Me interesa conocerle <span className="ic">→</span></a><FavButton id={d.id} label /><ShareButton /><PosterButton d={d} /></div>
            <EstadoAviso d={d} />
            {d.acogida && <p className="note" style={{ fontWeight: 700, marginTop: 12 }}>{p.n.split(" · ")[0]} busca para {d.sexo === "hembra" ? "ella" : "él"} adopción o casa de acogida.</p>}
            <div className="section"><h2>Cómo es</h2><p>{d.desc}</p><p style={{ marginTop: 10 }}>{d.pers}</p></div>
            <div className="section"><h2>Lo que necesita</h2><ul>{d.nec.map((x) => <li key={x}>{x}</li>)}{d.esp && <li><b>Necesidades especiales:</b> {d.espTxt}</li>}</ul></div>
            <div className="section"><h2>Su historia</h2><p>{d.hist}</p></div>
            {mad && <div className="madbox"><span className="eyebrow">{d.sexo === "hembra" ? "Su madrina o padrino" : "Su padrino o madrina"}</span>{mad.frase && <p className="mq">«{mad.frase}»</p>}<p className="who"><b>{mad.n}</b> · {mad.rol} · <Link href="/madrinas">Ver madrinas y padrinos</Link></p></div>}
            <Orient d={d} />
            <div className="contactbox" id="protectora">
              <h2>Habla con su protectora</h2>
              <p className="who">{p.n}{p.ciudad && ` · ${p.ciudad}`}. Ellos valoran, entrevistan y deciden.</p>
              <div className="lines">{p.web && !p.tel && !p.mail && <><small>Contacto</small><a href={p.web} target="_blank" rel="noopener noreferrer">Su página</a></>}{p.tel && <><small>Teléfono</small><a href={`tel:${p.tel.replace(/\s/g, "")}`}>{p.tel}</a></>}{p.mail && <><small>Correo</small><a href={`mailto:${p.mail}`}>{p.mail}</a></>}</div>
              <div className="btns"><a className="btn cream sm" href="#consulta">Escribir desde aquí</a><Link className="btn ghost sm" style={{ color: "var(--crema)", borderColor: "var(--crema)" }} href={`/protectoras/${p.id}`}>Ver la protectora</Link></div>
              {p.horas && <p className="hours">{p.horas}</p>}
            </div>
          </div>
        </div>
        <ContactForm d={d} p={p} />
      </div>
      {related.length > 0 && <div className="wrap related"><h2>Más perros de esta protectora</h2><div className="cards">{related.map((x) => <DogCard key={x.id} d={x} />)}</div></div>}
      <StickyBar id={d.id} />
    </main>
  );
}
