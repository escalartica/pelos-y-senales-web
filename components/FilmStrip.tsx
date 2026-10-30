import { LASA_FOTOS } from "@/lib/fotos";
/** Tira de contactos: las fotos reales de la sesión avanzan solas; se detiene al pasar el ratón. */
const R = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg", "1deg"];
export default function FilmStrip() {
  const shots = LASA_FOTOS.map((f, i) => [f.src, "Primera sesión", R[i % R.length]] as const);
  const all = [...shots, ...shots];
  return (
    <div className="film" aria-hidden="true"><div className="strip">
      {all.map(([src, cap, r], i) => <div key={i} className="frame" style={{ ["--r" as string]: r } as React.CSSProperties}><img src={src} alt="" loading="lazy" /><small>{cap}</small><i /></div>)}
    </div></div>
  );
}
