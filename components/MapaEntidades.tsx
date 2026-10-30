"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import EsMap, { type Pin } from "@/components/EsMap";
import { entidades, kmBetween, type Entidad } from "@/lib/spain";
import { useCatalog } from "./CatalogProvider";
import { cls, label, useAvisos } from "@/lib/perdidos";
import { toast } from "@/lib/store";

type Filtro = "todas" | "colab" | "otra";

export default function MapaEntidades() {
  const [f, setF] = useState<Filtro>("todas");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [showLost, setShowLost] = useState(false);
  const { avisos: lost } = useAvisos();
  const { prot } = useCatalog(); const ENT = useMemo(() => entidades(prot), [prot]);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let l: Entidad[] = ENT.filter((e) => (f === "colab" ? e.colab : f === "otra" ? !e.colab : true) && (!qq || `${e.ciudad} ${e.prov} ${e.n}`.toLowerCase().includes(qq)));
    if (here) l = l.map((e) => ({ ...e, km: kmBetween(here, e) })).sort((a, b) => a.km! - b.km!);
    return l;
  }, [f, q, here, ENT]);
  const e = ENT.find((x) => x.id === sel);
  const km = list.find((x) => x.id === sel)?.km;

  const pins: Pin[] = list.map((x) => ({ id: x.id, lat: x.lat, lon: x.lon, cls: x.colab ? "colab" : "otra", title: `${x.n} · ${x.ciudad}`, on: sel === x.id, r: x.colab ? 10 : 8 }));
  if (showLost) lost.filter((x) => !x.resuelto).forEach((x) => pins.push({ id: "L:" + x.id, lat: x.lat, lon: x.lon, cls: cls(x), title: `${x.tipo === "perdido" ? "Se busca: " + (x.nombre || "") : label(x)} · ${x.ciudad}`, r: 7 }));

  const near = () => {
    if (!navigator.geolocation) { toast("Tu navegador no da la ubicación."); return; }
    toast("Buscando tu posición…");
    navigator.geolocation.getCurrentPosition((p) => { setHere({ lat: p.coords.latitude, lon: p.coords.longitude }); toast("Entidades ordenadas por distancia."); }, () => toast("No se pudo obtener la ubicación. Prueba con la ciudad."), { timeout: 8000 });
  };

  return (
    <>
      <div className="wrap">
        <div className="mapfilters" role="group" aria-label="Filtrar el mapa">
          {([["todas", "Todas"], ["colab", "Colaboran con nosotros"], ["otra", "Otras entidades"]] as [Filtro, string][]).map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
          <input type="search" placeholder="Ciudad o provincia" aria-label="Buscar por ciudad o provincia" value={q} onChange={(ev) => setQ(ev.target.value)} />
          <button type="button" className="chip" onClick={near}>Cerca de mí</button>
          <button type="button" className="chip" aria-pressed={showLost} onClick={() => setShowLost((v) => !v)}>Ver perdidos y avistados</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-60)" }}>{list.length} entidades · {list.filter((x) => x.colab).length} colaboran{here ? " · ordenadas por distancia" : ""}</span>
        </div>
      </div>
      <div className="wrap">
        <div className="mapgrid">
          <div>
            <EsMap pins={pins} here={here} onPin={(id) => { if (id.startsWith("L:")) { location.href = "/perdidos"; return; } setSel(id); }} />
            <div className="maplegend"><span className="lc"><i />Colabora con Pelos y Señales</span><span className="lo"><i />Otra entidad (información y enlace)</span>{showLost && <><span className="lp"><i />Perdido</span><span className="la"><i />Avistado</span></>}</div>
            <p className="small" style={{ fontSize: 13, color: "var(--ink-60)", marginTop: 10 }}>Datos públicos tomados de la web de cada entidad o de su ayuntamiento (octubre de 2026). La posición en el mapa es la de su municipio. Cualquier entidad puede pedir que corrijamos sus datos o retirarse.</p>
          </div>
          <div className="mapside">
            <div className="entcard">
              {e ? (<>
                <span className={`tag ${e.colab ? "c" : "o"}`}>{e.colab ? "Colabora con Pelos y Señales" : "Otra entidad"}</span>
                <h2>{e.n}</h2>
                <p className="meta">{e.tipo} · {e.ciudad}{e.prov !== e.ciudad && ` · ${e.prov}`}{km != null && ` · a ${km < 1 ? "menos de 1" : Math.round(km)} km`}{e.horas && <><br />{e.horas}</>}</p>
                {e.desc && <p style={{ fontSize: 14, margin: 0 }}>{e.desc}</p>}{!e.colab && !e.tel && !e.mail && <p style={{ fontSize: 14, margin: 0 }}>Contacto en su web.</p>}
                <div className="links">
                  {e.tel && <a href={`tel:${e.tel.replace(/\s/g, "")}`}>{e.tel}</a>}{e.mail && <a href={`mailto:${e.mail}`}>Escribir</a>}
                  {e.colab ? <Link href={e.web}>Sus perros aquí</Link> : e.web && <a href={e.web} target="_blank" rel="noopener noreferrer">Su web</a>}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.n} ${e.ciudad}`)}`} target="_blank" rel="noopener noreferrer">Buscar en el mapa</a>
                </div>
              </>) : (<><span className="tag o">Elige un punto</span><h2>Toca una entidad en el mapa o en la lista.</h2><p className="meta">Verás su tipo, dónde está, cómo contactar y si colabora con nosotros.</p></>)}
            </div>
            <div className="entlist">
              {list.length ? list.map((x) => (
                <button key={x.id} type="button" className={`entrow${sel === x.id ? " on" : ""}`} onClick={() => setSel(x.id)}>
                  <span><b>{x.n}</b><small>{x.tipo} · {x.ciudad}{x.prov !== x.ciudad && ` (${x.prov})`}</small></span>
                  {x.km != null && <em>{x.km < 1 ? "<1" : Math.round(x.km)} km</em>}<i className={x.colab ? "c" : "o"} />
                </button>)) : <div className="empty">Ninguna entidad con ese filtro.</div>}
            </div>
            <Link className="btn" href="/colabora?tipo=mapa#contacto" style={{ justifyContent: "center" }}>Añadir o corregir una entidad</Link>
          </div>
        </div>
      </div>
    </>
  );
}
