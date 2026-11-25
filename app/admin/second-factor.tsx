"use client";
import { FormEvent, useState } from "react";

export default function SecondFactor({ email }: { email: string }) {
  const [code, setCode] = useState(""); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage("Verificando…");
    const response = await fetch("/api/admin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    if (response.ok) window.location.reload(); else { setCode(""); setMessage("Código incorreto. Tente novamente."); }
  };
  return <main className="admin-gate"><form className="factor-card" onSubmit={submit}>
    <span className="step-badge">2</span><p className="eyebrow">ETAPA 2 DE 2</p><h1>Código administrativo</h1><p>A conta <strong>{email}</strong> foi confirmada. Digite agora seu código exclusivo.</p>
    <label>Código de acesso<input type="password" inputMode="numeric" autoComplete="one-time-code" minLength={6} maxLength={64} value={code} onChange={(e) => setCode(e.target.value)} autoFocus required /></label>
    <button className="primary" type="submit">Acessar o painel →</button>{message && <small role="status">{message}</small>}
  </form></main>;
}
