import Link from "next/link";
import { getUserProgress } from "@/lib/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DayCards } from "./day-cards";
import { AthleteHeader } from "@/components/athlete-header";

const days = [1, 2, 3, 4, 5, 6, 7];

export default async function AthletePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const { progress, currentCycle } = await getUserProgress(userId);
  const completedDays = progress.filter((p) => p.completed).map((p) => p.day);
  const totalCompleted = completedDays.length;
  const pct = Math.round((totalCompleted / 7) * 100);

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>
      <AthleteHeader userName={session.user.name || session.user.email || "Atleta"} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 40, color: "var(--navy)", margin: "0 0 8px", fontWeight: 400 }}>
            Jornada do Sono
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
            Olá, <strong style={{ color: "var(--navy)" }}>{session.user.name || session.user.email}</strong>. Complete os 7 dias do programa.
          </p>
        </div>

        {/* Progress summary */}
        <div style={{
          background: "var(--navy)", borderRadius: 12, padding: "28px 36px",
          marginBottom: 40, display: "flex", alignItems: "center", gap: 40,
        }}>
          <div>
            <p style={{ color: "rgba(248,249,252,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Progresso geral</p>
            <p style={{ color: "#F8F9FC", fontSize: 36, fontFamily: "'DM Serif Display',serif", margin: 0 }}>{pct}%</p>
            <p style={{ color: "rgba(248,249,252,0.35)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", margin: "4px 0 0" }}>Ciclo {currentCycle}</p>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{totalCompleted} de 7 dias concluídos</span>
              {totalCompleted === 7 && <span style={{ color: "#C9A84C", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>🏆 Programa completo!</span>}
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 100, height: 8 }}>
              <div style={{ background: "linear-gradient(90deg,#2B6CB0,#4A90D9)", height: 8, borderRadius: 100, width: `${pct}%`, transition: "width 0.6s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {days.map((d) => (
              <div key={d} style={{
                width: 32, height: 32, borderRadius: 6, fontSize: 11,
                fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: completedDays.includes(d) ? "#2B6CB0" : "rgba(255,255,255,0.08)",
                color: completedDays.includes(d) ? "#fff" : "rgba(248,249,252,0.3)",
              }}>D{d}</div>
            ))}
          </div>
        </div>

        {/* Day grid */}
        <DayCards completedDays={completedDays} />
      </div>
    </main>
  );
}
