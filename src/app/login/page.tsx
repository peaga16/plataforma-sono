"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [mode, setMode] = useState<"code" | "admin">("code");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Preenche o código automaticamente se vier do QR Code (?code=XXXX)
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  async function handleCodeLogin() {
    if (!code.trim()) {
      setError("Digite seu código de acesso.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      code: code.trim().toUpperCase(),
      callbackUrl: "/atleta",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Código inválido. Verifique e tente novamente.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  async function handleAdminLogin() {
    if (!adminEmail || !adminPassword) {
      setError("Preencha email e senha.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: adminEmail,
      password: adminPassword,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Credenciais inválidas.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        {/* LOGO / TÍTULO */}
        <div className="text-center mb-8">
          <span className="text-4xl">🌙</span>
          <h1 className="text-2xl font-bold mt-2">Plataforma do Sono</h1>
          <p className="text-zinc-500 text-sm mt-1">Higiene do sono para atletas</p>
        </div>

        {/* TABS */}
        <div className="flex bg-zinc-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode("code"); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              mode === "code" ? "bg-white shadow text-black" : "text-zinc-500"
            }`}
          >
            🏅 Atleta
          </button>
          <button
            onClick={() => { setMode("admin"); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              mode === "admin" ? "bg-white shadow text-black" : "text-zinc-500"
            }`}
          >
            🔬 Pesquisador
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl text-center">
            {error}
          </p>
        )}

        {/* LOGIN ATLETA POR CÓDIGO */}
        {mode === "code" && (
          <>
            <p className="text-zinc-600 text-sm mb-4 text-center">
              Digite o código recebido no seu QR Code
            </p>
            <input
              type="text"
              placeholder="Ex: ATL001"
              className="w-full border border-zinc-200 p-4 rounded-2xl mb-4 text-center text-2xl font-bold tracking-widest uppercase focus:outline-none focus:border-black"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleCodeLogin()}
              maxLength={10}
              autoFocus
            />
            <button
              onClick={handleCodeLogin}
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 transition hover:bg-zinc-800"
            >
              {loading ? "Entrando..." : "Acessar plataforma →"}
            </button>
          </>
        )}

        {/* LOGIN ADMIN */}
        {mode === "admin" && (
          <>
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-zinc-200 p-3 rounded-xl mb-3 focus:outline-none focus:border-black"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full border border-zinc-200 p-3 rounded-xl mb-4 focus:outline-none focus:border-black"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition hover:bg-zinc-800"
            >
              {loading ? "Entrando..." : "Entrar como pesquisador"}
            </button>
          </>
        )}

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
