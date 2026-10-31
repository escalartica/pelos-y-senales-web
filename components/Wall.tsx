import { LASA_FOTOS } from "@/lib/fotos";
import { foco } from "@/lib/foco";
const R = ["-2deg", "1.5deg", "2deg", "-1deg"];
export default function Wall() {
  return (
    <div className="wall" aria-label="Así se verán las láminas de la exposición">
      {LASA_FOTOS.slice(1, 5).map((f, i) => <div key={f.src} className="print" style={{ ["--r" as string]: R[i] } as React.CSSProperties}><img src={f.src} alt={f.alt} loading="lazy" style={{ objectPosition: foco(f.src, 4 / 5) }} /><b>Busca familia</b><span className="qr" /></div>)}
    </div>
  );
}
