const QA: [string, string][] = [
  ["¿Adoptar cuesta dinero?", "Nosotros no cobramos nada. La protectora puede pedir una aportación que cubre vacunas, microchip y esterilización; te lo dirá antes de nada y suele estar entre 80 y 200 euros."],
  ["¿Quién decide si puedo adoptar?", "La protectora o el centro responsable del perro. Nosotros te lo presentamos y le pasamos tu consulta; ellos te entrevistan, valoran y firman el contrato."],
  ["¿Puedo conocerle antes de decidir?", "Sí. La protectora organiza la visita en su centro o en la casa de acogida. Muchas piden una entrevista previa y, si hay otro perro en casa, una presentación entre los dos."],
  ["¿Por qué una ficha pone «no evaluado»?", "Porque la protectora todavía no ha probado a ese perro con niños, perros o gatos. Preferimos decirlo a inventarlo; es una de las preguntas que puedes hacerles."],
  ["¿Qué hacéis con mis datos?", "Van a la protectora del perro, para que pueda contestarte. Nada más. Puedes pedir que los borren cuando quieras escribiendo a infopelosysenales@gmail.com."],
  ["¿Qué es el kit de bienvenida?", "Lo que recibe la familia en sus primeras semanas gracias a los colaboradores de su zona: una revisión veterinaria, una sesión con un educador, un baño y el primer saco de pienso. Lo montaremos ciudad a ciudad con los colaboradores que se sumen; todavía no está disponible."],
  ["¿Qué hacen las madrinas y los padrinos?", "Prestan su voz a un perro concreto: una frase en su ficha, una publicación al mes y, si pueden, una visita a la sesión. No cobran ni deciden quién adopta."],
  ["¿El proyecto es de una ciudad concreta?", "No. Es de toda España: lo abrimos protectora a protectora, empezando por APAAL, y sumamos ciudades con las que se van uniendo. El mapa, los perdidos y los avistados funcionan ya en cualquier punto del país."],
  ["He visto un perro suelto, ¿qué hago?", "No lo persigas ni lo llames a gritos: agáchate de lado, ignóralo y deja que venga. Publica dónde lo has visto en Perdidos y avistados aunque no lo cojas; si está herido o en carretera, llama al 112. Tienes todas las pautas en la sección «Si ves un perro suelto»."],
  ["¿Por qué hay entidades en el mapa que no colaboran con vosotros?", "Porque un perro no sabe quién lo recogió. Queremos que quien busque adoptar, acoger o ayudar encuentre a todas las que hacen ese trabajo en su ciudad. Las que colaboran tienen aquí sus perros y sus fotos; las demás, su enlace y su contacto. Cualquiera puede pedir aparecer o retirarse."],
  ["¿Y si el perro ya no está disponible?", "La ficha cambia de estado en cuanto la protectora nos avisa: en proceso, reservado o adoptado. Si ves una desfasada, dínoslo desde la propia ficha."],
];
export default function Faq() {
  return <div className="faq">{QA.map(([q, a]) => <details key={q}><summary>{q}<i>+</i></summary><div className="a"><div><p>{a}</p></div></div></details>)}</div>;
}
