"use client";
import { createContext, useContext } from "react";
import type { Dog, Protectora } from "@/lib/data";
import type { Madrina } from "@/lib/madrinas";

export interface CatalogData { dogs: Dog[]; prot: Record<string, Protectora>; madrinas: Madrina[] }
const Ctx = createContext<CatalogData>({ dogs: [], prot: {}, madrinas: [] });

/** Reparte el catálogo (perros, protectoras, madrinas) a los componentes de cliente. Lo carga el layout. */
export default function CatalogProvider({ value, children }: { value: CatalogData; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCatalog = () => useContext(Ctx);
export { protOf } from "@/lib/data";
