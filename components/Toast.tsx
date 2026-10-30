"use client";
import { useEffect, useState } from "react";
export default function Toast() {
  const [msg, setMsg] = useState(""); const [on, setOn] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const h = (e: Event) => { setMsg((e as CustomEvent).detail); setOn(true); clearTimeout(t); t = setTimeout(() => setOn(false), 3600); };
    window.addEventListener("pys:toast", h); return () => { window.removeEventListener("pys:toast", h); clearTimeout(t); };
  }, []);
  return <div className={`toast${on ? " show" : ""}`} role="status" aria-live="polite">{msg}</div>;
}
