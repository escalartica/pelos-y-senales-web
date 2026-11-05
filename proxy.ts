// Modo privado: mientras exista SITE_PASSWORD, toda la web pide usuario y contraseña
// (autenticación básica del navegador) y le dice a los buscadores que no la indexen.
// Para abrirla al público basta con borrar SITE_PASSWORD en Vercel y volver a desplegar.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pass = process.env.SITE_PASSWORD;
  if (!pass) return NextResponse.next();
  // El calendario privado lleva su propia clave en la dirección: Google y el iPhone no saben escribir la contraseña de la web.
  if (request.nextUrl.pathname.startsWith("/api/calendario/")) return NextResponse.next();
  // El manifiesto y los iconos de la app del móvil los pide el sistema sin contraseña.
  if (["/admin/app.webmanifest", "/icon.png", "/apple-icon.png"].includes(request.nextUrl.pathname)) return NextResponse.next();

  const user = process.env.SITE_USER || "equipo";
  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const [u, ...rest] = atob(header.slice(6)).split(":");
      if (u === user && rest.join(":") === pass) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        return res;
      }
    } catch { /* cabecera mal formada: se vuelve a pedir */ }
  }
  return new NextResponse("Pelos y Señales está en preparación. Acceso solo para el equipo.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Pelos y Senales (privado)", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  // Todo menos los ficheros internos de Next; las imágenes y fuentes también quedan protegidas.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
