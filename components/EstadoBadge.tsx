"use client";
import { EST, type Dog } from "@/lib/data";
import { useOverrides } from "@/lib/store";
/** Estado del perro teniendo en cuenta los cambios hechos desde el panel de protectoras (demo). */
export default function EstadoBadge({ d, kind = "badge" }: { d: Dog; kind?: "badge" | "status" }) {
  const { ov } = useOverrides();
  const o = ov[d.id]; const estado = o?.estado ?? d.estado;
  return <span className={`${kind} ${estado}`}>{EST[estado]}{o?.pausado ? " · pausada" : ""}</span>;
}
export function useUpd(d: Dog) { const { ov } = useOverrides(); return ov[d.id]?.upd ?? d.upd; }
