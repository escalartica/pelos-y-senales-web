"use client";
import Link from "next/link";
import type { Dog } from "@/lib/data";
import { useCatalog, protOf } from "./CatalogProvider";
import { useOverrides } from "@/lib/store";
/** Aviso honesto bajo los botones de la ficha cuando el perro no está disponible. */
export default function EstadoAviso({ d }: { d: Dog }) {
  const { ov } = useOverrides(); const estado = ov[d.id]?.estado ?? d.estado; const { prot } = useCatalog(); const p = protOf(prot, d.prot);
  if (estado === "disponible") return null;
  const txt = {
    proceso: <>Hay una familia en valoración. Puedes escribir igualmente: si no cuaja, la protectora avisa a quien haya preguntado después.</>,
    reservado: <>Compromiso firmado, pendiente de entrega. La protectora te dirá si merece la pena esperar; mientras, mira <Link href={`/protectoras/${d.prot}`}>otros perros de {p.n}</Link>.</>,
    adoptado: <>{d.sexo === "hembra" ? "¡Ya está en casa!" : "¡Ya está en casa!"} Dejamos la ficha unos días para celebrarlo. Mira <Link href={`/protectoras/${d.prot}`}>quién sigue esperando en {p.n}</Link>.</>,
  }[estado];
  return <p className={`estaviso ${estado}`} role="status">{txt}</p>;
}
