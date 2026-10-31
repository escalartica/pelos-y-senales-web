import Link from "next/link";
import type { Dog } from "@/lib/data";
import { RED_TXT, RED_URL, type Madrina } from "@/lib/madrinas";
import DogArt from "./DogArt";
import { foco } from "@/lib/foco";

const ICONS: Record<string, React.ReactNode> = {
  ig: <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" /></svg>,
  tt: <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M14 3v11.2a3.2 3.2 0 1 1-2.6-3.1V8.6A5.7 5.7 0 1 0 16.5 14V8.2c1.1.8 2.4 1.2 3.8 1.2V6.9c-2 0-3.8-1.6-3.8-3.9H14z" fill="currentColor" /></svg>,
  x: <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  yt: <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></svg>,
};

export default function MadrinaCard({ m, i = 0, as: H = "h3", d }: { m: Madrina; i?: number; as?: "h2" | "h3"; d?: Dog }) {
  const ini = m.n.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const redes = Object.keys(m.redes) as (keyof typeof m.redes)[];
  return (
    <article className={`mcard ${m.c}`} style={{ ["--tilt" as string]: `${i % 2 ? 1.2 : -1.2}deg` }}>
      <div className="mtop">
        {d ? <Link href={`/perros/${d.id}`} className="mdog" aria-label={`Ficha de ${d.n}`}><DogArt d={d} sizes="200px" ratio={1} /></Link>
          : m.foto ? <div className="mdog"><div className="art ph"><img src={m.foto.src} alt={m.foto.alt} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: foco(m.foto.src, 1), display: "block" }} /></div></div> : null}
        {!m.foto && <span className="mini" aria-hidden="true">{ini}</span>}
      </div>
      <div className="mbody">
        <small className="mrol">{m.rol}</small>
        <H>{m.n}</H>
        {d && <p className="mahij">Apadrina a <Link href={`/perros/${d.id}`}>{d.n}</Link>{d.estado !== "disponible" ? ` · ${d.estado === "adoptado" ? "ya adoptado" : "en proceso"}` : ""}</p>}
        {m.frase ? <p className="mq">«{m.frase}»</p> : <p className="mq" style={{ fontStyle: "normal" }}>{m.bio}</p>}
        {redes.length > 0 && <div className="mredes" aria-label={`Redes de ${m.n}`}>
          {redes.map((k) => <a key={k} className="rpill" href={RED_URL[k](m.redes[k]!)} target="_blank" rel="noopener noreferrer" aria-label={`${RED_TXT[k]} de ${m.n}`}>{ICONS[k]}<span>{RED_TXT[k]}</span></a>)}
        </div>}
      </div>
    </article>
  );
}
