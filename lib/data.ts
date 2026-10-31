// Datos reales del proyecto: protectoras que colaboran y perros publicados con su autorización.

export type Conv = "si" | "no" | "desc"; // desc = no evaluado
export type Estado = "disponible" | "proceso" | "reservado" | "adoptado";
export type Tam = "pequeño" | "mediano" | "grande";
export type EdadGrupo = "cachorro" | "adulto" | "senior";
export type Act = "baja" | "media" | "alta";

export interface Protectora {
  id: string;
  n: string;
  ciudad: string;
  prov: string;
  tel: string;
  mail: string;
  horas: string;
  desc: string;
  /** Coordenadas (aprox.) para el mapa */
  lat?: number;
  lon?: number;
  web?: string;
  ig?: string;
}

export interface Dog {
  id: string;
  n: string;
  edadTxt: string;
  edad: EdadGrupo;
  tam: Tam;
  sexo: "macho" | "hembra";
  /** Peso aproximado, como lo da la protectora */
  peso?: string;
  /** La protectora también busca casa de acogida para él */
  acogida?: boolean;
  act: Act;
  /** Foto real (ruta en /public/img) o ilustración de marca (/public/brand) */
  photo?: string;
  /** Más fotos reales de la sesión (galería de la ficha) */
  photos?: { src: string; cap: string }[];
  /** Nombre y datos provisionales hasta que la protectora los confirme */
  provisional?: boolean;
  art?: "galgo" | "carlino" | "teckel" | "scottie" | "caniche";
  flip?: boolean;
  /** color de fondo de la ilustración */
  c: "m" | "c" | "l";
  prot: string;
  raza: string;
  rasgos: string[];
  conv: { ninos: Conv; perros: Conv; gatos: Conv };
  esp: boolean;
  espTxt?: string;
  estado: Estado;
  upd: string;
  desc: string;
  pers: string;
  nec: string[];
  hist: string;
}

export const EST: Record<Estado, string> = {
  disponible: "Busca familia",
  proceso: "Conociendo a su familia",
  reservado: "Su familia está en camino",
  adoptado: "Ya está en casa",
};
export const CONV_TXT: Record<Conv, string> = { si: "Sí", no: "No", desc: "No evaluado" };
export const ACT_TXT: Record<Act, string> = { baja: "Tranquilo", media: "Normal", alta: "Muy activo" };

/**
 * Protectoras que colaboran con Pelos y Señales. Solo datos reales y públicos, confirmados con cada entidad.
 * Un campo vacío ("") no se muestra en la web.
 */
export const PROT: Record<string, Protectora> = {
  apaal: { id: "apaal", n: "APAAL · Asociación Protectora de Animales en Lora del Río", ciudad: "Lora del Río", prov: "Sevilla", tel: "", mail: "", horas: "", lat: 37.66, lon: -5.53, web: "https://www.facebook.com/p/Asociaci%C3%B3n-Protectora-de-Animales-en-Lora-del-R%C3%ADo-APAAL-100064893781842/", desc: "Asociación Protectora de Animales en Lora del Río (Sevilla). La primera que nos abrió sus puertas: aquí hicimos nuestra primera sesión de fotos." },
  lasa: { id: "lasa", n: "LASA · La Sonrisa Animal", ciudad: "Brenes", prov: "Sevilla", tel: "", mail: "adopcion.lasanimal@gmail.com", horas: "", lat: 37.549, lon: -5.871, web: "https://www.facebook.com/asociacionlasanimal/", desc: "Asociación La Sonrisa Animal (LASA), de Brenes (Sevilla). Rescata, cuida y busca familia a perros abandonados." },
  fulanita: { id: "fulanita", n: "Fulanita Dog", ciudad: "", prov: "", tel: "", mail: "", horas: "", desc: "Protectora que colabora con Pelos y Señales. Sus perros participaron en nuestra primera sesión de fotos." },
};

export const DOGS: Dog[] = [
  { id: "barry", n: "Barry", edadTxt: "4 años", edad: "adulto", tam: "grande", peso: "30 kg", sexo: "macho", act: "media", photo: "/img/lasa/4e6a6285.jpg", c: "m", prot: "apaal", raza: "Mestizo de labrador", rasgos: ["Noble", "Muy cariñoso", "Adora a los niños"], conv: { ninos: "si", perros: "si", gatos: "desc" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Barry es noble de los pies a la cabeza: un grandullón de 30 kilos que, cuando te coge confianza, ya no se separa de ti. Adora a los niños y se lleva genial con otros perros.",
    pers: "Muy cariñoso y con energía media-alta: disfruta de los paseos largos y del juego. Con las personas que no conoce necesita su tiempo; cuando confía, sale la joya de perro que es.",
    nec: ["Un hogar tranquilo, con experiencia en perros miedosos y paciencia para ganarse su confianza.", "Paseos largos y juego a diario.", "Con gatos todavía no está probado."],
    hist: "Llegó a APAAL en octubre de 2022 junto a Aria; los dos desconfiaban mucho de las personas. Con paciencia y cariño ha ido descubriendo que puede fiarse. Está muy sano y busca adopción o casa de acogida." },
  { id: "aria", n: "Aria", edadTxt: "4 años", edad: "adulto", tam: "mediano", peso: "25 kg", sexo: "hembra", act: "media", photo: "/img/lasa/4e6a6308.jpg", c: "l", prot: "apaal", raza: "Mestiza", rasgos: ["Noble", "Dulce", "Adora a los niños"], conv: { ninos: "si", perros: "si", gatos: "si" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Aria es una perrita 10. Noble, dulce y tranquila, se lleva genial con perros y con gatos y adora a los niños. Basta con mirar esa sonrisa.",
    pers: "Es suave y nada problemática: prefiere un rincón tranquilo y una mano amable antes que el jaleo. Con las personas que no conoce va despacio; cuando coge confianza, se entrega por completo.",
    nec: ["Un hogar sencillo y tranquilo, con experiencia en perros miedosos y paciencia para ganarse su confianza.", "Paseos diarios a ritmo normal: tiene energía media.", "Convive bien con perros y gatos: una casa con otros animales le puede venir genial."],
    hist: "Llegó a APAAL en octubre de 2022 junto a Barry; los dos desconfiaban mucho de las personas. Con paciencia ha ido aprendiendo que el cariño es de verdad. Está sana y busca adopción o casa de acogida." },
  { id: "toby", n: "Toby", edadTxt: "4 años", edad: "adulto", tam: "mediano", peso: "20 kg", sexo: "macho", act: "media", photo: "/img/lasa/4e6a6392.jpg", c: "c", prot: "fulanita", raza: "Mestizo", rasgos: ["Simpático", "Pegadizo", "Lametones infinitos"], conv: { ninos: "si", perros: "si", gatos: "si" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Toby es simpatía con patas. Se lleva bien con todo el mundo, personas, perros y gatos, y lo que más le gusta es estar pegadito a ti.",
    pers: "Busca el contacto todo el rato: se arrima, apoya la cabeza y reparte lametones sin parar. Tiene energía media, así que disfruta igual de un buen paseo que de una tarde de sofá contigo.",
    nec: ["Una familia que disfrute de paseos bonitos y de mucho cariño.", "Compañía: es un perro de estar contigo.", "Está sanísimo."],
    hist: "Llegó a la protectora en julio de 2022. Desde entonces ha conquistado a todos los voluntarios. Busca adopción o casa de acogida." },
  { id: "simba", n: "Simba", edadTxt: "3 años y medio", edad: "adulto", tam: "mediano", peso: "20 kg", sexo: "macho", act: "media", photo: "/img/lasa/4e6a6507.jpg", c: "c", prot: "fulanita", raza: "Mestizo", rasgos: ["Juguetón", "Zalamero", "Le encantan los niños"], conv: { ninos: "si", perros: "si", gatos: "no" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Simba es juguetón y zalamero. Le encantan los niños y disfruta de cada segundo de paseo con su humana.",
    pers: "Es un perro cariñoso que busca mimos y juego. Tiene energía media: le gusta salir a pasear y luego descansar cerca de los suyos. Se lleva bien con perros pequeños, pero no puede vivir con gatos.",
    nec: ["Una familia con ganas de darle la oportunidad que se merece.", "Un hogar sin gatos.", "Está sano."],
    hist: "Llegó a la protectora el 20 de enero de 2023 y lleva tres años en un chenil. Es un ángel esperando su casa. Busca adopción o casa de acogida." },
  { id: "luffy", n: "Luffy", edadTxt: "3 años", edad: "adulto", tam: "mediano", peso: "20 kg", sexo: "macho", act: "media", photo: "/img/lasa/4e6a6567.jpg", c: "l", prot: "lasa", raza: "Mestizo de american staffordshire", rasgos: ["Muy vivo", "Cariñoso", "Adora a las personas"], conv: { ninos: "si", perros: "si", gatos: "si" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Luffy es un perro precioso, muy vivo y cariñoso. Adora a las personas y es feliz con una caricia o un achuchón.",
    pers: "Se lleva bien con los niños, genial con otros perros y puede vivir con gatos. En la calle es activo y disfruta de los paseos y los parques; en casa se convierte en un peluche.",
    nec: ["Un hogar activo en los paseos y los parques, y tranquilo en casa.", "Revisiones veterinarias periódicas: de cachorro pasó la leishmania y ahora la tiene latente.", "Mucho cariño: es lo que más le gusta."],
    hist: "Llegó a La Sonrisa Animal el 1 de octubre de 2023. Busca adopción o casa de acogida." },
  { id: "toyota", n: "Toyota", edadTxt: "3 años y medio", edad: "adulto", tam: "mediano", peso: "25 kg", sexo: "hembra", act: "alta", photo: "/img/lasa/4e6a6645.jpg", c: "m", prot: "lasa", raza: "Pastor belga malinois", rasgos: ["Juguetona", "Inteligente", "Elegante"], conv: { ninos: "desc", perros: "si", gatos: "si" }, esp: false, estado: "disponible", acogida: true, upd: "30 oct 2026",
    desc: "Toyota es juguetona, inteligente y de una belleza y elegancia sin igual. Se lleva muy bien con otros perros y puede vivir con gatos.",
    pers: "Es activa, como buena malinois: le encanta jugar, aprender y correr. Con ejercicio y atención es una compañera brillante.",
    nec: ["Un hogar con personas activas o con espacio para correr.", "Juego y paseos largos cada día.", "Está sana."],
    hist: "Llegó a La Sonrisa Animal el 20 de junio de 2023. Busca adopción o casa de acogida." },
  { id: "matcha", n: "Matcha", edadTxt: "10 años", edad: "senior", tam: "pequeño", peso: "8 kg", sexo: "hembra", act: "baja", photo: "/img/lasa/matcha.jpg", c: "c", prot: "lasa", raza: "Mestiza", rasgos: ["Tranquila", "Tímida", "Buena con perros"], conv: { ninos: "desc", perros: "si", gatos: "desc" }, esp: false, estado: "disponible", acogida: true, upd: "31 oct 2026",
    desc: "Matcha es una perrita pequeña de 10 años, sana y tranquila. Se lleva bien con otros perros; con gatos aún no se ha probado.",
    pers: "Es muy miedosa: creció casi sin contacto con personas y lo desconocido todavía la bloquea. Los voluntarios de La Sonrisa Animal la acarician y trabajan con ella cada día para que vaya soltando ese miedo, y poco a poco se deja.",
    nec: ["Una casa tranquila y una familia paciente que respete su ritmo.", "Tiempo y cariño para ganarse su confianza.", "Está sana."],
    hist: "Fue rescatada de un caso de síndrome de Noé junto a más de 20 perros. Nació en octubre de 2016 y ahora está en La Sonrisa Animal, buscando adopción o casa de acogida." },
  { id: "soja", n: "Soja", edadTxt: "8 años", edad: "adulto", tam: "pequeño", peso: "10 kg", sexo: "hembra", act: "baja", photo: "/img/lasa/soja-negra.jpg", c: "m", prot: "lasa", raza: "Mestiza", rasgos: ["Una joya", "Tímida", "Buena con perros"], conv: { ninos: "desc", perros: "si", gatos: "desc" }, esp: false, estado: "disponible", acogida: true, upd: "31 oct 2026",
    desc: "Soja es una perrita pequeña de 8 años, sana y una joya de perra. Se lleva bien con otros perros; con gatos aún no se ha probado.",
    pers: "Era muy miedosa porque apenas tuvo contacto con personas, pero los voluntarios de La Sonrisa Animal han conseguido que ese miedo vaya desapareciendo. Cuando coge confianza, se deja querer.",
    nec: ["Una casa tranquila y una familia paciente que respete su ritmo.", "Tiempo y cariño para que siga ganando seguridad.", "Está sana."],
    hist: "Fue rescatada de un caso de síndrome de Noé junto a otros 20 perros. Nació en octubre de 2018 y ahora está en La Sonrisa Animal, buscando adopción o casa de acogida." },
  { id: "tokio", n: "Tokio", edadTxt: "6 años y medio", edad: "adulto", tam: "grande", peso: "25 kg", sexo: "hembra", act: "media", photo: "/img/lasa/4e6a6686.jpg", c: "l", prot: "lasa", raza: "Mestiza de labrador", rasgos: ["Cariñosísima", "Adora a los niños", "Sociable"], conv: { ninos: "si", perros: "si", gatos: "si" }, esp: false, estado: "disponible", acogida: true, upd: "31 oct 2026",
    desc: "Tokio es cariñosísima con los niños y con las personas mayores, se lleva de maravilla con otros perros y puede vivir con gatos.",
    pers: "Es increíble que, después de todo lo que ha pasado, tenga esa pasión por las personas. Busca el contacto, la caricia y la compañía, y lo da todo a quien se la ofrece.",
    nec: ["Una familia que quiera compañía de verdad: ella pone el cariño.", "Le van bien las casas con niños, mayores u otros animales.", "Le acaban de hacer analíticas y está sanísima."],
    hist: "Pasó su vida en una terraza, entre basura, hasta que la rescataron. Nació en marzo de 2020 y ahora está en La Sonrisa Animal, buscando adopción o casa de acogida." },
  { id: "mirin", n: "Mirin", edadTxt: "2 años", edad: "adulto", tam: "pequeño", peso: "9 kg", sexo: "hembra", act: "media", photo: "/img/lasa/mirin.jpg", c: "c", prot: "lasa", raza: "Mestiza", rasgos: ["Dulce", "Tímida", "Buena con perros"], conv: { ninos: "desc", perros: "si", gatos: "desc" }, esp: false, estado: "disponible", acogida: true, upd: "31 oct 2026",
    desc: "Mirin es una perrita pequeña y dulce de 2 años. Está sana y se lleva bien con otros perros; con gatos aún no se ha probado.",
    pers: "Es miedosa porque apenas tuvo contacto con personas, pero el cariño de los voluntarios de La Sonrisa Animal está haciendo milagros con ella. Cada día confía un poco más.",
    nec: ["Una casa tranquila y una familia paciente que respete su ritmo.", "Tiempo y cariño para seguir ganando confianza.", "Está sana."],
    hist: "Fue rescatada de un caso de síndrome de Noé junto a otros 20 perros. Llegó a La Sonrisa Animal en septiembre de 2025 y busca adopción o casa de acogida." },
];

export const PROVS = Array.from(new Set(DOGS.map((d) => PROT[d.prot]?.prov).filter(Boolean) as string[])).sort();
export const getDog = (id: string) => DOGS.find((d) => d.id === id);
export const dogsOf = (protId: string) => DOGS.filter((d) => d.prot === protId);

/** Protectora de un perro, con un valor vacío si se ha borrado para que nada se rompa. */
export const protOf = (prot: Record<string, Protectora>, id: string): Protectora => prot[id] ?? { id, n: "Protectora", ciudad: "", prov: "", tel: "", mail: "", horas: "", desc: "" };
