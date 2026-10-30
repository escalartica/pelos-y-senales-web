"use client";
import { useState } from "react";

export default function AdminLogin({ configurado }: { configurado: boolean }) {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setErr("");
    const password = String(new FormData(e.currentTarget).get("password") || "");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) location.reload(); else { setErr(j.error || "No se pudo entrar."); setBusy(false); }
  };
  return (
    <form className="form adm-login" onSubmit={submit}>
      <span className="eyebrow">Solo equipo</span>
      <h1>Panel de administración</h1>
      {!configurado && <p className="adm-warn">El panel aún no tiene contraseña. Añade la variable <code>ADMIN_PASSWORD</code> en Vercel (mínimo 10 caracteres) y vuelve a desplegar.</p>}
      <div className="fld"><label htmlFor="adm-pass">Contraseña</label><input id="adm-pass" name="password" type="password" autoComplete="current-password" required /></div>
      <button className="btn" type="submit" disabled={busy || !configurado}>{busy ? "Entrando…" : "Entrar"}</button>
      {err && <p className="adm-err" role="alert">{err}</p>}
    </form>
  );
}
