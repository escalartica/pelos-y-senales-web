import { kv, kvPipe, kvConfigured } from "./kv";
import { sign } from "./guard";
import { sendMail, layout, row, esc, TEAM, SITE } from "./mail";
import { kmBetween, nearestCity } from "./spain";
import type { Aviso, Tam, TipoAviso, EstadoAvistado } from "./perdidos";

const DIAS_PUB = 60;      // un aviso publicado caduca a los 60 días
const DIAS_PEND = 2;      // uno sin confirmar, a los 2
const DIAS_RESUELTO = 15; // uno marcado «en casa» sigue visible 15 días
const KEY = (id: string) => `aviso:${id}`;
const FOTO = (id: string) => `foto:${id}`;
const PUB = "avisos:pub";
const SUBS = "avisos:subs";
const ALL = "avisos:all"; // índice de todos (también pendientes) para el panel

export type AvisoInterno = Aviso & { email: string; creado: string; estadoPub: "pendiente" | "publicado" };

const s = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);
const TAMS: Tam[] = ["p", "m", "g"]; const ESTADOS: EstadoAvistado[] = ["avistado", "asustado", "herido", "recogido"];

/** Valida y limpia lo que llega del formulario. Devuelve el aviso o un mensaje de error. */
export function limpiar(b: Record<string, unknown>): { a?: Omit<AvisoInterno, "id" | "creado" | "estadoPub" | "foto">; error?: string } {
  const tipo = b.tipo === "perdido" || b.tipo === "avistado" ? (b.tipo as TipoAviso) : null;
  if (!tipo) return { error: "Tipo de aviso no válido." };
  const lat = Number(b.lat), lon = Number(b.lon);
  if (!isFinite(lat) || !isFinite(lon) || lat < 27 || lat > 44.5 || lon < -18.5 || lon > 4.6) return { error: "Marca en el mapa un punto de España." };
  const email = s(b.email, 160).toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Escribe un correo válido: te enviaremos el enlace para publicarlo." };
  const tam = TAMS.includes(b.tam as Tam) ? (b.tam as Tam) : "m";
  const fecha = s(b.fecha, 16) || new Date().toISOString().slice(0, 16);
  if (isNaN(+new Date(fecha))) return { error: "La fecha no es válida." };
  const tel = s(b.tel, 30).replace(/[^\d+ ]/g, "");
  const a = {
    tipo, tam, lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4, email, fecha,
    ciudad: s(b.ciudad, 60) || nearestCity(lat, lon), lugar: s(b.lugar, 140), color: s(b.color, 120) || "Sin descripción",
    nombre: tipo === "perdido" ? s(b.nombre, 40) : undefined, sexo: tipo === "perdido" ? s(b.sexo, 10) : undefined,
    chip: tipo === "perdido" ? s(b.chip, 60) : undefined, collar: s(b.collar, 80), caracter: tipo === "perdido" ? s(b.caracter, 60) : undefined,
    estado: tipo === "avistado" ? (ESTADOS.includes(b.estado as EstadoAvistado) ? (b.estado as EstadoAvistado) : "avistado") : undefined,
    dir: s(b.dir, 100), tel, notas: s(b.notas, 600),
  };
  if (tipo === "perdido" && (!a.nombre || !a.tel)) return { error: "Nos falta su nombre y un teléfono de contacto." };
  if (!a.lugar) return { error: "Dinos el lugar: calle, parque o carretera." };
  return { a };
}

/** Lo que se muestra al público: sin correo ni datos internos. */
export function publico(x: AvisoInterno): Aviso {
  const { email: _e, creado: _c, estadoPub: _s, ...pub } = x; void _e; void _c; void _s;
  return pub;
}

export async function crear(a: Omit<AvisoInterno, "id" | "creado" | "estadoPub" | "foto">, foto?: string) {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  let fotoUrl: string | null = null;
  if (foto) { await kv("SET", FOTO(id), foto, "EX", DIAS_PEND * 86400); fotoUrl = `/api/avisos/foto/${id}`; }
  const x: AvisoInterno = { ...a, id, foto: fotoUrl, creado: new Date().toISOString(), estadoPub: "pendiente" };
  await kvPipe([["SET", KEY(id), JSON.stringify(x), "EX", DIAS_PEND * 86400], ["ZADD", ALL, Date.now(), id]]);
  return x;
}

export async function leer(id: string): Promise<AvisoInterno | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  const v = await kv<string | null>("GET", KEY(id)); return v ? (JSON.parse(v) as AvisoInterno) : null;
}

export async function publicar(id: string) {
  const x = await leer(id); if (!x) return null;
  if (x.estadoPub === "publicado") return x;
  x.estadoPub = "publicado"; x.publicado = new Date().toISOString();
  await kvPipe([["SET", KEY(id), JSON.stringify(x), "EX", DIAS_PUB * 86400], ["ZADD", PUB, Date.now(), id], ...(x.foto ? [["EXPIRE", FOTO(id), DIAS_PUB * 86400]] : [])]);
  await avisarEquipo(x);
  await avisarSuscritos(x);
  return x;
}

export async function resolver(id: string) {
  const x = await leer(id); if (!x || x.estadoPub !== "publicado") return null;
  x.resuelto = new Date().toISOString().slice(0, 16);
  await kvPipe([["SET", KEY(id), JSON.stringify(x), "EX", DIAS_RESUELTO * 86400], ...(x.foto ? [["EXPIRE", FOTO(id), DIAS_RESUELTO * 86400]] : [])]);
  return x;
}

export async function borrar(id: string) {
  await kvPipe([["DEL", KEY(id)], ["DEL", FOTO(id)], ["ZREM", PUB, id], ["ZREM", ALL, id]]);
}

export async function listar(): Promise<Aviso[]> {
  const ids = await kv<string[]>("ZREVRANGE", PUB, 0, 299);
  if (!ids?.length) return [];
  const vals = await kv<(string | null)[]>("MGET", ...ids.map(KEY));
  const out: Aviso[] = []; const gone: string[] = [];
  vals.forEach((v, i) => { if (!v) { gone.push(ids[i]); return; } const x = JSON.parse(v) as AvisoInterno; if (x.estadoPub === "publicado") out.push(publico(x)); });
  if (gone.length) await kvPipe(gone.map((id) => ["ZREM", PUB, id]));
  return out;
}

export async function foto(id: string) { if (!/^[a-f0-9]{16}$/.test(id)) return null; return kv<string | null>("GET", FOTO(id)); }

/* ---- Enlaces firmados ---- */
export const linkConfirmar = (id: string) => `${SITE}/api/avisos/confirmar?t=${encodeURIComponent(sign({ id, a: "pub" }))}`;
export const linkGestionar = (id: string) => `${SITE}/perdidos/gestionar?t=${encodeURIComponent(sign({ id, a: "gest" }))}`;

export async function mandarConfirmacion(x: AvisoInterno) {
  const que = x.tipo === "perdido" ? `la ficha de ${esc(x.nombre || "tu perro")}` : "tu avistamiento";
  return sendMail({ to: x.email, subject: x.tipo === "perdido" ? `Publica la ficha de ${x.nombre}` : "Publica tu avistamiento", html: layout("Un clic y se publica", `
    <p>Gracias por avisar. Para publicar ${que} en el mapa de Perdidos y avistados, confirma que este correo es tuyo:</p>
    <p style="margin:22px 0"><a href="${linkConfirmar(x.id)}" style="display:inline-block;background:#161616;color:#F4ECDC;text-decoration:none;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:13px;padding:14px 22px;border-radius:999px">Publicar el aviso</a></p>
    <p>Guarda también este enlace: con él puedes marcarlo como «ya está en casa» o retirarlo cuando quieras.</p>
    <p><a href="${linkGestionar(x.id)}" style="color:#161616;font-weight:800">Gestionar mi aviso</a></p>
    <p style="font-size:13px;opacity:.7">El enlace de publicación caduca en dos días. Si no has sido tú, ignora este correo y no se publicará nada.</p>`) });
}

async function avisarEquipo(x: AvisoInterno) {
  await sendMail({ to: TEAM, subject: `Nuevo aviso publicado · ${x.tipo === "perdido" ? "Se busca " + (x.nombre || "") : "Avistado"} · ${x.ciudad}`, html: layout("Aviso publicado en Perdidos y avistados", `
    <table style="border-collapse:collapse;margin:0 0 14px">${row("Tipo", x.tipo)}${x.nombre ? row("Nombre", x.nombre) : ""}${row("Dónde", `${x.lugar} (${x.ciudad})`)}${row("Descripción", x.color)}${x.tel ? row("Teléfono", x.tel) : ""}${row("Correo", x.email)}${x.notas ? row("Notas", x.notas) : ""}</table>
    <p>Si es spam o no es apropiado, retíralo aquí: <a href="${linkGestionar(x.id)}" style="color:#161616;font-weight:800">gestionar el aviso</a>.</p>`) });
}

/* ---- Avisos por zona: quien se suscribe recibe un correo cuando se publica algo a menos de 30 km ---- */
export async function suscribir(email: string, ciudad: string, lat: number, lon: number) {
  await kv("HSET", SUBS, email, JSON.stringify({ ciudad, lat, lon, desde: new Date().toISOString() }));
}
export async function baja(email: string) { await kv("HDEL", SUBS, email); }
export const linkBaja = (email: string) => `${SITE}/api/avisos/zona?baja=${encodeURIComponent(sign({ email, a: "baja" }))}`;

async function avisarSuscritos(x: AvisoInterno) {
  const flat = await kv<string[]>("HGETALL", SUBS); if (!flat?.length) return;
  const destinos: string[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    try { const z = JSON.parse(flat[i + 1]) as { lat: number; lon: number }; if (flat[i] !== x.email && kmBetween(z, x) < 30) destinos.push(flat[i]); } catch { /* registro roto */ }
  }
  for (const to of destinos.slice(0, 300)) {
    await sendMail({ to, subject: `${x.tipo === "perdido" ? "Se busca un perro" : "Perro visto suelto"} cerca de ${x.ciudad}`, html: layout(x.tipo === "perdido" ? `Se busca: ${x.nombre}` : "Han visto un perro suelto cerca de ti", `
      <p>${x.tipo === "perdido" ? `${esc(x.nombre || "Un perro")} (${esc(x.color)}) se perdió en <b>${esc(x.lugar)}</b>, ${esc(x.ciudad)}.` : `Un perro ${esc(x.color)} visto en <b>${esc(x.lugar)}</b>, ${esc(x.ciudad)}.`}</p>
      <p><a href="${SITE}/perdidos#pa-${x.id}" style="color:#161616;font-weight:800">Ver el aviso en el mapa</a></p>
      <p style="font-size:13px;opacity:.7">Recibes esto porque pediste avisos de tu zona. <a href="${linkBaja(to)}" style="color:#161616">Darme de baja</a>.</p>`) });
  }
}

export { kvConfigured };

/* ---- Panel de administración ---- */
/** Todos los avisos (pendientes, publicados y resueltos), con correo, para moderar. */
export async function listarTodo(): Promise<AvisoInterno[]> {
  const [a, p] = (await kvPipe([["ZREVRANGE", ALL, 0, 999], ["ZREVRANGE", PUB, 0, 999]])) as string[][];
  const ids = Array.from(new Set([...(a || []), ...(p || [])]));
  if (!ids.length) return [];
  const vals = await kv<(string | null)[]>("MGET", ...ids.map(KEY));
  const out: AvisoInterno[] = []; const gone: string[] = [];
  vals.forEach((v, i) => { if (!v) gone.push(ids[i]); else out.push(JSON.parse(v) as AvisoInterno); });
  if (gone.length) await kvPipe(gone.flatMap((id) => [["ZREM", ALL, id], ["ZREM", PUB, id]]));
  return out.sort((x, y) => (y.creado || "").localeCompare(x.creado || ""));
}
/** Corrige textos de un aviso sin cambiar su caducidad. */
export async function editar(id: string, c: Record<string, unknown>) {
  const x = await leer(id); if (!x) return null;
  const campos = ["nombre", "color", "lugar", "ciudad", "tel", "notas", "collar", "chip", "dir"] as const;
  for (const k of campos) if (k in c) (x as unknown as Record<string, unknown>)[k] = s(c[k], k === "notas" ? 600 : 140);
  if ("tam" in c && TAMS.includes(c.tam as Tam)) x.tam = c.tam as Tam;
  if (x.tipo === "avistado" && "estado" in c && ESTADOS.includes(c.estado as EstadoAvistado)) x.estado = c.estado as EstadoAvistado;
  await kv("SET", KEY(id), JSON.stringify(x), "KEEPTTL");
  return x;
}
/** Publica un aviso pendiente sin esperar a que lo confirme quien lo envió (no manda alertas por zona). */
export async function publicarAdmin(id: string) {
  const x = await leer(id); if (!x) return null;
  if (x.estadoPub === "publicado") return x;
  x.estadoPub = "publicado"; x.publicado = new Date().toISOString();
  await kvPipe([["SET", KEY(id), JSON.stringify(x), "EX", DIAS_PUB * 86400], ["ZADD", PUB, Date.now(), id], ...(x.foto ? [["EXPIRE", FOTO(id), DIAS_PUB * 86400]] : [])]);
  return x;
}
/** Quita el «ya está en casa» y lo vuelve a dejar activo 60 días. */
export async function reabrir(id: string) {
  const x = await leer(id); if (!x) return null;
  delete x.resuelto;
  await kvPipe([["SET", KEY(id), JSON.stringify(x), "EX", DIAS_PUB * 86400], ...(x.foto ? [["EXPIRE", FOTO(id), DIAS_PUB * 86400]] : [])]);
  return x;
}
export async function listarSubs() {
  const flat = await kv<string[]>("HGETALL", SUBS); const out: { email: string; ciudad: string; desde: string }[] = [];
  for (let i = 0; i < (flat?.length || 0); i += 2) { try { const z = JSON.parse(flat[i + 1]); out.push({ email: flat[i], ciudad: z.ciudad || "", desde: z.desde || "" }); } catch { out.push({ email: flat[i], ciudad: "", desde: "" }); } }
  return out.sort((a, b) => b.desde.localeCompare(a.desde));
}
