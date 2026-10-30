"use client";
import { toast } from "@/lib/store";
export default function ShareButton() {
  const click = async () => {
    const url = location.href;
    try { if (navigator.share) { await navigator.share({ url, title: document.title }); return; } } catch { /* cancelado */ }
    try { await navigator.clipboard.writeText(url); toast("Enlace copiado."); } catch { toast("Copia este enlace: " + url); }
  };
  return <button type="button" className="share" aria-label="Compartir la ficha" onClick={click}>⇗</button>;
}
