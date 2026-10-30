import Reveal from "./Reveal";
/** Los cinco personajes de la marca. Cada uno «cuida» una parte del proyecto. */
export const PANDILLA = [
  { id: "galgo", n: "Galgo", rol: "El fotógrafo", txt: "Lleva la cámara al cuello y no se la quita ni para dormir. Es quien saca a los perros de la jaula.", c: "m" },
  { id: "teckel", n: "Teckel", rol: "El de las placas", txt: "Largo como un mostrador. Reparte los QR por clínicas, tiendas y peluquerías de cada zona.", c: "c" },
  { id: "scottie", n: "Scottie", rol: "El de la exposición", txt: "Cuelga las láminas en bares y centros cívicos y vigila que nadie se lleve una.", c: "l" },
  { id: "carlino", n: "Carlino", rol: "El del match", txt: "Mira, te mira y sabe cuándo encajáis. Ronca mientras tú lees la ficha.", c: "m" },
  { id: "caniche", n: "Caniche", rol: "La de las protectoras", txt: "Habla con todas, apunta todo y no promete nada que no pueda cumplir.", c: "c" },
] as const;

export default function Pandilla() {
  return (
    <section className="band" id="pandilla">
      <div className="wrap">
        <Reveal className="head row"><div><span className="eyebrow">La pandilla</span><h2>Cinco perros que no se adoptan: trabajan aquí.</h2></div><p className="hand">Te acompañan por toda la web</p></Reveal>
        <Reveal className="pandilla">
          {PANDILLA.map((p) => (
            <article key={p.id} className={`pcardi ${p.c}`}>
              <div className="art"><img className="ill" src={`/brand/perro-${p.id}.svg`} alt={`${p.n}, personaje de Pelos y Señales`} /></div>
              <b>{p.n}</b><small>{p.rol}</small><p>{p.txt}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
