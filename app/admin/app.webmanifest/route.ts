/** Hace que el panel se pueda instalar en el móvil como una app («Añadir a pantalla de inicio») y abra directamente en la agenda. */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    name: "Agenda · Pelos y Señales",
    short_name: "Agenda PyS",
    description: "Agenda y panel del equipo de Pelos y Señales",
    id: "/admin",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "any",
    background_color: "#FBF7EE",
    theme_color: "#FBF7EE",
    lang: "es",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  }, { headers: { "content-type": "application/manifest+json; charset=utf-8" } });
}
