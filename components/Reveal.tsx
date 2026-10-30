"use client";
import { useEffect, useRef } from "react";
/** Entrada suave al hacer scroll; el contenido es visible en reposo (solo se anima la posición). */
export default function Reveal({ children, className = "", as: Tag = "div", style }: { children: React.ReactNode; className?: string; as?: "div" | "section"; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || !("IntersectionObserver" in window)) { el?.classList.add("in"); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }), { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  const T = Tag as "div";
  return <T ref={ref} className={`rv ${className}`} style={style}>{children}</T>;
}
