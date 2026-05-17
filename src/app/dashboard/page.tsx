"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Athlete {
  id: string; name: string; code: string | null; email: string;
  progresses: { day: number; completed: boolean }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkNames, setBulkNames] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ name: string; code: string }[] | null>(null);
  const [tab, setTab] = useState<"athletes" | "register">("athletes");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") { router.replace("/login"); return; }
    fetchAthletes();
  }, [status, session]);

  async function fetchAthletes() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    setAthletes(await res.json());
    setLoading(false);
  }

  async function handleBulkRegister() {
    const names = bulkNames.split("\n").map((n) => n.trim()).filter(Boolean).map((name) => ({ name }));
    if (!names.length) return;
    setBulkLoading(true); setBulkResult(null);
    const res = await fetch("/api/batch-register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ athletes: names }) });
    const data = await res.json();
    setBulkLoading(false);
    if (res.ok) { setBulkResult(data.created); setBulkNames(""); fetchAthletes(); setTab("athletes"); }
    else alert(data.error || "Erro ao cadastrar.");
  }

  function copyLink(code: string) {
    const url = `${baseUrl}/login?code=${code}`;
    navigator.clipboard.writeText(url);
    alert(`Link copiado!\n${url}`);
  }

  function qrUrl(code: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${baseUrl}/login?code=${code}`)}`;
  }

  const athleteList = athletes.filter((u) => u.code?.startsWith("ATL"));
  const totalAthletes = athleteList.length;
  const totalCompleted = athleteList.filter((u) => u.progresses.filter((p) => p.completed).length === 7).length;
  const avgProgress = totalAthletes
    ? Math.round(athleteList.reduce((sum, u) => sum + u.progresses.filter((p) => p.completed).length, 0) / totalAthletes / 7 * 100)
    : 0;

  const navStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
    background: active ? "#fff" : "transparent",
    color: active ? "var(--navy)" : "rgba(248,249,252,0.5)",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.15s",
  });

  if (status === "loading" || loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--off-white)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>

      {/* Nav */}
      <header style={{
        background: "var(--navy)", height: 64, padding: "0 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
            <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>Plataforma do Sono</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Painel do Pesquisador</span>
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: 4, gap: 2 }}>
          <button onClick={() => setTab("athletes")} style={navStyle(tab === "athletes")}>Atletas</button>
          <button onClick={() => setTab("register")} style={navStyle(tab === "register")}>Cadastrar</button>
        </div>
        <Link href="/api/auth/signout" style={{ color: "rgba(248,249,252,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>Sair</Link>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Atletas cadastrados", value: totalAthletes, icon: "👤" },
            { label: "Programa completo", value: totalCompleted, icon: "🏆" },
            { label: "Progresso médio", value: `${avgProgress}%`, icon: "📊" },
          ].map((card) => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</span>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
              </div>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, color: "var(--navy)", margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ATHLETES TAB */}
        {tab === "athletes" && (
          <>
            {bulkResult && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
                <p style={{ color: "#166534", fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: "0 0 12px", fontWeight: 500 }}>
                  ✅ {bulkResult.length} atleta(s) cadastrado(s) com sucesso
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {bulkResult.map((a) => (
                    <span key={a.code} style={{ background: "#fff", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#166534" }}>
                      {a.name} — <strong>{a.code}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: "var(--navy)", margin: 0, fontWeight: 400 }}>
                Atletas ({totalAthletes})
              </h2>
              <button onClick={() => setTab("register")} style={{
                background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}>+ Cadastrar atletas</button>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--off-white)" }}>
                    {["Atleta", "Código", "Progresso", "Dias", "QR Code"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {athleteList.map((user, i) => {
                    const completed = user.progresses.filter((p) => p.completed).map((p) => p.day);
                    const pct = Math.round((completed.length / 7) * 100);
                    return (
                      <tr key={user.id} style={{ borderBottom: i < athleteList.length - 1 ? "1px solid var(--off-white)" : "none" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, color: "var(--navy)", margin: 0 }}>{user.name}</p>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "var(--navy)", background: "var(--off-white)", padding: "4px 10px", borderRadius: 6 }}>{user.code}</span>
                        </td>
                        <td style={{ padding: "16px 20px", minWidth: 160 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, background: "var(--off-white)", borderRadius: 100, height: 6 }}>
                              <div style={{ background: pct === 100 ? "var(--success)" : "#2B6CB0", height: 6, borderRadius: 100, width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", width: 32 }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1,2,3,4,5,6,7].map((d) => (
                              <div key={d} style={{
                                width: 22, height: 22, borderRadius: 4, fontSize: 10, fontFamily: "'DM Sans',sans-serif",
                                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
                                background: completed.includes(d) ? "#2B6CB0" : "var(--off-white)",
                                color: completed.includes(d) ? "#fff" : "var(--muted)",
                              }}>{d}</div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={qrUrl(user.code!)} alt="QR" style={{ width: 40, height: 40, borderRadius: 4, border: "1px solid var(--border)" }} />
                            <button onClick={() => copyLink(user.code!)} style={{ fontSize: 11, color: "#2B6CB0", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "underline" }}>Copiar link</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {totalAthletes === 0 && (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Nenhum atleta cadastrado. <button onClick={() => setTab("register")} style={{ color: "#2B6CB0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Cadastrar agora →</button></p>
                </div>
              )}
            </div>
          </>
        )}

        {/* REGISTER TAB */}
        {tab === "register" && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: "var(--navy)", margin: "0 0 8px", fontWeight: 400 }}>
              Cadastrar atletas
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", marginBottom: 28 }}>
              Cole um nome por linha. Os códigos de acesso são gerados automaticamente em sequência.
            </p>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Nomes dos atletas (um por linha)
              </label>
              <textarea
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", resize: "none", outline: "none", color: "var(--navy)", lineHeight: 1.8 }}
                rows={8} placeholder={"João Silva\nMaria Oliveira\nPedro Santos\n..."}
                value={bulkNames} onChange={(e) => setBulkNames(e.target.value)}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>
                  {bulkNames.split("\n").filter((n) => n.trim()).length} atleta(s) para cadastrar
                </span>
                <button onClick={handleBulkRegister} disabled={bulkLoading || !bulkNames.trim()} style={{
                  background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8,
                  padding: "12px 24px", fontSize: 13, fontWeight: 500, cursor: bulkLoading || !bulkNames.trim() ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans',sans-serif", opacity: bulkLoading || !bulkNames.trim() ? 0.5 : 1,
                }}>
                  {bulkLoading ? "Cadastrando..." : "Gerar códigos de acesso"}
                </button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", marginTop: 16, lineHeight: 1.6 }}>
              Os códigos seguem o padrão <strong>ATL001</strong>, <strong>ATL002</strong>... e são únicos por atleta. O QR Code de cada atleta é gerado automaticamente na aba Atletas.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
