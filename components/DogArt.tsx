import Image from "next/image";
import type { Dog } from "@/lib/data";
import { foco } from "@/lib/foco";
/** Foto real cuando existe; si no, ilustración de marca sobre color plano.
 *  `ratio` = proporción (ancho/alto) de la caja donde se pinta, para encuadrar la cara sin cortarla. */
export default function DogArt({ d, className = "", sizes = "(max-width: 900px) 100vw, 33vw", priority = false, ratio = 4 / 5 }: { d: Dog; className?: string; sizes?: string; priority?: boolean; ratio?: number }) {
  if (d.photo) return <div className={`art ph ${className}`}><Image src={d.photo} alt={`${d.n}, fotografía autorizada por su protectora`} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: foco(d.photo, ratio) }} /></div>;
  return <div className={`art ${d.c}${d.flip ? " flip" : ""} ${className}`}><img className="ill" src={`/brand/perro-${d.art}.svg`} alt={`Ilustración de ${d.n}`} /></div>;
}
