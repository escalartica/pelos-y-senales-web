import { calTokenOk } from "@/lib/admin";
import { aIcs } from "@/lib/agenda";
import { eventosAgenda } from "@/lib/agenda-store";
import { rateLimit, ipOf } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Calendario privado para suscribirse desde Google Calendar, el Calendario del iPhone/Mac u Outlook.
 * Solo lectura. La dirección lleva una clave que se deriva de la contraseña del panel:
 * si se cambia ADMIN_PASSWORD, el enlace antiguo deja de funcionar y hay que suscribirse con el nuevo.
 */
export async function GET(req: Request, { params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params;
  if (!(await rateLimit("cal:" + ipOf(req), 120, 3600))) return new Response("Demasiadas peticiones.", { status: 429 });
  if (!calTokenOk(clave)) return new Response("No encontrado.", { status: 404 });
  return new Response(aIcs(await eventosAgenda()), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="agenda-pelosysenales.ics"',
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
