"use client";
import { useEffect, useRef } from "react";
export default function Counter({ to, suffix = "", locale = true }: { to: number; suffix?: string; locale?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const run = () => { let t0 = 0; const dur = 1400; const f = (ts: number) => { if (!t0) t0 = ts; let k = Math.min(1, (ts - t0) / dur); k = 1 - Math.pow(1 - k, 3); const v = Math.round(to * k); el.textContent = (locale ? v.toLocaleString("es-ES") : String(v)) + suffix; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
    if (!("IntersectionObserver" in window)) { run(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { run(); io.disconnect(); } }, { threshold: .6 });
    io.observe(el); return () => io.disconnect();
  }, [to, suffix, locale]);
  return <b ref={ref} data-count={to}>0{suffix}</b>;
}
