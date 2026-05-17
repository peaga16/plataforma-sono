"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (response.ok) {
      router.push("/login");
    } else {
      const data = await response.json();
      setError(data.error || "Erro ao criar conta.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100">

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-2">
          Criar conta
        </h1>

        <p className="text-zinc-500 mb-8">
          Cadastre-se para acessar a plataforma.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Nome"
          className="w-full border p-3 rounded-xl mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-xl mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border p-3 rounded-xl mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* CORRIGIDO: era bg-black text-black — texto invisível! */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-black font-medium underline">
            Entrar
          </Link>
        </p>

      </div>

    </main>
  );
}
