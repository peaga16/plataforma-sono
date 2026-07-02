"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./providers/language-provider";

interface AccessibilityMenuProps {
  variant?: "dark" | "light";
}

export function AccessibilityMenu({ variant = "dark" }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const isDark = variant === "dark";

  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Botão de acessibilidade */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={t("accessibility")}
        style={{
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(13,27,42,0.08)",
          border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--border)",
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          color: isDark ? "rgba(248,249,252,0.7)" : "var(--navy)",
          fontSize: 18,
          padding: 0,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = isDark 
            ? "rgba(255,255,255,0.15)" 
            : "rgba(13,27,42,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = isDark 
            ? "rgba(255,255,255,0.1)" 
            : "rgba(13,27,42,0.08)";
        }}
      >
        ♿
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: isDark ? "#0D1B2A" : "#F8F9FC",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: isDark 
              ? "0 20px 60px rgba(0,0,0,0.5)" 
              : "0 4px 12px rgba(0,0,0,0.08)",
            minWidth: 240,
            overflow: "hidden",
            zIndex: 1000,
            animation: "slideDown 0.2s ease-out",
          }}
        >
          {/* Header do menu */}
          <div
            style={{
              padding: "16px",
              borderBottom: isDark 
                ? "1px solid rgba(255,255,255,0.08)" 
                : "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: isDark ? "#F8F9FC" : "var(--navy)",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t("accessibility")}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: isDark ? "rgba(248,249,252,0.5)" : "var(--muted)",
                cursor: "pointer",
                fontSize: 18,
                padding: 0,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={t("close")}
            >
              ✕
            </button>
          </div>

          {/* Seção de idioma */}
          <div
            style={{
              padding: "12px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: isDark ? "rgba(248,249,252,0.6)" : "var(--muted)",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t("language")}
            </p>

            {/* Botões de idioma */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <LanguageButton
                isActive={language === "pt-BR"}
                onClick={() => {
                  setLanguage("pt-BR");
                  setIsOpen(false);
                }}
                label={t("portuguese")}
                isDark={isDark}
              />
              <LanguageButton
                isActive={language === "en"}
                onClick={() => {
                  setLanguage("en");
                  setIsOpen(false);
                }}
                label={t("english")}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Seção de acessibilidade visual (pronto para expansão) */}
          <div
            style={{
              padding: "12px",
              borderTop: isDark 
                ? "1px solid rgba(255,255,255,0.08)" 
                : "1px solid var(--border)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: isDark ? "rgba(248,249,252,0.6)" : "var(--muted)",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Visual
            </p>
            <p
              style={{
                margin: 0,
                color: isDark ? "rgba(248,249,252,0.4)" : "var(--muted)",
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Opções adicionais em breve
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface LanguageButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  isDark: boolean;
}

function LanguageButton({ isActive, onClick, label, isDark }: LanguageButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "8px 12px",
        background: isActive 
          ? isDark ? "rgba(74,144,217,0.2)" : "rgba(74,144,217,0.1)"
          : isDark ? "rgba(255,255,255,0.05)" : "rgba(13,27,42,0.05)",
        border: isActive ? "1px solid #4A90D9" : isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border)",
        borderRadius: 8,
        color: isActive ? "#4A90D9" : isDark ? "rgba(248,249,252,0.7)" : "var(--navy)",
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        transition: "all 0.2s",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.target as HTMLButtonElement).style.background = isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(13,27,42,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.target as HTMLButtonElement).style.background = isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(13,27,42,0.05)";
        }
      }}
    >
      {label}
      {isActive && (
        <span style={{ marginLeft: 8, fontSize: 16 }}>✓</span>
      )}
    </button>
  );
}
