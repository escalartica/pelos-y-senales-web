import Link from "next/link";
export default function Zonas() {
  return (
    <div>
      <span className="eyebrow">Por zonas · próximamente</span>
      <h2>Los perros de tu barrio, en tu veterinario. En cualquier ciudad.</h2>
      <p className="lead" style={{ color: "rgba(22,22,22,.72)" }}>El proyecto es de toda España y se monta ciudad a ciudad. Con cada protectora que se suma, repartiremos placas con un QR en clínicas veterinarias, tiendas de alimentación y peluquerías caninas de su zona: escaneas en el mostrador y ves quién te espera cerca de casa.</p>
      <p className="hand" style={{ marginTop: 14 }}>¿Tienes una clínica, una tienda o una peluquería?</p>
      <div style={{ marginTop: 18 }}><Link className="btn" href="/colabora#contacto">Quiero una placa para mi mostrador <span className="ic">→</span></Link></div>
    </div>
  );
}
