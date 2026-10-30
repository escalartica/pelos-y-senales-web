"use client";
import Link from "next/link";
import type { Dog } from "@/lib/data";
import { orient } from "@/lib/orient";
import { useLife } from "@/lib/store";
export default function Orient({ d }: { d: Dog }) {
  const { life } = useLife(); const o = orient(d, life);
  if (!o) return <div className="orient"><h2>¿Quieres saber cómo encaja contigo?</h2><p className="small">Cuéntanos cómo vives en el listado y aquí te señalaremos afinidades y avisos, explicados con palabras.</p><p className="link"><Link href="/perros">Contarlo ahora</Link></p></div>;
  return (
    <div className="orient">
      <h2>Cómo encaja con tu vida</h2>
      <p className="small">Encaja en {o.ok} de {o.tot} cosas que nos has contado. Son orientaciones a partir de lo que la protectora sabe; ellos valoran cada caso.</p>
      <ul>{o.items.map((i, k) => <li key={k} className={i.t === "w" ? "w" : i.t === "u" ? "u" : ""}><i>{i.t === "ok" ? "✓" : i.t === "w" ? "!" : "?"}</i><span>{i.x}</span></li>)}</ul>
      <p className="link"><Link href="/perros">Cambiar mis respuestas</Link></p>
    </div>
  );
}
