import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getCatalog, getDogIn, dogsOfIn, madrinaOfIn } from "@/lib/catalog";
import { entidades } from "@/lib/spain";
export const metadata: Metadata = { alternates: { canonical: "/protectoras" }, title: "Protectoras", description: "Las protectoras que colaboran con Pelos y Señales y cómo sumarse. Participar no tiene coste y la protectora decide siempre." };
export default async function Protectoras() {
  const cat = await getCatalog(); const PROT = cat.prot; const dogsOf = (id: string) => dogsOfIn(cat, id); const ENT = entidades(PROT);
  const otras = ENT.filter((e) => !e.colab);
  const provs = new Set(otras.map((e) => e.prov)).size;
  return (
    <main>
      <div className="wrap listhead">
        <span className="eyebrow">Protectoras y centros</span>
        <h1>Protectoras: vosotras decidís, nosotras hacemos que os vean.</h1>
        <p className="lead">Vosotras y vuestro voluntariado hacéis lo más difícil: rescatar, curar y cuidar a cada perro hasta que llega su familia. Nuestro trabajo es que se os vea. Fotografiamos a vuestros perros sin coste, publicamos sus fichas con vuestra autorización y os pasamos las consultas de las familias. La valoración, el contrato y el seguimiento siguen siendo vuestros.</p>
        <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn" href="/colabora#contacto">Quiero participar con mi protectora</Link><Link className="btn ghost" href="/perros">Ver los perros</Link></div>
      </div>
      <div className="wrap">
        <Reveal className="prop">
          <div className="box">
            <span className="eyebrow">Lo que proponemos</span>
            <h2>Gratuito, sin exclusividad y sin letra pequeña.</h2>
            <ol>
              <li>Nos escribís y os visitamos para conocer el centro y a sus perros.</li>
              <li>Una mañana de fotos en vuestro centro, con alguien que los conozca.</li>
              <li>Publicamos su ficha con vuestro contacto directo, solo con vuestra autorización escrita.</li>
              <li>Sin exclusividad y con permiso revocable: podéis corregir, pausar o retirar una ficha cuando queráis.</li>
              <li>Las consultas os llegan a vosotros. Valoráis, entrevistáis y decidís.</li>
            </ol>
            <Link className="btn" href="/colabora#contacto">Escribirnos</Link>
          </div>
          <div className="map">
            <span className="eyebrow">En el mapa</span>
            <div className="big">{ENT.length}</div>
            <p style={{ fontSize: 14, color: "var(--ink-60)", margin: 0 }}>protectoras, refugios y centros municipales de {provs} provincias en nuestro mapa, colaboren o no con nosotros, con su enlace y su contacto público.</p>
            <Link className="btn ghost sm" href="/mapa" style={{ alignSelf: "flex-start" }}>Ver el mapa</Link>
            <p style={{ fontSize: 12, color: "var(--ink-60)", margin: 0 }}>¿Falta la vuestra o hay un dato que corregir? Escribidnos y lo cambiamos.</p>
          </div>
        </Reveal>
        <h2 style={{ margin: "0 0 18px", fontSize: "clamp(24px,2.6vw,32px)" }}>Las que ya colaboran</h2>
      </div>
      <div className="wrap plist">
        {Object.values(PROT).map((p) => { const n = dogsOf(p.id).length; return (
          <article key={p.id} className="pcard"><h2><Link href={`/protectoras/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>{p.n}</Link></h2>{p.ciudad && <div className="meta">{p.ciudad}{p.prov && p.prov !== p.ciudad ? ` · ${p.prov}` : ""}</div>}<div className="n">{n}<small>{n === 1 ? "perro en la web" : "perros en la web"}</small></div><p style={{ fontSize: 14, color: "var(--ink-60)" }}>{p.desc}</p>{(p.tel || p.mail) && <div className="c">{[p.tel, p.mail].filter(Boolean).join(" · ")}</div>}{p.horas && <div className="meta">{p.horas}</div>}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Link className="btn sm" href={`/protectoras/${p.id}`}>Ver la protectora</Link></div></article>
        ); })}
      </div>
    </main>
  );
}
