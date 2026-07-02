"use client";

import Link from "next/link";
import { AccessibilityMenu } from "@/components/accessibility-menu";

interface HeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  style?: React.CSSProperties;
  variant?: "dark" | "light";
}

export function Header({ 
  title = "Plataforma do Sono", 
  rightContent,
  style = {},
  variant = "dark"
}: HeaderProps) {
  const isDark = variant === "dark";

  return (
    <header
      style={{
        background: isDark ? "var(--navy)" : "#F8F9FC",
        borderBottom: isDark 
          ? "1px solid rgba(255,255,255,0.08)" 
          : "1px solid var(--border)",
        padding: "0 48px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {/* Logo e título */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "linear-gradient(135deg,#2B6CB0,#4A90D9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          🌙
        </div>
        <span
          style={{
            color: isDark ? "#F8F9FC" : "var(--navy)",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {title}
        </span>
      </div>

      {/* Conteúdo direito + Menu acessibilidade */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {rightContent}
        <AccessibilityMenu variant={variant} />
      </div>
    </header>
  );
}
