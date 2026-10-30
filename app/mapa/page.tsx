import type { Metadata } from "next";
import Link from "next/link";
import MapaEntidades from "@/components/MapaEntidades";

export const metadata: Metadata = {
  title: "Mapa de protectoras, refugios y centros",
  description: "Protectoras, refugios y centros municipales de toda España, colaboren o no con Pelos y Señales, con su enlace y su contacto.",
};

export default function MapaPage() {
  return (
    <main>
      <div className="wrap listhead">
        <span className="eyebrow">Mapa · toda España</span>
        <h1>Quién cuida de los perros cerca de ti, colabore o no con nosotros.</h1>
        <p className="lead">Un mapa con las protectoras, refugios y centros municipales que trabajan con Pelos y Señales y también con los que no: todos con su enlace y su contacto. No somos intermediarios; somos un sitio donde encontrar información y crear lazos. Si conoces una entidad que falta, dínoslo.</p>
      </div>
      <MapaEntidades />
      <section className="band crema curve" style={{ marginTop: 40 }}>
        <div className="wrap"><div className="split">
          <div><span className="eyebrow">Por qué todas</span><h2>Lazos, no fronteras.</h2><p className="lead" style={{ marginTop: 12 }}>Un perro no sabe qué entidad lo recogió. Si alguien busca adoptar, acoger o ayudar en su ciudad, queremos que encuentre a todas las que hacen ese trabajo, no solo a las que fotografiamos nosotros. Las que colaboran tienen fichas y fotos aquí; las demás, su enlace y su teléfono.</p></div>
          <div className="entcard"><span className="tag c">Para entidades</span><h2 style={{ fontSize: 24 }}>¿Quieres aparecer o colaborar?</h2><p className="meta">Aparecer en el mapa es gratis y no obliga a nada. Colaborar añade sesiones de fotos, fichas propias de cada perro y difusión en redes.</p><div className="links"><Link href="/protectoras">Cómo colaboramos</Link><Link href="/colabora#contacto">Escribirnos</Link></div></div>
        </div></div>
      </section>
    </main>
  );
}
