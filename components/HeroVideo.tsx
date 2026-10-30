import Image from "next/image";
/** Imagen del héroe: retrato real de la primera sesión (LASA). */
export default function HeroVideo() {
  return <Image src="/img/lasa/4e6a6699.jpg" alt="" fill priority sizes="(max-width: 900px) 90vw, 45vw" style={{ objectFit: "cover" }} />;
}
