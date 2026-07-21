"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";

interface Props {
  userId: string;
  day: number;
  videoWatched: boolean;
}

export function CompleteButton({ userId, day, videoWatched }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const canComplete = videoWatched && scrolledToEnd;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setScrolledToEnd(true); observer.disconnect(); } },
      { threshold: 0.8 }
    );
    if (buttonRef.current) observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  async function handleComplete() {
    if (!canComplete) return;
    setLoading(true);
    const response = await fetch("/api/progress", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, day }),
    });
    const data = await response.json().catch(() => null);
    setLoading(false);
    if (response.ok) {
      alert(t("dayCompletedSuccess"));
      router.push("/atleta");
    } else {
      alert(t("dayCompleteError"));
    }
  }

  return (
    <div ref={buttonRef} style={{ borderTop: "1px solid var(--border)", paddingTop: 32, marginTop: 8 }}>

      {/* Status pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { done: videoWatched, label: t("videoWatchedStatus") },
          { done: scrolledToEnd, label: t("contentReadStatus") },
        ].map((req) => (
          <div key={req.label} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 100, fontSize: 13,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
            background: req.done ? "#EFF6FF" : "var(--off-white)",
            color: req.done ? "#2B6CB0" : "var(--muted)",
            border: `1px solid ${req.done ? "#BFDBFE" : "var(--border)"}`,
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 12 }}>{req.done ? "✓" : "○"}</span>
            {req.label}
          </div>
        ))}
      </div>

      {!canComplete && (
        <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 16, lineHeight: 1.6 }}>
          {!videoWatched && !scrolledToEnd
            ? t("watchFullVideoAndScroll")
            : !videoWatched ? t("watchVideoToUnlock")
              : t("scrollToUnlock")}
        </p>
      )}

      <button
        onClick={handleComplete}
        disabled={!canComplete || loading}
        style={{
          width: "100%", border: "none", borderRadius: 8, padding: "16px",
          fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
          cursor: canComplete && !loading ? "pointer" : "not-allowed",
          background: canComplete ? "linear-gradient(135deg, #1A2E45, #2B6CB0)" : "var(--off-white)",
          color: canComplete ? "#fff" : "var(--muted)",
          transition: "all 0.2s", letterSpacing: "0.01em",
          boxShadow: canComplete ? "0 4px 16px rgba(43,108,176,0.3)" : "none",
        }}
      >
        {loading ? t("registeringDay") : canComplete ? t("completeDayButton") : t("completeRequirementsLocked")}
      </button>
    </div>
  );
}
