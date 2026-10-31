"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Dog } from "@/lib/data";
import { useCatalog, protOf } from "./CatalogProvider";
import { useFavs, useLife } from "@/lib/store";
import { orient, lifeIsSet, type Life } from "@/lib/orient";
import DogArt from "./DogArt";

function ordered(BASE: Dog[], life: Life) { if (!lifeIsSet(life)) return BASE; return [...BASE].sort((a, b) => { const oa = orient(a, life)!, ob = orient(b, life)!; return ob.ok / ob.tot - oa.ok / oa.tot; }); }

function Card({ d, i, onDecide, top, life }: { d: Dog; i: number; onDecide: (yes: boolean) => void; top: boolean; life: Life }) {
  const o = orient(d, life);
  const ref = useRef<HTMLElement>(null); const st = useRef({ sx: 0, sy: 0, dx: 0, on: false }); const [gone, setGone] = useState<"l" | "r" | null>(null);
  const { prot } = useCatalog(); const p = protOf(prot, d.prot);
  const down = (e: React.PointerEvent) => { if (!top || gone) return; st.current = { sx: e.clientX, sy: e.clientY, dx: 0, on: true }; ref.current?.classList.add("drag"); (e.target as Element).setPointerCapture?.(e.pointerId); };
  const move = (e: React.PointerEvent) => { const s = st.current; if (!s.on || !ref.current) return; s.dx = e.clientX - s.sx; const dy = e.clientY - s.sy; ref.current.style.transform = `translate(${s.dx}px,${dy * .3}px) rotate(${s.dx / 14}deg)`; const si = ref.current.querySelector<HTMLElement>(".stamp.si"), no = ref.current.querySelector<HTMLElement>(".stamp.no"); if (si) si.style.opacity = String(Math.min(1, Math.max(0, s.dx / 80))); if (no) no.style.opacity = String(Math.min(1, Math.max(0, -s.dx / 80))); };
  const up = () => { const s = st.current; if (!s.on || !ref.current) return; s.on = false; ref.current.classList.remove("drag"); if (Math.abs(s.dx) > 110) { setGone(s.dx > 0 ? "r" : "l"); setTimeout(() => onDecide(s.dx > 0), 380); } else { ref.current.style.transform = ""; ref.current.querySelectorAll<HTMLElement>(".stamp").forEach((x) => (x.style.opacity = "0")); } };
  useEffect(() => { if (!top) return; const h = (ev: CustomEvent) => { setGone(ev.detail ? "r" : "l"); setTimeout(() => onDecide(ev.detail), 380); }; window.addEventListener("pys:decide", h as EventListener); return () => window.removeEventListener("pys:decide", h as EventListener); }, [top, onDecide]);
  return (
    <article ref={ref} className={`dcard${gone ? ` gone-${gone}` : ""}`} style={{ transform: `translateY(${-i * 14}px) scale(${1 - i * .05})`, zIndex: 10 - i }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="dart"><DogArt d={d} sizes="380px" ratio={5 / 6} />{o && <span className="afftag">Encaja en {o.ok} de {o.tot}</span>}<span className="stamp si">♥ Guardar</span><span className="stamp no">Pasar</span></div>
      <div className="b"><div className="name"><b>{d.n}</b><small>{d.edadTxt.replace(/ \(.*\)/, "")} · {d.tam}</small></div><div className="loc">{[p.ciudad, p.n].filter(Boolean).join(" · ")}</div><div className="tags">{d.rasgos.map((t) => <span key={t}>{t}</span>)}</div>{o && <div className="why">{o.items.slice(0, 2).map((x, k) => <span key={k} className={x.t === "w" ? "w" : ""}>{x.x}</span>)}</div>}</div>
    </article>
  );
}

export default function SwipeDeck() {
  const [idx, setIdx] = useState(0); const [decided, setDecided] = useState<boolean[]>([]);
  const { toggle, has } = useFavs(); const { life } = useLife(); const router = useRouter();
  const { dogs } = useCatalog();
  const ORDER = ordered(dogs.filter((d) => d.estado === "disponible"), life);
  const cur = ORDER[idx];
  const decide = (yes: boolean) => { if (!cur) return; if (yes && !has(cur.id)) toggle(cur.id); setDecided((d) => { const n = [...d]; n[idx] = yes; return n; }); setIdx((i) => i + 1); };
  const fire = (yes: boolean) => window.dispatchEvent(new CustomEvent("pys:decide", { detail: yes }));
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") fire(false); else if (e.key === "ArrowRight") fire(true); else if (e.key === "ArrowUp" && cur) router.push(`/perros/${cur.id}`); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [cur, router]);
  const rest = ORDER.slice(idx, idx + 3); const saved = decided.filter(Boolean).length;
  return (
    <div>
      <div className="dprog">{ORDER.map((d, i) => <i key={d.id} className={i < idx ? (decided[i] ? "f" : "d") : ""} />)}</div>
      <div className="deck">
        {!ORDER.length ? <div className="dend"><div><b>Muy pronto.</b>Estamos preparando las fichas con las protectoras.</div></div> : rest.length ? [...rest].reverse().map((d) => <Card key={d.id} d={d} i={rest.indexOf(d)} top={d.id === rest[0].id} onDecide={decide} life={life} />) :
          <div className="dend"><div><b>Has visto a todos.</b>{saved ? `Has guardado ${saved}. Léelos con calma en tus favoritos.` : "No has guardado ninguno. Prueba a filtrar por zona o tamaño."}<div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}><Link className="btn sm" href="/perros?fav=1">Ver favoritos</Link><button className="btn ghost sm" type="button" onClick={() => { setIdx(0); setDecided([]); }}>Empezar de nuevo</button></div></div></div>}
      </div>
      <div className="dacts"><button type="button" aria-label="Dejar pasar" onClick={() => fire(false)}>✕</button><button type="button" className="info" aria-label="Ver la ficha" onClick={() => cur && router.push(`/perros/${cur.id}`)}>Ficha</button><button type="button" className="yes" aria-label="Guardar en favoritos" onClick={() => fire(true)}>♥</button></div>
      <p className="dkeys">← dejar pasar · → guardar · ↑ ficha</p>
    </div>
  );
}
