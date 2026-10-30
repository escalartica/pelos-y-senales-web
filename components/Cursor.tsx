"use client";
import { useEffect, useRef } from "react";
/** Cursor propio en escritorio: un punto que se convierte en «VER» sobre las fichas. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cur = ref.current; if (!cur || !window.matchMedia("(pointer:fine)").matches) return;
    let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0;
    const mv = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; cur.classList.remove("hide"); const t = (e.target as Element).closest(".dogcard,.dcard,.frame,.print"); cur.classList.toggle("big", !!t); cur.textContent = t && t.classList.contains("dogcard") ? "VER" : ""; };
    const out = () => cur.classList.add("hide");
    const loop = () => { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; raf = requestAnimationFrame(loop); };
    document.addEventListener("mousemove", mv); document.addEventListener("mouseleave", out); raf = requestAnimationFrame(loop);
    return () => { document.removeEventListener("mousemove", mv); document.removeEventListener("mouseleave", out); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cur hide" aria-hidden="true" />;
}
