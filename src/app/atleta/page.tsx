import Link from "next/link";
import { getUserProgress, isDayUnlocked } from "@/lib/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { daysContent } from "@/content/days";

const days = [1, 2, 3, 4, 5, 6, 7];

export default async function AthletePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const progress = await getUserProgress(userId);
  const completedDays = progress.filter((p) => p.completed).map((p) => p.day);
  const totalCompleted = completedDays.length;
  const pct = Math.round((totalCompleted / 7) * 100);

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>

      {/* Top nav */}
      <header style={{
        background: "var(--navy)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
          <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>Plataforma do Sono</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
            {session.user.name || session.user.email}
          </span>
          <Link href="/api/auth/signout" style={{
            background: "rgba(255,255,255,0.08)", color: "rgba(248,249,252,0.7)",
            padding: "6px 14px", borderRadius: 6, fontSize: 12,
            fontFamily: "'DM Sans',sans-serif", textDecoration: "none",
          }}>Sair</Link>
        </div>
      </header>

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {days.map((day) => {
            const unlocked = isDayUnlocked(day, completedDays);
            const completed = completedDays.includes(day);
            const content = daysContent.find((d) => d.day === day);

            return (
              <Link
                key={day}
                href={unlocked ? `/atleta/dia-${day}` : "#"}
                style={{
                  display: "block", textDecoration: "none",
                  background: "#fff",
                  border: `1px solid ${completed ? "#BFDBFE" : unlocked ? "var(--border)" : "var(--border)"}`,
                  borderRadius: 12, padding: "28px",
                  opacity: !unlocked ? 0.5 : 1,
                  pointerEvents: !unlocked ? "none" : "auto",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (unlocked) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(13,27,42,0.1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {completed && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: "#2B6CB0", color: "#fff", fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "4px 12px", borderBottomLeftRadius: 8, letterSpacing: "0.06em" }}>
                    CONCLUÍDO
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{
                    background: completed ? "#EFF6FF" : unlocked ? "var(--off-white)" : "var(--off-white)",
                    color: completed ? "#2B6CB0" : "var(--muted)",
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 100,
                    fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>Dia {day}</span>
                  <span style={{ fontSize: 20 }}>
                    {completed ? "✅" : unlocked ? "" : "🔒"}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "var(--navy)",
                  margin: "0 0 8px", fontWeight: 400, lineHeight: 1.3,
                }}>{content?.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", margin: 0, lineHeight: 1.5 }}>
                  {completed ? "Conteúdo concluído com sucesso." : unlocked ? "Conteúdo disponível — clique para acessar." : "Complete o dia anterior para desbloquear."}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
