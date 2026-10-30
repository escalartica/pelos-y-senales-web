"use client";
import Link from "next/link";
import type { Dog } from "@/lib/data";
import { useCatalog, protOf } from "./CatalogProvider";
import { orient, type Life } from "@/lib/orient";
import DogArt from "./DogArt";
import FavButton from "./FavButton";
import EstadoBadge from "./EstadoBadge";

export default function DogCard({ d, life }: { d: Dog; life?: Life }) {
  const { prot } = useCatalog(); const p = protOf(prot, d.prot);
  const o = life ? orient(d, life) : null;
  return (
    <Link className="dogcard" href={`/perros/${d.id}`} aria-label={`Ficha de ${d.n}`}>
              <div style={{ position: "relative" }}>
          <DogArt d={d} />
          <EstadoBadge d={d} />
          <FavButton id={d.id} />
        </div>
      <div className="body">
        <div className="name"><b>{d.n}</b><small>{d.edadTxt.replace(/ \(.*\)/, "")} · {d.tam}</small></div>
        <div className="loc">{[p.ciudad, p.n].filter(Boolean).join(" · ")}</div>
        <p className="desc">{d.desc}</p>
        <div className="tags">{d.rasgos.map((t) => <span key={t}>{t}</span>)}{d.esp && <span className="warn">Necesidades especiales</span>}</div>
        <div className="foot">{o ? <span className="aff">Encaja en {o.ok} de {o.tot}</span> : <span>{p.n}</span>}<span className="card-btn">Ver ficha</span></div>
      </div>
    </Link>
  );
}
