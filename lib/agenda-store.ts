import { kv } from "./kv";
import type { Ev } from "./agenda";

export const AGENDA_EV = "agenda:ev";

/** Todos los eventos guardados, ordenados por fecha y hora. */
export async function eventosAgenda(): Promise<Ev[]> {
  const flat = (await kv<string[]>("HGETALL", AGENDA_EV)) || [];
  const out: Ev[] = [];
  for (let i = 1; i < flat.length; i += 2) { try { out.push(JSON.parse(flat[i])); } catch { /* entrada rota: se ignora */ } }
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || "").localeCompare(b.hora || ""));
}
