import type { Metadata } from "next";
import Link from "next/link";
import SwipeDeck from "@/components/SwipeDeck";
import DiscIntro from "@/components/DiscIntro";
export const metadata: Metadata = { alternates: { canonical: "/descubrir" }, title: "Descubrir uno a uno", description: "Pasa los perros de uno en uno y guarda en favoritos los que quieras conocer." };
export default function Descubrir() {
  return (
    <main className="wrap disc">
      <div>
        <span className="eyebrow">Descubrir</span>
        <DiscIntro />
        <p className="hand" style={{ marginTop: 18 }}><span className="only-touch">Desliza la tarjeta: derecha guarda, izquierda pasa.</span><span className="only-pointer">Arrastra la tarjeta o usa las flechas del teclado.</span></p>
        <div className="guide"><img src="/brand/perro-carlino.svg" alt="" /><span>El Carlino, el del match, te acompaña aquí.</span></div>
        <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn ghost" href="/match">Cambiar mis respuestas</Link><Link className="btn ghost" href="/perros">Prefiero filtrar</Link><Link className="btn ghost" href="/perros?fav=1">Mis favoritos</Link></div>
      </div>
      <SwipeDeck />
    </main>
  );
}
