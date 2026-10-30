"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCatalog, protOf } from "./CatalogProvider";
import { useFavs } from "@/lib/store";
import FavButton from "./FavButton";
/** Cajón lateral de favoritos (escritorio). Se abre con el evento pys:drawer. */
export default function FavDrawer() {
  const [open, setOpen] = useState(false); const { favs } = useFavs(); const { dogs, prot } = useCatalog();
  useEffect(() => { const h = () => setOpen(true); window.addEventListener("pys:drawer", h); return () => window.removeEventListener("pys:drawer", h); }, []);
  useEffect(() => { document.body.classList.toggle("drawer-on", open); return () => document.body.classList.remove("drawer-on"); }, [open]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const list = dogs.filter((d) => favs.includes(d.id));
  return (
    <>
      <div className="drawer-bg" onClick={() => setOpen(false)} />
      <aside className="drawer" aria-label="Tus favoritos" inert={!open}>
        <h2>Tus favoritos <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)}>✕</button></h2>
        <p className="small">Guardar no reserva ni compromete. Léelos con calma y escribe a su protectora cuando quieras.</p>
        <div className="list">
          {list.length ? list.map((d) => { const p = protOf(prot, d.prot); return (
            <Link key={d.id} className="dmini" href={`/perros/${d.id}`} onClick={() => setOpen(false)}>
              <div className={`art ${d.photo ? "" : d.c}`}>{d.photo ? <img src={d.photo} alt="" /> : <img className="ill" src={`/brand/perro-${d.art}.svg`} alt="" />}</div>
              <div><b>{d.n}</b><small>{[d.edadTxt.replace(/ \(.*\)/, ""), p.ciudad || p.n].filter(Boolean).join(" · ")}</small></div>
              <FavButton id={d.id} />
            </Link>
          ); }) : <div className="dempty"><img src="/brand/perro-scottie.svg" alt="" />Todavía no has guardado ningún perro.<br />Haz match o pasa la baraja y vuelve.</div>}
        </div>
        <div style={{ marginTop: 14 }}><Link className="btn" href="/perros?fav=1" style={{ width: "100%", justifyContent: "center" }} onClick={() => setOpen(false)}>Ver todos en el listado</Link></div>
      </aside>
    </>
  );
}
