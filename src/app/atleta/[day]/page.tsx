"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { daysContent } from "@/content/days";
import { VideoPlayer } from "@/components/video-player";
import { CompleteButton } from "@/components/complete-button";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";

export default function DayPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [videoWatched, setVideoWatched] = useState(false);
  const [, setRenderTrigger] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Re-renderizar quando o idioma muda
  useEffect(() => {
    setRenderTrigger(prev => prev + 1);
  }, [language]);

  if (status === "loading") {
    return (
      <main style={{ minHeight: "100vh", background: "var(--off-white)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>Carregando...</p>
      </main>
    );
  }

  if (!session?.user) return null;

  const day = params.day as string;
  const dayNumber = Number(day.replace("dia-", ""));
  const content = daysContent.find((item) => item.day === dayNumber);

  if (!content) return <main style={{ padding: 48 }}>Conteúdo não encontrado.</main>;

  return (
    <main key={`day-${language}`} style={{ minHeight: "100vh", background: "var(--off-white)" }}>

      {/* Nav */}
      <header style={{
        background: "var(--navy)", height: 64, padding: "0 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <Link href="/atleta" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 18 }}>←</span>
          <span style={{ color: "rgba(248,249,252,0.6)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{t("viewBackJourney")}</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
          <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>{t("platformName")}</span>
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 48px" }}>

        {/* Day badge + title */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            background: "#EFF6FF", color: "#2B6CB0", border: "1px solid #BFDBFE",
            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100,
            fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {t("dayBadge", { day: content.day })}
          </span>
          <h1 style={{
            fontFamily: "'DM Serif Display',serif", fontSize: 42, color: "var(--navy)",
            margin: "16px 0 12px", fontWeight: 400, lineHeight: 1.15,
          }}>{content.title}</h1>
          <p style={{
            fontSize: 18, color: "var(--muted)", lineHeight: 1.65,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 300,
            borderLeft: "3px solid #2B6CB0", paddingLeft: 20,
          }}>{content.phrase}</p>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: 40 }} />

        {/* Infographic */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "var(--navy)", margin: "0 0 20px", fontWeight: 400 }}>
            {t("recommendationsTitle")}
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {content.infographic.map((item, i) => {
              const isPositive = item.startsWith("✔") || item.startsWith("🕒");
              return (
                <div key={i} style={{
                  background: "#fff", border: `1px solid ${isPositive ? "#BFDBFE" : "var(--border)"}`,
                  borderLeft: `3px solid ${isPositive ? "#2B6CB0" : "#9CA3AF"}`,
                  borderRadius: 8, padding: "14px 20px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 16 }}>{item.split(" ")[0]}</span>
                  <span style={{ fontSize: 14, color: "var(--navy)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
                    {item.slice(item.indexOf(" ") + 1)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Video */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "var(--navy)", margin: "0 0 20px", fontWeight: 400 }}>
            {t("educationalVideo")}
          </h2>
          <div style={{ background: "#fff", borderRadius: 12, padding: 4, border: "1px solid var(--border)" }}>
            <VideoPlayer url={content.videoUrl} onWatched={() => setVideoWatched(true)} />
          </div>
        </section>

        {/* Medal */}
        <section style={{
          background: "linear-gradient(135deg, var(--navy), var(--navy-light))",
          borderRadius: 12, padding: "28px 32px", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 40 }}>{content.medal.split(" ")[0]}</div>
          <div>
            <p style={{ color: "rgba(248,249,252,0.5)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("dayMedal")}</p>
            <p style={{ color: "#F8F9FC", fontSize: 18, fontFamily: "'DM Serif Display',serif", margin: 0 }}>
              {content.medal.slice(content.medal.indexOf(" ") + 1)}
            </p>
          </div>
        </section>

        {content.finalMessage && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "16px 20px", marginBottom: 32 }}>
            <p style={{ color: "#166534", fontSize: 14, fontFamily: "'DM Sans',sans-serif", margin: 0, lineHeight: 1.6 }}>
              🎉 {content.finalMessage}
            </p>
          </div>
        )}

        <CompleteButton userId={session.user.id} day={content.day} videoWatched={videoWatched} />
      </div>
    </main>
  );
}