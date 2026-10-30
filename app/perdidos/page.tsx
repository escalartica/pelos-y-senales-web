import type { Metadata } from "next";
import Link from "next/link";
import Perdidos from "@/components/Perdidos";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Perdidos y avistados",
  description: "Publica la ficha y el cartel de tu perro perdido, o dinos dónde has visto un perro suelto. Dos mapas que se cruzan y qué hacer para que no salga huyendo.",
};

const TIPS: [string, string, boolean][] = [
  ["No lo persigas ni lo llames a gritos.", "Si vas hacia él o lo acorralas, corre, y correr es lo que lo lleva al tráfico. Cuando un perro lleva horas perdido, hasta su nombre repetido puede convertirse en la señal de salir huyendo. Quédate quieto y deja que te vea.", true],
  ["Hazte pequeño y mira a otro lado.", "Ponte de lado o en cuclillas, baja la mirada y no la fijes en él: mirar de frente y de pie es una amenaza. Haz un ruido suave (carraspea, chasquea la lengua) para que sepa que estás, y luego ignóralo. Que decida él.", false],
  ["Comida, paciencia y tiempo.", "Algo muy oloroso (salchicha, queso, jamón) lanzado hacia ti sin mirarlo, en trocitos, cada vez más cerca. Finge que comes tú. Puede tardar diez minutos o una hora: si está muy asustado, su olfato apenas funciona y la comida no siempre basta.", false],
  ["Lee lo que te dice su cuerpo.", "Cola entre las patas, orejas atrás, cuerpo rígido, labios tensos o dientes: dale espacio, no es el momento. Cola baja y suelta, olfatea, se acerca de lado: extiende la mano por debajo, palma arriba, y deja que la huela. No le toques la cabeza ni lo abraces.", false],
  ["Si está herido o muy nervioso, no lo cojas.", "Un perro con dolor muerde a quien quiere ayudarlo, aunque sea manso. Mantén la distancia, evita que se mueva y llama al 112 o a la policía local para que acuda el servicio de recogida con medios. Si hay niños, que no se acerquen.", true],
  ["En carretera, avisa antes de actuar.", "No cruces tras él ni lo hagas cruzar. Llama al 112 (en autovías y carreteras, Guardia Civil de Tráfico) con el punto kilométrico y el sentido. Si puedes parar sin peligro, señaliza y espera; muchos perros se quedan quietos cuando dejan de perseguirlos.", false],
  ["Si se deja: correa, chip y aviso.", "Una correa, un cinturón o una cuerda en lazo. Llévalo a un veterinario a leer el microchip: es gratis y en minutos tienen a su familia. Publícalo aquí en Avistados con foto y lugar, y comunícalo al ayuntamiento o centro municipal: un animal encontrado debe notificarse.", false],
  ["Si no se deja, no lo pierdas.", "Anota dónde, cuándo y hacia dónde iba, y publícalo. Deja agua y algo de comida en ese punto; los perros perdidos vuelven a los sitios donde han comido. Avisa a las protectoras de la zona del mapa: muchas tienen gente y trampas-jaula para los que no se dejan coger.", false],
  ["Si lo vieron abandonar, denuncia.", "Abandonar un animal es una infracción grave en España. Con matrícula, hora y lugar, puedes denunciarlo ante la policía local, la Guardia Civil (SEPRONA, 062) o la policía autonómica. Sin eso, el aviso al centro municipal ya ayuda a que no se repita.", true],
];

export default function PerdidosPage() {
  return (
    <main>
      <Perdidos />
      <section className="band crema curve" id="consejos" style={{ marginTop: 50 }}>
        <div className="wrap">
          <Reveal className="head"><span className="eyebrow">Si ves un perro suelto</span><h2>Lo primero es que no salga corriendo.</h2><p className="lead" style={{ marginTop: 12 }}>Un perro perdido no razona: está en modo huida, y lo que lo mata es la carretera, no el hambre. Casi todo lo que haríamos por instinto (llamarlo, ir hacia él, cogerlo) lo empuja a correr. Esto es lo que funciona.</p></Reveal>
          <Reveal className="tips">
            {TIPS.map(([h, p, no], i) => <div key={h} className={`tip${no ? " no" : ""}`}><span className="k">{String(i + 1).padStart(2, "0")}</span><h3>{h}</h3><p>{p}{i === 7 && <> Lo tienes en el <Link href="/mapa">mapa</Link>.</>}</p></div>)}
          </Reveal>
          <p className="small" style={{ fontSize: 12, color: "var(--ink-60)", marginTop: 18 }}>Pautas basadas en guías de recuperación de animales perdidos (Missing Animal Response Network / Maddie&apos;s Fund, Missing Pet Partnership) y en recomendaciones de Consumer Eroski sobre perros abandonados en España. No sustituyen a un profesional: ante un perro herido o agresivo, llama al 112.</p>
        </div>
      </section>
    </main>
  );
}
