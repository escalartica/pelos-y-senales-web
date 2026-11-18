"use client";
import { useEffect, useRef } from "react";
export default function Counter({ to, suffix = "", locale = true }: { to: number; suffix?: string; locale?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const final = (locale ? to.toLocaleString("es-ES") : String(to)) + suffix;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const run = () => {
      el.textContent = "0" + suffix;
      let t0 = 0; const dur = 1400;
      const f = (ts: number) => { if (!t0) t0 = ts; let k = Math.min(1, (ts - t0) / dur); k = 1 - Math.pow(1 - k, 3); const v = Math.round(to * k); el.textContent = (locale ? v.toLocaleString("es-ES") : String(v)) + suffix; if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    };
    // En reposo ya mostramos el valor real (bueno para quien no hace scroll, no tiene JS, o es un rastreador).
    // Si hay IntersectionObserver, al entrar en pantalla reiniciamos a 0 y contamos hasta el valor real, como animación.
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { run(); io.disconnect(); } }, { threshold: .6 });
    io.observe(el); return () => io.disconnect();
  }, [to, suffix, locale]);
  return <b ref={ref} data-count={to}>{final}</b>;
}
