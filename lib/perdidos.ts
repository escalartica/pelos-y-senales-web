// Perdidos y avistados: modelo y utilidades compartidas. Los avisos se guardan en el servidor (/api/avisos),
// se publican tras confirmar el correo de quien los envía y caducan solos a los 60 días.
"use client";
import { useCallback, useEffect, useState } from "react";
import { kmBetween } from "./spain";

export type TipoAviso = "perdido" | "avistado";
export type EstadoAvistado = "avistado" | "asustado" | "herido" | "recogido";
export type Tam = "p" | "m" | "g";

export interface Aviso {
  id: string; tipo: TipoAviso; nombre?: string; sexo?: string; tam: Tam; color: string; chip?: string; collar?: string;
  fecha: string; lugar: string; ciudad: string; lat: number; lon: number; caracter?: string; estado?: EstadoAvistado;
  dir?: string; tel?: string; notas?: string; foto?: string | null; resuelto?: string; publicado?: string;
}

export const TAM: Record<Tam, string> = { p: "pequeño", m: "mediano", g: "grande" };

/** Avisos publicados, leídos del servidor. `activo` = false si el almacenamiento aún no está configurado. */
export function useAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [activo, setActivo] = useState(true);
  const recargar = useCallback(async () => {
    try {
      const r = await fetch("/api/avisos", { cache: "no-store" });
      const j = await r.json();
      setAvisos(Array.isArray(j.avisos) ? j.avisos : []); setActivo(j.activo !== false); setEstado("ok");
    } catch { setEstado("error"); }
  }, []);
  useEffect(() => { recargar(); }, [recargar]);
  return { avisos, estado, activo, recargar };
}

export function cls(x: Aviso) { return x.resuelto ? "encasa" : x.tipo === "perdido" ? "perdido" : x.estado === "recogido" ? "recogido" : "avistado"; }
export function label(x: Aviso) {
  if (x.resuelto) return "En casa";
  if (x.tipo === "perdido") return "Se busca";
  return x.estado === "recogido" ? "Recogido" : x.estado === "herido" ? "Avistado · herido" : x.estado === "asustado" ? "Avistado · asustado" : "Avistado";
}
export function fmtFecha(f?: string) { if (!f) return ""; const d = new Date(f); if (isNaN(+d)) return f; return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); }
export function shareText(x: Aviso) {
  const url = `${typeof location !== "undefined" ? location.origin : "https://pelosysenales.es"}/perdidos#pa-${x.id}`;
  return x.tipo === "perdido"
    ? `SE BUSCA: ${x.nombre || "perro"}, ${TAM[x.tam]}, ${x.color}. Visto por última vez en ${x.lugar} (${x.ciudad}), ${fmtFecha(x.fecha)}. Si lo ves, llama al ${x.tel || "teléfono del aviso"}. ${url}`
    : `PERRO VISTO SUELTO en ${x.lugar} (${x.ciudad}), ${fmtFecha(x.fecha)}: ${TAM[x.tam]}, ${x.color}. ¿Es tuyo o sabes de quién es? ${url}`;
}
export function matches(list: Aviso[]) {
  const out: { l: Aviso; v: Aviso; km: number; score: number }[] = [];
  const act = list.filter((x) => !x.resuelto);
  act.filter((l) => l.tipo === "perdido").forEach((l) => act.filter((v) => v.tipo === "avistado").forEach((v) => {
    const km = kmBetween(l, v); if (km >= 40 || l.tam !== v.tam) return;
    const dt = Math.abs(+new Date(v.fecha) - +new Date(l.fecha)) / 36e5; if (!(dt < 24 * 7)) return;
    const c1 = (v.color || "").split(/[ ,]/)[0].toLowerCase(), c2 = (l.color || "").split(/[ ,]/)[0].toLowerCase();
    out.push({ l, v, km, score: 40 - km + (c1 && c1 === c2 ? 30 : 0) });
  }));
  return out.sort((a, b) => b.score - a.score).slice(0, 4);
}

/** Reduce una foto en el navegador (lado mayor 1000 px, JPEG) antes de subirla: menos datos y sin metadatos de ubicación. */
export function reducirFoto(file: File, max = 1000): Promise<string> {
  return new Promise((ok, ko) => {
    if (!/^image\//.test(file.type)) { ko(new Error("tipo")); return; }
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error("lectura")); };
    img.src = url;
  });
}
