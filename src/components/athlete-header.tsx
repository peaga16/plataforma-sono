"use client";

import Link from "next/link";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { useLanguage } from "@/components/providers/language-provider";

interface AthleteHeaderProps {
  userName: string;
}

export function AthleteHeader({ userName }: AthleteHeaderProps) {
  const { t } = useLanguage();
  return (
    <header style={{
      background: "var(--navy)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 48px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
        <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>{t("platformName")}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
          {userName}
        </span>
        <AccessibilityMenu variant="dark" />
        <Link href="/api/auth/signout" style={{
          background: "rgba(255,255,255,0.08)", color: "rgba(248,249,252,0.7)",
          padding: "6px 14px", borderRadius: 6, fontSize: 12,
          fontFamily: "'DM Sans',sans-serif", textDecoration: "none",
        }}>{t("signOut")}</Link>
      </div>
    </header>
  );
}
