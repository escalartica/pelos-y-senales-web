import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };
export default function NotFound() {
  return (
    <main className="wrap notfound">
      <img src="/brand/perro-teckel.svg" alt="" />
      <h1 style={{ marginTop: 24 }}>Por aquí no hay nadie.</h1>
      <p className="lead" style={{ margin: "14px auto 26px" }}>El Teckel ha olfateado toda la página y no ha encontrado nada. Puede que el perro ya haya sido adoptado o que el enlace esté mal.</p>
      <Link className="btn" href="/perros">Ver los perros que esperan</Link>
    </main>
  );
}
