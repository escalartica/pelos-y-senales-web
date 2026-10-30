"use client";
import type { Dog } from "@/lib/data";
import { useCatalog, protOf } from "./CatalogProvider";
import { printPoster } from "@/components/Perdidos";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
/** Cartel A4 «BUSCO FAMILIA» para imprimir y colgar en clínicas, tiendas y tablones. */
export default function PosterButton({ d }: { d: Dog }) {
  const { prot } = useCatalog(); const p = protOf(prot, d.prot);
  const html = `<div class="pp"><div><div class="big">BUSCO FAMILIA</div><div class="n">${esc(d.n)}</div></div><div><div class="im">${d.photo ? `<img src="${d.photo}" alt="">` : ""}</div><p>${esc(d.edadTxt)} · ${esc(d.tam)} · ${esc(d.raza)}</p><p>${esc(d.desc)}</p></div><div><p><b>${esc(p.n)}</b>${p.ciudad ? " · " + esc(p.ciudad) : ""}</p>${p.tel ? `<div class="tel">${esc(p.tel)}</div>` : ""}<div class="foot">pelosysenales.es/perros/${esc(d.id)}</div></div></div>`;
  return <button type="button" className="btn ghost" title="Cartel A4 para imprimir y colgar" onClick={() => printPoster(html)}>Cartel para imprimir</button>;
}
