"use client";
import { useFavs, toast } from "@/lib/store";
export default function FavButton({ id, big = false, label = false }: { id: string; big?: boolean; label?: boolean }) {
  const { has, toggle } = useFavs();
  const on = has(id);
  const click = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); const now = toggle(id); toast(now ? "Guardado en favoritos." : "Quitado de favoritos."); };
  if (label) return <button type="button" className="btn ghost" aria-pressed={on} onClick={click}>♥ {on ? "En favoritos" : "Guardar como favorito"}</button>;
  return <button type="button" className="fav" style={big ? { position: "static", width: 50, height: 50, flex: "none" } : undefined} aria-pressed={on} aria-label="Guardar como favorito" onClick={click}>♥</button>;
}
