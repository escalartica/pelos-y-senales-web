"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLife } from "@/lib/store";
import type { Life } from "@/lib/orient";

type Conv = Life["conv"][number];
const STEPS = [
  { key: "casa", h: "¿Dónde vives?", p: "No hay respuesta mala. Un piso con paseos largos vale tanto como un patio.", opts: [["piso", "En un piso", "Con paseos, claro"], ["patio", "Casa con patio", "O jardín, o terraza grande"]] },
  { key: "tiempo", h: "¿Cuánto tiempo tienes para pasear?", p: "Sé sincero: un perro muy activo con poco paseo es el primer motivo de devolución.", opts: [["poco", "Poco", "Tres paseos cortos al día"], ["normal", "Normal", "Una hora larga repartida"], ["mucho", "Mucho", "Campo, carreras, fines de semana fuera"]] },
  { key: "conv", h: "¿Quién más vive en casa?", p: "Marca todo lo que corresponda. Si un perro no está evaluado con alguno, te lo diremos.", opts: [["ninos", "Niños", "Pequeños o no tanto"], ["perros", "Otros perros", ""], ["gatos", "Gatos", ""], ["nadie", "Nadie más", "Solo yo (o nosotros)"]], multi: true },
  { key: "exp", h: "¿Has tenido perro antes?", p: "Para señalarte los que piden más de lo habitual, no para descartarte.", opts: [["primero", "Es mi primer perro", "Y me hace ilusión"], ["veterano", "Ya he tenido", "Sé lo que es"]] },
] as const;

export default function MatchWizard() {
  const { life, setLife } = useLife(); const router = useRouter();
  const [step, setStep] = useState(0); const [nadie, setNadie] = useState(false);
  const st = STEPS[step]; const last = step === STEPS.length - 1;
  const isOn = (v: string) => st.key === "conv" ? (v === "nadie" ? nadie && life.conv.length === 0 : life.conv.includes(v as Conv)) : life[st.key as "casa" | "tiempo" | "exp"] === v;
  const pick = (v: string) => {
    if (st.key === "conv") { if (v === "nadie") { setNadie(true); setLife({ ...life, conv: [] }); } else { setNadie(false); const c = life.conv.includes(v as Conv) ? life.conv.filter((x) => x !== v) : [...life.conv, v as Conv]; setLife({ ...life, conv: c }); } return; }
    const k = st.key as "casa" | "tiempo" | "exp"; const cur = life[k];
    setLife({ ...life, [k]: cur === v ? null : v });
    if (cur !== v && !last) setTimeout(() => setStep((s) => s + 1), 260);
  };
  return (
    <div className="mwrap" style={{ padding: 0, maxWidth: "none" }}>
      <span className="eyebrow">Haz match · 4 preguntas</span>
      <div className="mprog">{STEPS.map((s, i) => <i key={s.key} className={i <= step ? "d" : ""} />)}</div>
      <section className="mstep on" key={st.key}>
        <h1>{st.h}</h1><p className="small">{st.p}</p>
        <div className="mopts">{st.opts.map(([v, b, sm]) => <button key={v} type="button" className="mopt" aria-pressed={isOn(v)} onClick={() => pick(v)}><b>{b}</b>{sm && <small>{sm}</small>}</button>)}</div>
      </section>
      <div className="mnav">
        <button className="skip" type="button" style={{ visibility: step ? "visible" : "hidden" }} onClick={() => setStep((s) => s - 1)}>← Atrás</button>
        <button className="btn" type="button" onClick={() => (last ? router.push("/descubrir") : setStep((s) => s + 1))}>{last ? "Ver mis matches" : "Siguiente"} <span className="ic">→</span></button>
      </div>
      <div className="mguide"><img src="/brand/perro-carlino.svg" alt="" /><span>El Carlino, el del match, te acompaña. Lo que nos cuentes se queda en tu navegador y solo sirve para ordenar los perros y avisarte de lo importante. La protectora valora cada caso.</span></div>
    </div>
  );
}
