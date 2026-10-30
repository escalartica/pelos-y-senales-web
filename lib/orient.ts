import type { Dog } from "./data";

/** Lo que la familia cuenta de su vida. Todo opcional. */
export interface Life {
  casa: "piso" | "patio" | null;
  tiempo: "poco" | "normal" | "mucho" | null;
  conv: ("ninos" | "perros" | "gatos")[];
  exp: "primero" | "veterano" | null;
}
export const EMPTY_LIFE: Life = { casa: null, tiempo: null, conv: [], exp: null };
export const lifeIsSet = (l: Life) => !!(l.casa || l.tiempo || l.conv.length || l.exp);

export type OrientItem = { t: "ok" | "w" | "u"; x: string };
export interface Orientation { items: OrientItem[]; ok: number; tot: number }

const ACT = { baja: "tranquilo", media: "normal", alta: "muy activo" } as const;
const NM = { ninos: "niños", perros: "otros perros", gatos: "gatos" } as const;

/**
 * Orientación explicable, en línea con el plan: afinidades y avisos con palabras,
 * nunca una puntuación opaca. La protectora valora cada caso.
 */
export function orient(d: Dog, life: Life): Orientation | null {
  if (!lifeIsSet(life)) return null;
  const out: OrientItem[] = [];
  if (life.casa) {
    if (d.tam === "grande" && life.casa === "piso") out.push({ t: "w", x: "Es grande y vives en piso: posible, pero pregunta a la protectora cómo lo lleva." });
    else if (d.act === "alta" && life.casa === "piso") out.push({ t: "w", x: "Muy activo para un piso: solo si hay paseos largos a diario." });
    else out.push({ t: "ok", x: `Tu casa (${life.casa === "piso" ? "piso" : "casa con patio"}) encaja con su tamaño y su energía.` });
  }
  if (life.tiempo) {
    if (d.act === "alta" && life.tiempo === "poco") out.push({ t: "w", x: "Necesita mucho paseo y has dicho que tienes poco tiempo." });
    else if (d.act === "baja" && life.tiempo === "mucho") out.push({ t: "ok", x: "Tienes más tiempo del que necesita: sobrará para todo." });
    else out.push({ t: "ok", x: `Tu tiempo de paseo cuadra con su actividad (${ACT[d.act]}).` });
  }
  for (const k of life.conv) {
    const v = d.conv[k];
    if (v === "si") out.push({ t: "ok", x: `Convive bien con ${NM[k]}.` });
    else if (v === "no") out.push({ t: "w", x: `No convive con ${NM[k]}.` });
    else out.push({ t: "u", x: `No está evaluado con ${NM[k]}: pregúntalo a la protectora.` });
  }
  if (life.exp === "primero") {
    if (d.act === "alta" || d.esp) out.push({ t: "w", x: "Para un primer perro pide más de lo habitual; la protectora puede orientarte." });
    else out.push({ t: "ok", x: "Buen primer perro: fácil de llevar." });
  }
  if (life.exp === "veterano") out.push({ t: "ok", x: "Con experiencia previa, sus necesidades son manejables." });
  return { items: out, ok: out.filter((o) => o.t === "ok").length, tot: out.length };
}
