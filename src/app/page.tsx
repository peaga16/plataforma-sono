"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { AccessibilityMenu } from "@/components/accessibility-menu";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0D1B2A 0%, #1A2E45 50%, #0D1B2A 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Top bar */}
      <header style={{
        position: "relative", zIndex: 10,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, #2B6CB0, #4A90D9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🌙</div>
          <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15, letterSpacing: "0.01em" }}>
            {t("platformName")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AccessibilityMenu />
          <Link href="/login" style={{
            color: "rgba(248,249,252,0.6)",
            fontSize: 14, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            transition: "color 0.2s",
          }}>
            {t("accessLink")}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 60px", position: "relative", zIndex: 10,
      }}>
        <div style={{ maxWidth: 720, textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(43,108,176,0.2)", border: "1px solid rgba(43,108,176,0.4)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 40,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4A90D9", display: "inline-block" }} />
            <span style={{ color: "#4A90D9", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {t("researchProgram")}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            color: "#F8F9FC", fontSize: 64, lineHeight: 1.1,
            margin: "0 0 24px", fontWeight: 400,
          }}>
            {t("heroTitle")}<br />
            <em style={{ color: "#C9A84C" }}>{t("heroTitleHighlight")}</em>
          </h1>

          <p style={{
            color: "rgba(248,249,252,0.55)", fontSize: 18, lineHeight: 1.7,
            marginBottom: 48, fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          }}>
            {t("heroDescription")}<br />
            {t("heroSubDescription")}
          </p>

          <Link href="/login" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2B6CB0, #4A90D9)",
            color: "#fff", padding: "16px 40px",
            borderRadius: 8, fontSize: 15, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", textDecoration: "none",
            letterSpacing: "0.02em", transition: "opacity 0.2s",
            boxShadow: "0 8px 32px rgba(43,108,176,0.35)",
          }}>
            {t("ctaButton")}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 60px",
        color: "rgba(248,249,252,0.3)", fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        display: "flex", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span>{t("developedBy")} <a href="https://www.linkedin.com/in/pedro-andrade-38913b2a7/" target="_blank" rel="noopener noreferrer" style={{ color: "#4A90D9", textDecoration: "underline", cursor: "pointer" }}>Pedro Andrade</a></span>
          <span style={{ fontSize: 10, color: "rgba(248,249,252,0.2)" }}>{t("visitLinkedin")}</span>
        </div>
        <span>{t("research")}</span>
      </footer>
    </main>
  );
}
