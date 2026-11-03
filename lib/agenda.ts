/**
 * Agenda del equipo (solo panel de administración).
 * - Eventos: un hash en KV («agenda:ev») con un JSON por evento.
 * - Planificadores: un JSON por periodo en «agenda:pl:<clave>», donde la clave es
 *   d:AAAA-MM-DD (día), w:AAAA-Www (semana ISO), m:AAAA-MM (mes) o y:AAAA (año).
 * Las fechas se manejan siempre como texto «AAAA-MM-DD» para no depender de la zona horaria.
 */

export const TIPOS = [
  { id: "sesion", n: "Sesión de fotos", c: "#F2A93B" },
  { id: "visita", n: "Visita a protectora", c: "#3F7D5C" },
  { id: "reunion", n: "Reunión", c: "#3B5F8A" },
  { id: "evento", n: "Evento", c: "#E8734A" },
  { id: "redes", n: "Publicación en redes", c: "#8E5BB5" },
  { id: "adopcion", n: "Adopción o entrega", c: "#C9CF58" },
  { id: "otro", n: "Otro", c: "#7A7266" },
] as const;
export type Tipo = (typeof TIPOS)[number]["id"];
export const tipoDe = (t: string) => TIPOS.find((x) => x.id === t) ?? TIPOS[TIPOS.length - 1];

export type Ev = {
  id: string;
  fecha: string; // AAAA-MM-DD
  hasta?: string; // último día, si dura varios
  hora?: string; // HH:MM
  fin?: string; // HH:MM
  titulo: string;
  tipo: Tipo;
  lugar?: string;
  notas?: string;
};

export type Tarea = { t: string; ok: boolean };
export type Plan = {
  prioridades?: string[];
  tareas?: Tarea[];
  notas?: string;
  horas?: Record<string, string>;
  dias?: Record<string, string>;
  meses?: Record<string, string>;
  objetivos?: string;
};

/* ---------- Fechas ---------- */
const p2 = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const toDate = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1, 12); };
export const hoyYmd = () => ymd(new Date());
export const addDays = (s: string, n: number) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
export const addMonths = (s: string, n: number) => { const d = toDate(s); d.setDate(1); d.setMonth(d.getMonth() + n); return ymd(d); };
/** Lunes de la semana de esa fecha. */
export const lunes = (s: string) => { const d = toDate(s); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return ymd(d); };
/** Semana ISO 8601: «AAAA-Www». */
export function semanaIso(s: string) {
  const d = toDate(s); const dia = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dia + 3);
  const y = d.getFullYear(); const j4 = new Date(y, 0, 4, 12); const dj = (j4.getDay() + 6) % 7; j4.setDate(j4.getDate() - dj + 3);
  return `${y}-W${p2(1 + Math.round((d.getTime() - j4.getTime()) / 604800000))}`;
}
export const claveDia = (s: string) => `d:${s}`;
export const claveSemana = (s: string) => `w:${semanaIso(s)}`;
export const claveMes = (s: string) => `m:${s.slice(0, 7)}`;
export const claveAno = (s: string) => `y:${s.slice(0, 4)}`;
export const CLAVE_RE = /^(d:\d{4}-\d{2}-\d{2}|w:\d{4}-W\d{2}|m:\d{4}-\d{2}|y:\d{4})$/;

/** ¿El evento ocupa ese día? */
export const enDia = (e: Ev, s: string) => e.fecha <= s && s <= (e.hasta && e.hasta >= e.fecha ? e.hasta : e.fecha);
export const ordenEv = (a: Ev, b: Ev) => (a.hora || "99").localeCompare(b.hora || "99") || a.titulo.localeCompare(b.titulo);

/* ---------- Validación (servidor) ---------- */
const FECHA = /^\d{4}-\d{2}-\d{2}$/; const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function limpiarEv(x: unknown): Ev | string {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const titulo = txt(o.titulo, 120); if (!titulo) return "Ponle un título al evento.";
  const fecha = txt(o.fecha, 10); if (!FECHA.test(fecha)) return "La fecha no es válida.";
  const hasta = txt(o.hasta, 10); const hora = txt(o.hora, 5); const fin = txt(o.fin, 5);
  if (hasta && (!FECHA.test(hasta) || hasta < fecha)) return "La fecha de fin no puede ser anterior a la de inicio.";
  if (hora && !HORA.test(hora)) return "La hora no es válida.";
  if (fin && !HORA.test(fin)) return "La hora de fin no es válida.";
  const tipo = TIPOS.some((t) => t.id === o.tipo) ? (o.tipo as Tipo) : "otro";
  const id = /^[a-z0-9-]{6,40}$/.test(String(o.id || "")) ? String(o.id) : `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const ev: Ev = { id, fecha, titulo, tipo };
  if (hasta && hasta !== fecha) ev.hasta = hasta;
  if (hora) ev.hora = hora;
  if (hora && fin) ev.fin = fin;
  const lugar = txt(o.lugar, 160); if (lugar) ev.lugar = lugar;
  const notas = txt(o.notas, 2000); if (notas) ev.notas = notas;
  return ev;
}

export function limpiarPlan(x: unknown): Plan {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const mapa = (v: unknown, max: number) => {
    const out: Record<string, string> = {};
    if (v && typeof v === "object") for (const [k, s] of Object.entries(v as Record<string, unknown>).slice(0, 40)) { const t = txt(s, max); if (t && /^[\w-]{1,12}$/.test(k)) out[k] = t; }
    return out;
  };
  const p: Plan = {};
  if (Array.isArray(o.prioridades)) p.prioridades = o.prioridades.slice(0, 5).map((s) => txt(s, 200));
  if (Array.isArray(o.tareas)) p.tareas = o.tareas.slice(0, 60).map((t) => ({ t: txt((t as Tarea)?.t, 200), ok: !!(t as Tarea)?.ok })).filter((t) => t.t);
  if (typeof o.notas === "string") p.notas = txt(o.notas, 6000);
  if (typeof o.objetivos === "string") p.objetivos = txt(o.objetivos, 3000);
  if (o.horas) p.horas = mapa(o.horas, 300);
  if (o.dias) p.dias = mapa(o.dias, 1500);
  if (o.meses) p.meses = mapa(o.meses, 1500);
  return p;
}

/* ---------- Exportar a calendario (.ics) ---------- */
const icsTxt = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);
export function aIcs(evs: Ev[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pelos y Señales//Agenda//ES", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Agenda Pelos y Señales", "X-WR-TIMEZONE:Europe/Madrid"];
  for (const e of evs) {
    const d = e.fecha.replace(/-/g, "");
    L.push("BEGIN:VEVENT", `UID:${e.id}@pelosysenales.es`, `DTSTAMP:${stamp}`);
    if (e.hora) {
      L.push(`DTSTART;TZID=Europe/Madrid:${d}T${e.hora.replace(":", "")}00`);
      const fin = e.fin || `${p2(Math.min(23, Number(e.hora.slice(0, 2)) + 1))}:${e.hora.slice(3)}`;
      L.push(`DTEND;TZID=Europe/Madrid:${(e.hasta || e.fecha).replace(/-/g, "")}T${fin.replace(":", "")}00`);
    } else {
      L.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${addDays(e.hasta || e.fecha, 1).replace(/-/g, "")}`);
    }
    L.push(`SUMMARY:${icsTxt(e.titulo)}`, `CATEGORIES:${icsTxt(tipoDe(e.tipo).n)}`);
    if (e.lugar) L.push(`LOCATION:${icsTxt(e.lugar)}`);
    if (e.notas) L.push(`DESCRIPTION:${icsTxt(e.notas)}`);
    L.push("END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}
