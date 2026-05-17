"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Athlete {
  id: string;
  name: string;
  code: string | null;
  email: string;
  progresses: { day: number; completed: boolean }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  // Cadastro em lote
  const [bulkNames, setBulkNames] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ name: string; code: string }[] | null>(null);

  // QR code base URL (altere para seu domínio em produção)
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.replace("/login");
      return;
    }
    fetchAthletes();
  }, [status, session]);

  async function fetchAthletes() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    setAthletes(data);
    setLoading(false);
  }

  async function handleBulkRegister() {
    const names = bulkNames
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    if (names.length === 0) return;

    setBulkLoading(true);
    setBulkResult(null);

    const res = await fetch("/api/batch-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athletes: names }),
    });

    const data = await res.json();
    setBulkLoading(false);

    if (res.ok) {
      setBulkResult(data.created);
      setBulkNames("");
      fetchAthletes();
    } else {
      alert(data.error || "Erro ao cadastrar.");
    }
  }

  function copyCode(code: string) {
    const url = `${baseUrl}/login?code=${code}`;
    navigator.clipboard.writeText(url);
    alert(`Link copiado!\n${url}`);
  }

  function generateQRUrl(code: string) {
    const loginUrl = encodeURIComponent(`${baseUrl}/login?code=${code}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${loginUrl}`;
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">Dashboard do Pesquisador</h1>
        <p className="text-zinc-500 mb-10">Gerencie os atletas e acompanhe o progresso.</p>

        {/* ── CADASTRO EM LOTE ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow p-8 mb-10">
          <h2 className="text-2xl font-bold mb-2">Cadastrar atletas</h2>
          <p className="text-zinc-500 text-sm mb-4">
            Cole um nome por linha. Os códigos de acesso são gerados automaticamente.
          </p>
          <textarea
            className="w-full border border-zinc-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-black"
            rows={6}
            placeholder={"João Silva\nMaria Oliveira\nPedro Santos\n..."}
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
          />
          <button
            onClick={handleBulkRegister}
            disabled={bulkLoading || !bulkNames.trim()}
            className="mt-4 bg-black text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-40 transition hover:bg-zinc-800"
          >
            {bulkLoading ? "Cadastrando..." : "Gerar códigos de acesso"}
          </button>

          {/* RESULTADO DO LOTE */}
          {bulkResult && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-semibold text-green-800 mb-3">
                ✅ {bulkResult.length} atleta(s) cadastrado(s)!
              </p>
              <div className="space-y-2">
                {bulkResult.map((a) => (
                  <div
                    key={a.code}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm"
                  >
                    <span className="font-medium">{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg tracking-wider bg-zinc-100 px-3 py-1 rounded-lg">
                        {a.code}
                      </span>
                      <button
                        onClick={() => copyCode(a.code)}
                        className="text-xs bg-black text-white px-3 py-1 rounded-lg hover:bg-zinc-700 transition"
                      >
                        Copiar link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── LISTA DE ATLETAS ─────────────────────────────────────── */}
        <h2 className="text-2xl font-bold mb-4">
          Atletas cadastrados ({athletes.filter((u) => u.code?.startsWith("ATL")).length})
        </h2>

        <div className="space-y-4">
          {athletes
            .filter((u) => u.code?.startsWith("ATL"))
            .map((user) => {
              const completed = user.progresses
                .filter((p) => p.completed)
                .map((p) => p.day);
              const pct = Math.round((completed.length / 7) * 100);

              return (
                <div
                  key={user.id}
                  className="bg-white p-6 rounded-3xl shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* INFO */}
                    <div>
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      <p className="text-zinc-400 text-sm mt-0.5">
                        Código:{" "}
                        <span className="font-mono font-bold text-black tracking-wider">
                          {user.code}
                        </span>
                      </p>
                      <p className="text-zinc-500 text-sm mt-1">
                        Progresso: {pct}% — {completed.length}/7 dias
                      </p>
                    </div>

                    {/* QR CODE */}
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={generateQRUrl(user.code!)}
                        alt={`QR Code ${user.name}`}
                        className="w-20 h-20 rounded-xl border"
                      />
                      <button
                        onClick={() => copyCode(user.code!)}
                        className="text-xs text-zinc-500 hover:text-black underline"
                      >
                        Copiar link
                      </button>
                    </div>
                  </div>

                  {/* BARRA */}
                  <div className="w-full bg-zinc-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* DIAS */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <span
                        key={day}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          completed.includes(day)
                            ? "bg-green-500 text-white"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        Dia {day} {completed.includes(day) ? "✅" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

          {athletes.filter((u) => u.code?.startsWith("ATL")).length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center text-zinc-400 shadow">
              Nenhum atleta cadastrado ainda. Use o formulário acima para começar.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
