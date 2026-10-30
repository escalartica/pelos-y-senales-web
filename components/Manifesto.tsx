"use client";
import { useEffect, useRef } from "react";
const TEXT = "Cada perro tiene un carácter, una historia y una manera de mirar. Nuestro trabajo es que |se vea.| Y que quien lo vea pueda hablar con quien lo cuida.";
export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ws = Array.from(el.querySelectorAll<HTMLElement>(".w"));
    if (!("IntersectionObserver" in window)) { ws.forEach((w) => w.classList.add("on")); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { ws.forEach((w, i) => setTimeout(() => w.classList.add("on"), i * 70)); io.disconnect(); } }, { threshold: .35 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const parts = TEXT.split("|");
  return (
    <section className="manifesto" id="manifiesto">
      <div className="wrap">
        <p ref={ref}>{parts.map((seg, si) => seg.split(" ").filter(Boolean).map((w, i) => <span key={`${si}-${i}`}><span className={`w${si % 2 ? " k" : ""}`}>{w}</span>{" "}</span>))}</p>
        <div className="sig"><img src="/brand/perro-galgo.svg" alt="" /><span>El Galgo, el fotógrafo. Lleva la cámara desde el primer día.</span></div>
      </div>
    </section>
  );
}
