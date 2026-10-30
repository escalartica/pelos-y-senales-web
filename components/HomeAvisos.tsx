"use client";
import Link from "next/link";
import { useAvisos } from "@/lib/perdidos";
/** Franja de avisos en portada (cuántos buscados, avistados y ya en casa), con datos reales del servidor. */
export default function HomeAvisos() {
  const { avisos, estado } = useAvisos();
  if (estado !== "ok") return null;
  const s = avisos.reduce((acc, x) => { if (x.resuelto) acc.h++; else if (x.tipo === "perdido") acc.p++; else acc.a++; return acc; }, { p: 0, a: 0, h: 0 });
  return <div className="avisos" aria-live="polite"><span className="p">{s.p} perro{s.p === 1 ? "" : "s"} que alguien busca</span><span className="a">{s.a} avistado{s.a === 1 ? "" : "s"} sin resolver</span><span className="h">{s.h} ya en casa</span><Link href="/perdidos" style={{ fontWeight: 800 }}>Ver los avisos →</Link></div>;
}
