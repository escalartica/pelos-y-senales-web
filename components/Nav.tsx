"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavs } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/match", label: "Haz match" },
  { href: "/perros", label: "Perros" },
  { href: "/protectoras", label: "Protectoras" },
  { href: "/mapa", label: "Mapa" },
  { href: "/perdidos", label: "Perdidos" },
  { href: "/madrinas", label: "Madrinas" },
  { href: "/colabora", label: "Colabora" },
];
const MENU = [["/match", "Haz match"], ["/perros", "Todos los perros"], ["/descubrir", "Descubrir uno a uno"], ["/protectoras", "Protectoras"], ["/mapa", "Mapa de entidades"], ["/perdidos", "Perdidos y avistados"], ["/madrinas", "Madrinas y padrinos"], ["/#pandilla", "La pandilla"], ["/colabora", "Colabora"], ["/#faq", "Preguntas"]];

export default function Nav() {
  const path = usePathname();
  const { favs } = useFavs();
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.classList.toggle("menu", open); return () => document.body.classList.remove("menu"); }, [open]);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const on = (href: string) => (href === "/" ? path === "/" : !href.includes("#") && path.startsWith(href));
  return (
    <>
      <nav className="nav" aria-label="Principal">
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Pelos y Señales, inicio"><img src="/brand/logo-horizontal.svg" alt="" width={2803} height={1180} /><span className="tm" aria-hidden="true">™</span></Link>
          <ul>{LINKS.map((l) => <li key={l.href}><Link href={l.href} className={on(l.href) ? "on" : ""}>{l.label}</Link></li>)}</ul>
          <div className="right">
            <Link className="favc" href="/perros?fav=1" aria-label="Favoritos" onClick={(e) => { if (window.innerWidth > 980) { e.preventDefault(); window.dispatchEvent(new CustomEvent("pys:drawer")); } }}>♥ <b>{favs.length}</b></Link>
            <Link className="btn" href="/match">Haz match <span className="ic">→</span></Link>
            <button className="burger" type="button" aria-label="Menú" aria-expanded={open} onClick={() => setOpen((o) => !o)}><i /><i /></button>
          </div>
        </div>
      </nav>
      <div className="menu-ov" id="menu-ov" onClick={(e) => { if ((e.target as Element).closest("a")) setOpen(false); }}>
        {MENU.map(([h, l], i) => <Link key={h} href={h}><small>{String(i + 1).padStart(2, "0")}</small>{l}</Link>)}
      </div>
      <nav className="mobile-tabs" aria-label="Navegación móvil">
        <Link href="/" className={path === "/" ? "on" : ""}><span>⌂</span>Inicio</Link>
        <Link href="/perros" className={path.startsWith("/perros") ? "on" : ""}><span>🐾</span>Perros</Link>
        <Link href="/match" className={path === "/match" || path === "/descubrir" ? "on" : ""}><span>⇄</span>Match</Link>
        <Link href="/perdidos" className={path.startsWith("/perdidos") ? "on" : ""}><span>◎</span>Perdidos</Link>
        <Link href="/mapa" className={path === "/mapa" ? "on" : ""}><span>✦</span>Mapa</Link>
      </nav>
    </>
  );
}
