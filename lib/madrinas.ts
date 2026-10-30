// Madrinas y padrinos: personas conocidas que prestan su voz a los perros del proyecto.
// Solo personas reales que han dicho que sí. La frase, si la hay, es suya y literal: nunca se inventa.

export interface Madrina {
  id: string;
  n: string;
  rol: string;
  /** Presentación breve, con datos públicos verificados */
  bio: string;
  /** id del perro que apadrina (lib/data.ts), cuando lo elija */
  perro?: string;
  /** Su frase, literal y con su permiso */
  frase?: string;
  redes: { ig?: string; tt?: string; x?: string; yt?: string };
  /** Foto real, con su permiso */
  foto?: { src: string; alt: string };
  c: "m" | "c" | "l";
}

export const MADRINAS: Madrina[] = [
  {
    id: "marisol-bizcocho",
    n: "Marisol Bizcocho",
    rol: "Cantante",
    bio: "Cantante andaluza de sevillanas, tangos y rumbas con aire flamenco-pop. Es la primera madrina de Pelos y Señales.",
    redes: {},
    c: "m",
  },
];

export const RED_TXT: Record<keyof Madrina["redes"], string> = { ig: "Instagram", tt: "TikTok", x: "X", yt: "YouTube" };
export const RED_URL: Record<keyof Madrina["redes"], (u: string) => string> = {
  ig: (u) => `https://www.instagram.com/${u}/`,
  tt: (u) => `https://www.tiktok.com/@${u}`,
  x: (u) => `https://x.com/${u}`,
  yt: (u) => `https://www.youtube.com/@${u}`,
};
export const getMadrinaOf = (perroId: string) => MADRINAS.find((m) => m.perro === perroId);
