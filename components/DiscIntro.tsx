"use client";
import { useLife } from "@/lib/store";
import { lifeIsSet } from "@/lib/orient";
export default function DiscIntro() {
  const { life } = useLife(); const set = lifeIsSet(life);
  return (
    <>
      <h1 style={{ fontSize: "clamp(36px,5vw,64px)" }}>{set ? "Tus matches, uno a uno." : "Uno a uno, sin prisa."}</h1>
      <p className="lead" style={{ marginTop: 14 }}>{set ? "Ordenados por lo que nos has contado. En cada tarjeta, por qué encaja y qué conviene preguntar. Un corazón lo guarda; una cruz lo deja pasar. La protectora valora cada caso." : "Pasa los perros de uno en uno. Un corazón los guarda en favoritos para leer su ficha con calma; una cruz los deja pasar. Guardar no reserva ni compromete: la protectora valora cada caso."}</p>
    </>
  );
}
