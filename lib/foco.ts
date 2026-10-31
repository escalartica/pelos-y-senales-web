// Encuadre de las fotos: dónde está la cabeza de cada perro, para que ningún recorte le corte la cara.
// Valores en % de la altura de la foto, medidos a mano sobre cada retrato:
//   cabeza = de la punta de las orejas al final de la lengua
//   cara   = lo imprescindible (de la frente a la barbilla)
// Las fotos nuevas que se suban sin medir usan CARA_DEFECTO, pensada para un retrato vertical
// con el perro centrado.

type Caja = { cabeza: [number, number]; cara: [number, number]; x?: number; r?: number }; // r = ancho/alto de la foto si no es 2:3

const FOCO: Record<string, Caja> = {
  "6285": { cabeza: [20, 95], cara: [28, 85] }, // Barry
  "6308": { cabeza: [22, 92], cara: [25, 85] }, // Aria
  "6392": { cabeza: [28, 92], cara: [30, 80] }, // Toby
  "6507": { cabeza: [30, 86], cara: [32, 82] }, // Simba
  "6567": { cabeza: [25, 88], cara: [27, 82] }, // Luffy
  "6645": { cabeza: [5, 78], cara: [15, 70], x: 45 }, // Toyota
  "6699": { cabeza: [26, 77], cara: [28, 72] },
  "6901": { cabeza: [12, 80], cara: [25, 78] },
  "6686": { cabeza: [18, 78], cara: [22, 75] },
  "6700": { cabeza: [32, 90], cara: [34, 85] },
  "6933": { cabeza: [30, 82], cara: [33, 80] },
  "6428": { cabeza: [10, 98], cara: [10, 40] }, // cuerpo entero
  "6596": { cabeza: [8, 95], cara: [38, 68] }, // cuerpo entero
  mirin: { cabeza: [13, 72], cara: [18, 70], x: 60, r: 524 / 611 },
  "soja-negra": { cabeza: [21, 82], cara: [25, 80], r: 524 / 610 },
  matcha: { cabeza: [18, 72], cara: [22, 70], x: 42, r: 524 / 610 },
};
const CARA_DEFECTO: Caja = { cabeza: [18, 88], cara: [25, 80] };

/** Proporción ancho/alto de los retratos de la sesión (1067 × 1600). */
const FOTO_STD = 2 / 3;

function cajaDe(src: string | undefined): Caja {
  const k = src?.match(/\/(?:4e6a)?([^/.]+)\.(?:jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
  return (k && FOCO[k]) || CARA_DEFECTO;
}

/**
 * object-position para mostrar la foto `src` dentro de una caja de proporción `caja` (ancho/alto)
 * con object-fit: cover. Si cabe la cabeza entera la centra; si no, asegura al menos la cara.
 */
export function foco(src: string | undefined, caja = 4 / 5): string {
  const c = cajaDe(src);
  const x = c.x ?? 50;
  const FOTO = c.r ?? FOTO_STD;
  if (caja <= FOTO) return `${x}% 50%`; // la caja es más estrecha que la foto: no se recorta en vertical
  const v = FOTO / caja; // fracción de la altura que se ve
  const [a, b] = (c.cabeza[1] - c.cabeza[0]) / 100 <= v ? c.cabeza : c.cara;
  const centro = (a + b) / 200;
  const p = Math.min(1, Math.max(0, (centro - v / 2) / (1 - v)));
  return `${x}% ${Math.round(p * 100)}%`;
}
