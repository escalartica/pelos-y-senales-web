"use client";
import { useMemo, useRef } from "react";
import { MAPW, MAPH, proj, unproj, spainPath } from "@/lib/spain";

export interface Pin { id: string; lat: number; lon: number; cls: string; title: string; on?: boolean; r?: number }

/** Mapa de España en SVG con puntos. `pick` convierte el clic en coordenadas. */
export default function EsMap({ pins, onPin, pick, onPick, here, className = "" }: {
  pins: Pin[]; onPin?: (id: string) => void; pick?: boolean; onPick?: (lat: number, lon: number) => void;
  here?: { lat: number; lon: number } | null; className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const path = useMemo(spainPath, []);
  const mall = proj(2.95, 39.6), men = proj(4.1, 40.0), ibi = proj(1.45, 38.95), ca = proj(-15.5, 28.1);
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!pick || !ref.current) return;
    const svg = ref.current; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM(); if (!m) return; const c = pt.matrixTransform(m.inverse()); const ll = unproj(c.x, c.y);
    onPick?.(ll.lat, ll.lon);
  };
  const h = here ? proj(here.lon, here.lat) : null;
  return (
    <div className={`esmap${pick ? " pick" : ""} ${className}`}>
      <svg ref={ref} viewBox={`0 0 ${MAPW} ${MAPH}`} role={onPin || pick ? "group" : "img"} aria-label={pick ? "Mapa de España: toca para fijar el punto" : "Mapa de España"} onClick={click}>
        <path className="land" d={path} />
        <ellipse className="isl" cx={mall.x} cy={mall.y} rx={34} ry={22} /><ellipse className="isl" cx={men.x} cy={men.y} rx={16} ry={9} /><ellipse className="isl" cx={ibi.x} cy={ibi.y} rx={14} ry={10} />
        <rect className="inset" x={14} y={612} width={222} height={134} rx={14} />
        <ellipse className="isl" cx={ca.x - 70} cy={ca.y + 6} rx={22} ry={14} /><ellipse className="isl" cx={ca.x - 30} cy={ca.y - 2} rx={14} ry={11} /><ellipse className="isl" cx={ca.x + 14} cy={ca.y + 2} rx={20} ry={18} /><ellipse className="isl" cx={ca.x + 58} cy={ca.y - 10} rx={14} ry={20} /><ellipse className="isl" cx={ca.x + 96} cy={ca.y - 30} rx={12} ry={24} />
        <text className="lbl" x={24} y={632}>Canarias</text><text className="lbl" x={760} y={420}>Baleares</text>
        <g className="pins">
          {pins.map((p) => { const q = proj(p.lon, p.lat); const r = p.r || 9; return (
            <g key={p.id} className={`pin ${p.cls}${p.on ? " on" : ""}`} transform={`translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`} onClick={(e) => { e.stopPropagation(); onPin?.(p.id); }} role={onPin ? "button" : undefined} tabIndex={onPin ? 0 : undefined} onKeyDown={(e) => { if (onPin && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPin(p.id); } }}>
              <title>{p.title}</title>
              {p.cls === "perdido" && <circle className="p" r={9} />}
              <circle className="r" r={r + 8} /><circle className="d" r={r} />
            </g>); })}
        </g>
        {h && <g className="here"><circle className="here" cx={h.x} cy={h.y} r={13} /><circle className="here" cx={h.x} cy={h.y} r={3} /></g>}
      </svg>
    </div>
  );
}
