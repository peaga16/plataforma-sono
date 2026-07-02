"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";

function LoginForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [mode, setMode] = useState<"code" | "admin">("code");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = searchParams.get("code");
    if (c) setCode(c.toUpperCase());
  }, [searchParams]);

  async function handleCodeLogin() {
    if (!code.trim()) { setError("Digite seu código de acesso."); return; }
    setError(""); setLoading(true);
    const result = await signIn("credentials", { code: code.trim().toUpperCase(), callbackUrl: "/atleta", redirect: false });
    setLoading(false);
    if (result?.error) setError("Código inválido. Verifique e tente novamente.");
    else if (result?.url) window.location.href = result.url;
  }

  async function handleAdminLogin() {
    if (!adminEmail || !adminPassword) { setError("Preencha email e senha."); return; }
    setError(""); setLoading(true);
    const result = await signIn("credentials", { email: adminEmail, password: adminPassword, callbackUrl: "/dashboard", redirect: false });
    setLoading(false);
    if (result?.error) setError("Credenciais inválidas.");
    else if (result?.url) window.location.href = result.url;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid var(--border)",
    borderRadius: 8, padding: "12px 16px", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    background: "#fff", color: "var(--navy)",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <Header variant="dark" title="Plataforma do Sono" />
      <main style={{
        minHeight: "calc(100vh - 64px)", display: "flex",
        background: "linear-gradient(160deg, #0D1B2A 0%, #1A2E45 100%)",
      }}>
        {/* Left panel */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px", position: "relative", overflow: "hidden",
        }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: "linear-gradient(135deg, #2B6CB0, #4A90D9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 40,
          }}>🌙</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", color: "#F8F9FC",
            fontSize: 44, lineHeight: 1.15, margin: "0 0 20px", fontWeight: 400,
          }}>
            Programa de<br />
            <em style={{ color: "#C9A84C" }}>Higiene do Sono</em>
          </h1>
          <p style={{ color: "rgba(248,249,252,0.5)", fontSize: 15, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            Sete dias de conteúdo educacional sobre recuperação, ritmo circadiano e desempenho esportivo.
          </p>

          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16 }}>
            {["Ambiente ideal para dormir", "Controle de telas e melatonina", "Ritmo circadiano e performance"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(43,108,176,0.2)", border: "1px solid rgba(43,108,176,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#4A90D9", fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                </div>
                <span style={{ color: "rgba(248,249,252,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 480, background: "#F8F9FC",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 48px",
      }}>
        <div style={{ width: "100%" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "var(--navy)", margin: "0 0 6px", fontWeight: 400 }}>
            Entrar na plataforma
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
            Selecione seu perfil de acesso
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--off-white)", borderRadius: 8, padding: 4, marginBottom: 28, border: "1px solid var(--border)" }}>
            {[
              { key: "code", label: "Atleta" },
              { key: "admin", label: "Pesquisador" },
            ].map((tab) => (
              <button key={tab.key} onClick={() => { setMode(tab.key as any); setError(""); }} style={{
                flex: 1, padding: "9px 0", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                background: mode === tab.key ? "#fff" : "transparent",
                color: mode === tab.key ? "var(--navy)" : "var(--muted)",
                boxShadow: mode === tab.key ? "0 1px 4px rgba(13,27,42,0.1)" : "none",
                transition: "all 0.15s",
              }}>{tab.label}</button>
            ))}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ color: "var(--danger)", fontSize: 13, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            </div>
          )}

          {mode === "code" && (
            <>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Código de acesso recebido no QR Code
              </p>
              <input
                type="text" placeholder="ATL001"
                style={{ ...inputStyle, textAlign: "center", fontSize: 28, fontWeight: 600, letterSpacing: "0.15em", marginBottom: 16, padding: "16px" }}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCodeLogin()}
                maxLength={10} autoFocus
              />
              <button onClick={handleCodeLogin} disabled={loading} style={{
                width: "100%", background: "linear-gradient(135deg, #1A2E45, #2B6CB0)",
                color: "#fff", border: "none", borderRadius: 8, padding: "14px",
                fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                letterSpacing: "0.02em",
              }}>
                {loading ? "Verificando..." : "Acessar plataforma →"}
              </button>
            </>
          )}

          {mode === "admin" && (
            <>
              <input type="email" placeholder="Email institucional" style={{ ...inputStyle, marginBottom: 12 }}
                value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              <input type="password" placeholder="Senha" style={{ ...inputStyle, marginBottom: 20 }}
                value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} />
              <button onClick={handleAdminLogin} disabled={loading} style={{
                width: "100%", background: "var(--navy)",
                color: "#fff", border: "none", borderRadius: 8, padding: "14px",
                fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              }}>
                {loading ? "Verificando..." : "Entrar como pesquisador"}
              </button>
            </>
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 32, fontFamily: "'DM Sans', sans-serif" }}>
            Plataforma de uso restrito — Pesquisa em Ciências do Esporte
          </p>
        </div>
      </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
