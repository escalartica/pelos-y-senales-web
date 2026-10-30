import type { Dog, Protectora, Conv, Estado, Tam, EdadGrupo, Act } from "./data";
import type { Madrina } from "./madrinas";
import type { Catalog } from "./catalog";

/** Limpia y valida lo que llega del panel antes de guardarlo. Devuelve el catálogo limpio o el primer error. */
const s = (v: unknown, n = 300) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, n);
const one = <T extends string>(v: unknown, ok: readonly T[], def: T): T => (ok.includes(v as T) ? (v as T) : def);
const ID = /^[a-z0-9][a-z0-9-]{0,48}$/;
const url = (v: unknown) => { const x = s(v, 400); return !x ? "" : /^https?:\/\//i.test(x) ? x : ""; };
const foto = (v: unknown) => { const x = s(v, 200); return /^\/(img|brand)\/[\w./-]+$/.test(x) || /^\/api\/img\/[a-f0-9]{20}$/.test(x) ? x : ""; };
const num = (v: unknown) => { const n = Number(v); return v === "" || v == null || !isFinite(n) ? undefined : n; };

const CONV = ["si", "no", "desc"] as const, EST = ["disponible", "proceso", "reservado", "adoptado"] as const;
const TAM = ["pequeño", "mediano", "grande"] as const, EDAD = ["cachorro", "adulto", "senior"] as const, ACT = ["baja", "media", "alta"] as const;
const COL = ["m", "c", "l"] as const;

export function limpiarCatalogo(raw: unknown): { cat?: Catalog; error?: string } {
  const r = raw as Partial<Catalog>;
  if (!r || typeof r !== "object" || !r.prot || !Array.isArray(r.dogs) || !Array.isArray(r.madrinas)) return { error: "Datos incompletos." };
  const prot: Record<string, Protectora> = {};
  for (const [k, v] of Object.entries(r.prot)) {
    const p = v as Protectora; const id = s(p.id || k, 50).toLowerCase();
    if (!ID.test(id)) return { error: `Identificador de protectora no válido: «${id}». Usa minúsculas, números y guiones.` };
    if (!s(p.n)) return { error: "Cada protectora necesita un nombre." };
    const lat = num(p.lat), lon = num(p.lon);
    if ((lat != null && (lat < 27 || lat > 44.5)) || (lon != null && (lon < -18.5 || lon > 4.6))) return { error: `Las coordenadas de ${s(p.n)} no están en España.` };
    prot[id] = { id, n: s(p.n, 120), ciudad: s(p.ciudad, 80), prov: s(p.prov, 60), tel: s(p.tel, 40), mail: s(p.mail, 120), horas: s(p.horas, 120), desc: s(p.desc, 600), ...(lat != null && lon != null ? { lat, lon } : {}), web: url(p.web), ig: s(p.ig, 60).replace(/^@/, "") };
  }
  const ids = new Set<string>(); const dogs: Dog[] = [];
  for (const v of r.dogs) {
    const d = v as Dog; const id = s(d.id, 50).toLowerCase();
    if (!ID.test(id)) return { error: `Identificador no válido para «${s(d.n)}». Usa minúsculas, números y guiones.` };
    if (ids.has(id)) return { error: `Hay dos perros con el identificador «${id}».` }; ids.add(id);
    if (!s(d.n)) return { error: "Cada perro necesita un nombre." };
    if (!prot[d.prot]) return { error: `${s(d.n)} no tiene una protectora válida.` };
    const c = (d.conv || {}) as Dog["conv"];
    dogs.push({
      id, n: s(d.n, 40), edadTxt: s(d.edadTxt, 40), edad: one<EdadGrupo>(d.edad, EDAD, "adulto"), tam: one<Tam>(d.tam, TAM, "mediano"), sexo: d.sexo === "hembra" ? "hembra" : "macho",
      peso: s(d.peso, 20) || undefined, acogida: !!d.acogida, act: one<Act>(d.act, ACT, "media"), photo: foto(d.photo) || undefined,
      art: d.photo ? undefined : one(d.art, ["galgo", "carlino", "teckel", "scottie", "caniche"] as const, "galgo"), c: one(d.c, COL, "m"), prot: d.prot,
      raza: s(d.raza, 80) || "Mestizo", rasgos: (Array.isArray(d.rasgos) ? d.rasgos : []).map((x) => s(x, 40)).filter(Boolean).slice(0, 6),
      conv: { ninos: one<Conv>(c.ninos, CONV, "desc"), perros: one<Conv>(c.perros, CONV, "desc"), gatos: one<Conv>(c.gatos, CONV, "desc") },
      esp: !!d.esp, espTxt: s(d.espTxt, 300) || undefined, estado: one<Estado>(d.estado, EST, "disponible"), upd: s(d.upd, 30),
      desc: s(d.desc, 600), pers: s(d.pers, 1200), nec: (Array.isArray(d.nec) ? d.nec : []).map((x) => s(x, 240)).filter(Boolean).slice(0, 8), hist: s(d.hist, 1200),
    });
  }
  const mids = new Set<string>(); const madrinas: Madrina[] = [];
  for (const v of r.madrinas) {
    const m = v as Madrina; const id = s(m.id, 50).toLowerCase();
    if (!ID.test(id)) return { error: `Identificador no válido para la madrina «${s(m.n)}».` };
    if (mids.has(id)) return { error: `Hay dos madrinas con el identificador «${id}».` }; mids.add(id);
    if (!s(m.n)) return { error: "Cada madrina o padrino necesita un nombre." };
    const red = (x: unknown) => s(x, 60).replace(/^@/, "").replace(/[^\w.-]/g, "") || undefined;
    const f = m.foto && foto(m.foto.src) ? { src: foto(m.foto.src), alt: s(m.foto.alt, 160) || s(m.n) } : undefined;
    madrinas.push({ id, n: s(m.n, 80), rol: s(m.rol, 60), bio: s(m.bio, 600), perro: ids.has(String(m.perro)) ? String(m.perro) : undefined, frase: s(m.frase, 300) || undefined,
      redes: { ig: red(m.redes?.ig), tt: red(m.redes?.tt), x: red(m.redes?.x), yt: red(m.redes?.yt) }, foto: f, c: one(m.c, COL, "m") });
    const rr = madrinas[madrinas.length - 1].redes; (Object.keys(rr) as (keyof typeof rr)[]).forEach((k) => rr[k] === undefined && delete rr[k]);
  }
  return { cat: { dogs, prot, madrinas } };
}
