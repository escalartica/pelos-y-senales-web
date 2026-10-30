import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { kv, kvConfigured } from "./kv";
import { DOGS, PROT, type Dog, type Protectora } from "./data";
import { MADRINAS, type Madrina } from "./madrinas";

/**
 * Catálogo editable desde el panel de administración: perros, protectoras y madrinas.
 * Vive en Upstash (clave cat:v1). Mientras nadie lo haya guardado desde el panel, la web usa los datos
 * de lib/data.ts y lib/madrinas.ts como punto de partida.
 */
export interface Catalog { dogs: Dog[]; prot: Record<string, Protectora>; madrinas: Madrina[]; upd?: string; by?: string }

const KEY = "cat:v1";
const HIST = "cat:hist"; // copias anteriores, por si hay que deshacer
export const SEED: Catalog = { dogs: DOGS, prot: PROT, madrinas: MADRINAS };

async function leer(): Promise<Catalog> {
  try {
    const v = await kv<string | null>("GET", KEY);
    if (v) { const c = JSON.parse(v) as Catalog; if (Array.isArray(c.dogs) && c.prot && Array.isArray(c.madrinas)) return c; }
  } catch (e) { console.error("[catalog] lectura", e); }
  return SEED;
}

/** Lectura con caché (5 min). Al guardar desde el panel se invalida al momento. */
export const getCatalog = kvConfigured() ? unstable_cache(leer, ["catalog-v1"], { tags: ["catalog"], revalidate: 300 }) : leer;
/** Lectura sin caché, para el panel. */
export const getCatalogFresh = leer;

export async function saveCatalog(c: Catalog, by = "admin") {
  const prev = await kv<string | null>("GET", KEY);
  const next: Catalog = { ...c, upd: new Date().toISOString(), by };
  await kv("SET", KEY, JSON.stringify(next));
  if (prev) { await kv("ZADD", HIST, Date.now(), prev); await kv("ZREMRANGEBYRANK", HIST, 0, -31); }
  revalidateTag("catalog", { expire: 0 });
  revalidatePath("/", "layout");
  return next;
}

/* Ayudas que usan las páginas */
export const getDogIn = (c: Catalog, id: string) => c.dogs.find((d) => d.id === id);
export const dogsOfIn = (c: Catalog, protId: string) => c.dogs.filter((d) => d.prot === protId);
export const madrinaOfIn = (c: Catalog, perroId: string) => c.madrinas.find((m) => m.perro === perroId);
