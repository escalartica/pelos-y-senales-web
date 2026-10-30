"use client";
import { useEffect, useState, useCallback } from "react";
import { EMPTY_LIFE, type Life } from "./orient";

/** Estado por visitante (favoritos y «cómo vives») en localStorage, con sincronización entre componentes. */
function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write<T>(key: string, v: T) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* modo privado, etc. */ }
  window.dispatchEvent(new CustomEvent("pys:store", { detail: key }));
}
function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(fallback);
  useEffect(() => {
    setV(read(key, fallback));
    const h = (e: Event) => { if ((e as CustomEvent).detail === key) setV(read(key, fallback)); };
    window.addEventListener("pys:store", h);
    return () => window.removeEventListener("pys:store", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((n: T) => { setV(n); write(key, n); }, [key]);
  return [v, set];
}

export function useFavs() {
  const [favs, setFavs] = useStored<string[]>("pys-favs", []);
  const toggle = useCallback((id: string) => {
    const cur = read<string[]>("pys-favs", []);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setFavs(next);
    return next.includes(id);
  }, [setFavs]);
  return { favs, toggle, has: (id: string) => favs.includes(id) };
}

export function useLife() {
  const [life, setLife] = useStored<Life>("pys-life", EMPTY_LIFE);
  return { life, setLife, reset: () => setLife(EMPTY_LIFE) };
}

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent("pys:toast", { detail: msg }));
}

/* ---- Panel de protectoras (demo): cambios de estado guardados en este navegador ----
   En producción esto es la base de datos; aquí sirve para enseñar el flujo completo. */
export type Override = { estado?: import("./data").Estado; pausado?: boolean; upd?: string; nota?: string };
export type Overrides = Record<string, Override>;
export const OV_KEY = "pys-ov";
export function readOverrides(): Overrides { return read<Overrides>(OV_KEY, {}); }
export function useOverrides() {
  const [ov, setOv] = useStored<Overrides>(OV_KEY, {});
  const set = useCallback((id: string, patch: Override) => {
    const cur = read<Overrides>(OV_KEY, {});
    const hoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
    setOv({ ...cur, [id]: { ...cur[id], ...patch, upd: hoy } });
  }, [setOv]);
  const reset = useCallback(() => setOv({}), [setOv]);
  return { ov, set, reset };
}
