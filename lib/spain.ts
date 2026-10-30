// Mapa de España dibujado en SVG (sin servicios externos): proyección sencilla,
// contorno suavizado, Baleares y Canarias en recuadro. Coordenadas en grados.
import type { Protectora } from "./data";
import OTRAS from "./entidades.json";

export const MAPW = 1000;
export const MAPH = 800;

export function proj(lon: number, lat: number) {
  if (lat < 30) return { x: 40 + (lon + 18.4) * 34, y: 712 - (lat - 27.6) * 44 }; // Canarias (recuadro)
  return { x: (lon + 9.6) * 70, y: (44.1 - lat) * 91 };
}
export function unproj(x: number, y: number) {
  if (x < 236 && y > 612) return { lon: (x - 40) / 34 - 18.4, lat: (712 - y) / 44 + 27.6 };
  return { lon: x / 70 - 9.6, lat: 44.1 - y / 91 };
}

const SPAIN: [number, number][] = [[-9.28,43.19],[-9.1,43.45],[-8.6,43.65],[-8.05,43.72],[-7.5,43.73],[-7.0,43.56],[-6.4,43.56],[-5.8,43.65],[-5.2,43.48],[-4.6,43.4],[-4.0,43.42],[-3.4,43.46],[-2.9,43.42],[-2.3,43.3],[-1.9,43.38],[-1.78,43.39],[-1.55,43.26],[-1.3,43.08],[-0.9,42.95],[-0.5,42.8],[-0.1,42.7],[0.4,42.7],[0.7,42.85],[1.2,42.72],[1.7,42.5],[2.2,42.42],[2.7,42.42],[3.18,42.44],[3.1,42.1],[3.2,41.85],[2.6,41.6],[2.15,41.35],[1.5,41.15],[1.0,41.0],[0.85,40.75],[0.7,40.6],[0.4,40.3],[0.15,40.0],[-0.1,39.75],[-0.3,39.5],[-0.2,39.1],[0.2,38.8],[0.0,38.55],[-0.45,38.35],[-0.6,38.1],[-0.75,37.7],[-0.9,37.55],[-1.3,37.5],[-1.75,37.25],[-2.1,36.85],[-2.5,36.8],[-3.0,36.72],[-3.6,36.72],[-4.1,36.72],[-4.45,36.65],[-4.9,36.5],[-5.3,36.15],[-5.6,36.0],[-6.0,36.2],[-6.25,36.5],[-6.45,36.8],[-6.6,37.05],[-6.95,37.2],[-7.4,37.2],[-7.45,37.5],[-7.3,37.9],[-7.0,38.2],[-7.2,38.6],[-7.3,38.85],[-7.0,39.2],[-7.4,39.5],[-7.5,39.75],[-7.0,40.1],[-6.85,40.3],[-6.8,40.7],[-6.9,41.0],[-6.5,41.3],[-6.2,41.6],[-6.6,41.95],[-7.2,41.9],[-7.9,41.9],[-8.2,42.15],[-8.65,42.0],[-8.9,42.3],[-9.05,42.6],[-9.25,42.9]];

/** Contorno suavizado (Catmull-Rom → Bézier) */
export function spainPath() {
  const n = SPAIN.length; let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = SPAIN[(i - 1 + n) % n], p1 = SPAIN[i], p2 = SPAIN[(i + 1) % n], p3 = SPAIN[(i + 2) % n];
    const a = proj(p1[0], p1[1]), b = proj(p2[0], p2[1]), q0 = proj(p0[0], p0[1]), q3 = proj(p3[0], p3[1]);
    const c1x = a.x + (b.x - q0.x) / 6, c1y = a.y + (b.y - q0.y) / 6, c2x = b.x - (q3.x - a.x) / 6, c2y = b.y - (q3.y - a.y) / 6;
    d += (i ? "" : `M${a.x.toFixed(1)} ${a.y.toFixed(1)}`) + ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d + " Z";
}

/** Ciudades para elegir ubicación aproximada (capitales y ciudades con entidades en el mapa). [lat, lon] */
export const CITIES: Record<string, [number, number]> = {
  "A Coruña": [43.36, -8.41], "Albacete": [38.99, -1.86], "Alicante": [38.35, -0.48], "Almería": [36.83, -2.46], "Arucas": [28.12, -15.52], "Ávila": [40.66, -4.70],
  "Badajoz": [38.88, -6.97], "Barcelona": [41.39, 2.17], "Bilbao": [43.26, -2.93], "Burgos": [42.34, -3.70], "Cáceres": [39.47, -6.37], "Cádiz": [36.53, -6.29],
  "Castelló de la Plana": [39.99, -0.05], "Ceuta": [35.89, -5.32], "Ciudad Real": [38.99, -3.93], "Córdoba": [37.89, -4.78], "Cuenca": [40.07, -2.14], "Donostia / San Sebastián": [43.32, -1.98],
  "Gijón": [43.53, -5.66], "Girona": [41.98, 2.82], "Granada": [37.18, -3.60], "Guadalajara": [40.63, -3.17], "Huelva": [37.26, -6.94], "Huesca": [42.14, -0.41],
  "Jaén": [37.78, -3.79], "Jerez de la Frontera": [36.69, -6.13], "Las Palmas de Gran Canaria": [28.12, -15.43], "León": [42.60, -5.57], "Lleida": [41.62, 0.62], "Logroño": [42.47, -2.45],
  "Lugo": [43.01, -7.56], "Madrid": [40.42, -3.70], "Málaga": [36.72, -4.42], "Melilla": [35.29, -2.94], "Murcia": [37.99, -1.13], "Ourense": [42.34, -7.86],
  "Oviedo": [43.36, -5.85], "Palencia": [42.01, -4.53], "Palma": [39.57, 2.65], "Pamplona": [42.81, -1.64], "Pontevedra": [42.43, -8.64], "Salamanca": [40.97, -5.66],
  "San Cristóbal de La Laguna": [28.49, -16.32], "Santa Cruz de Tenerife": [28.47, -16.25], "Santander": [43.46, -3.81], "Segovia": [40.95, -4.12], "Sevilla": [37.39, -5.98], "Soria": [41.76, -2.46],
  "Tarragona": [41.12, 1.25], "Teruel": [40.34, -1.11], "Toledo": [39.86, -4.03], "Valencia": [39.47, -0.38], "Valladolid": [41.65, -4.72], "Vigo": [42.24, -8.72],
  "Vitoria-Gasteiz": [42.85, -2.67], "Zamora": [41.50, -5.75], "Zaragoza": [41.65, -0.88],
};

export function kmBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, dl = (b.lat - a.lat) * Math.PI / 180, dn = (b.lon - a.lon) * Math.PI / 180, x = Math.sin(dl / 2), y = Math.sin(dn / 2);
  const h = x * x + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * y * y;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function nearestCity(lat: number, lon: number) {
  let best = "", bd = 1e9;
  for (const c of Object.keys(CITIES)) { const d = kmBetween({ lat, lon }, { lat: CITIES[c][0], lon: CITIES[c][1] }); if (d < bd) { bd = d; best = c; } }
  return best;
}

export interface Entidad {
  id: string; n: string; tipo: string; ciudad: string; prov: string; lat: number; lon: number;
  colab: boolean; tel: string; mail: string; web: string; horas?: string; desc?: string; km?: number;
}

/**
 * Entidades del mapa. Las que colaboran salen de lib/data.ts (cuando tienen ubicación); el resto es un directorio
 * de entidades reales con su contacto público, comprobado en su web oficial o la de su ayuntamiento (lib/entidades.json,
 * campo `fuente`). Cualquier entidad puede pedir corregir sus datos o retirarse.
 */
export const entidades = (PROT: Record<string, Protectora>): Entidad[] => [
  ...Object.values(PROT).filter((p) => p.lat != null && p.lon != null).map((p) => ({ id: p.id, n: p.n, tipo: "Protectora", ciudad: p.ciudad, prov: p.prov, lat: p.lat!, lon: p.lon!, colab: true, tel: p.tel, mail: p.mail, web: `/protectoras/${p.id}`, horas: p.horas, desc: p.desc })),
  ...(OTRAS as Omit<Entidad, "colab">[]).map((e) => ({ ...e, colab: false })),
];
