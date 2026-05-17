"use client";

import Link from "next/link";
import { daysContent } from "@/content/days";
import { isDayUnlocked } from "@/lib/progress";

interface DayCardsProps {
  completedDays: number[];
}

export function DayCards({ completedDays }: DayCardsProps) {
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
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
              border: `1px solid ${completed ? "#BFDBFE" : "var(--border)"}`,
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
                background: completed ? "#EFF6FF" : "var(--off-white)",
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
  );
}
