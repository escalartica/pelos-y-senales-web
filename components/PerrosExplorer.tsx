"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Tam, EdadGrupo, Act } from "@/lib/data";
import { useCatalog, protOf } from "./CatalogProvider";
import { orient, lifeIsSet } from "@/lib/orient";
import { useFavs, useLife, useOverrides, toast } from "@/lib/store";
import DogCard from "./DogCard";
import LifestylePanel from "./LifestylePanel";

type Conv = "ninos" | "perros" | "gatos";
interface F { zona: string; tam: Tam[]; edad: EdadGrupo[]; act: Act[]; conv: Conv[]; esp: boolean; fav: boolean }
const EMPTY: F = { zona: "", tam: [], edad: [], act: [], conv: [], esp: false, fav: false };

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="chip" aria-pressed={on} onClick={onClick}>{children}</button>;
}
function tog<T>(arr: T[], v: T) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

export default function PerrosExplorer() {
  const sp = useSearchParams();
  const { favs } = useFavs(); const { life } = useLife(); const { ov } = useOverrides();
  const { dogs: DOGS, prot } = useCatalog();
  const PROVS = useMemo(() => Array.from(new Set(DOGS.map((d) => prot[d.prot]?.prov).filter(Boolean) as string[])).sort(), [DOGS, prot]);
  const [f, setF] = useState<F>(EMPTY);
  useEffect(() => { setF((cur) => ({ ...cur, fav: sp.get("fav") === "1", zona: sp.get("zona") || cur.zona })); const a = sp.get("alerta"); if (a === "ok") toast("Alerta activada. Te avisaremos cuando entre un perro que encaje contigo."); if (a === "caducada") toast("Ese enlace ha caducado. Vuelve a pedir la alerta y confírmala en siete días."); }, [sp]);

  const list = useMemo(() => {
    let l = DOGS.filter((d) => {
      const p = protOf(prot, d.prot);
      if (ov[d.id]?.pausado) return false;
      if (f.zona && p.prov !== f.zona) return false;
      if (f.tam.length && !f.tam.includes(d.tam)) return false;
      if (f.edad.length && !f.edad.includes(d.edad)) return false;
      if (f.act.length && !f.act.includes(d.act)) return false;
      if (f.conv.some((k) => d.conv[k] !== "si")) return false;
      if (f.esp && !d.esp) return false;
      if (f.fav && !favs.includes(d.id)) return false;
      return true;
    });
    if (lifeIsSet(life)) l = [...l].sort((a, b) => { const oa = orient(a, life)!, ob = orient(b, life)!; return ob.ok / ob.tot - oa.ok / oa.tot; });
    return l;
  }, [f, favs, life, ov, DOGS, prot]);

  return (
    <>
      <div className="filters" aria-label="Filtros">
        <div className="wrap">
          <div className="f"><label htmlFor="f-zona">Zona</label><select id="f-zona" value={f.zona} onChange={(e) => setF({ ...f, zona: e.target.value })}><option value="">Toda España</option>{PROVS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="f"><label>Tamaño</label><div className="chips">{(["pequeño", "mediano", "grande"] as Tam[]).map((v) => <Chip key={v} on={f.tam.includes(v)} onClick={() => setF({ ...f, tam: tog(f.tam, v) })}>{v[0].toUpperCase() + v.slice(1)}</Chip>)}</div></div>
          <div className="f"><label>Edad</label><div className="chips"><Chip on={f.edad.includes("cachorro")} onClick={() => setF({ ...f, edad: tog(f.edad, "cachorro") })}>Cachorro</Chip><Chip on={f.edad.includes("adulto")} onClick={() => setF({ ...f, edad: tog(f.edad, "adulto") })}>Adulto</Chip><Chip on={f.edad.includes("senior")} onClick={() => setF({ ...f, edad: tog(f.edad, "senior") })}>Sénior</Chip></div></div>
          <div className="f"><label>Actividad</label><div className="chips"><Chip on={f.act.includes("baja")} onClick={() => setF({ ...f, act: tog(f.act, "baja") })}>Tranquilo</Chip><Chip on={f.act.includes("media")} onClick={() => setF({ ...f, act: tog(f.act, "media") })}>Normal</Chip><Chip on={f.act.includes("alta")} onClick={() => setF({ ...f, act: tog(f.act, "alta") })}>Muy activo</Chip></div></div>
          <div className="f"><label>Convive con</label><div className="chips"><Chip on={f.conv.includes("ninos")} onClick={() => setF({ ...f, conv: tog(f.conv, "ninos") })}>Niños</Chip><Chip on={f.conv.includes("perros")} onClick={() => setF({ ...f, conv: tog(f.conv, "perros") })}>Perros</Chip><Chip on={f.conv.includes("gatos")} onClick={() => setF({ ...f, conv: tog(f.conv, "gatos") })}>Gatos</Chip></div></div>
          <div className="f"><div className="chips"><Chip on={f.esp} onClick={() => setF({ ...f, esp: !f.esp })}>Necesidades especiales</Chip><Chip on={f.fav} onClick={() => setF({ ...f, fav: !f.fav })}>Solo favoritos</Chip></div></div>
          <span className="count">{list.length} de {DOGS.length} perros</span><button className="reset" type="button" onClick={() => setF(EMPTY)}>Quitar filtros</button>
        </div>
      </div>
      <div className="wrap listbody">
        <LifestylePanel />
        <div className="cards" aria-live="polite">
          {list.length ? list.map((d) => <DogCard key={d.id} d={d} life={life} />) : <div className="empty"><img src="/brand/perro-scottie.svg" alt="" style={{ height: 120, width: "auto", display: "block", margin: "0 auto 14px" }} />{DOGS.length ? "Ningún perro cumple todos los filtros. Quita alguno o mira en toda España." : "Estamos preparando con APAAL las fichas de sus perros. Muy pronto, aquí."}</div>}
        </div>
      </div>
    </>
  );
}
