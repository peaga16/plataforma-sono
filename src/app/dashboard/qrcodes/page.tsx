"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { daysContent } from "@/content/days";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export default function QRCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setBaseUrl(window.location.origin);
  }, [status, session, router]);

  function qrUrl(dayUrl: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dayUrl)}&margin=10`;
  }

  function handlePrint() {
    window.print();
  }

  if (status === "loading" || !baseUrl) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--off-white)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>{t("loading")}</p>
      </main>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen {
          .print-page { margin-bottom: 40px; }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>

        {/* Nav - hidden on print */}
        <header className="no-print" style={{
          background: "var(--navy)", height: 64, padding: "0 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <span style={{ color: "rgba(248,249,252,0.5)", fontSize: 18 }}>←</span>
              <span style={{ color: "rgba(248,249,252,0.6)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{t("backToDashboard")}</span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
              <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>{t("platformName")}</span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            style={{
              background: "#2B6CB0", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {t("printAllQRCodes")}
          </button>
        </header>

        {/* Info banner - hidden on print */}
        <div className="no-print" style={{
          maxWidth: 900, margin: "32px auto 0", padding: "0 48px",
        }}>
          <div style={{
            background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10,
            padding: "16px 24px", display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <div>
              <p style={{ color: "#1E40AF", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                {t("qrCodesHowToTitle")}
              </p>
              <p style={{ color: "#3B82F6", fontFamily: "'DM Sans',sans-serif", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {t("qrCodesInfo")}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code pages */}
        <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 48px 48px" }}>
          {daysContent.map((day) => {
            const dayUrl = `${baseUrl}/dia/dia-${day.day}`;
            return (
              <div
                key={day.day}
                className="print-page"
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "48px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌙</div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 16, color: "var(--navy)" }}>{t("platformName")}</span>
                </div>

                {/* Day badge */}
                <span style={{
                  background: "#EFF6FF", color: "#2B6CB0", border: "1px solid #BFDBFE",
                  fontSize: 13, fontWeight: 700, padding: "6px 18px", borderRadius: 100,
                  fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: 16,
                }}>
                  {t("dayBadge", { day: day.day })}
                </span>

                {/* Title */}
                <h2 style={{
                  fontFamily: "'DM Serif Display',serif", fontSize: 32, color: "var(--navy)",
                  margin: "0 0 8px", fontWeight: 400, lineHeight: 1.2, maxWidth: 500,
                }}>
                  {day.title}
                </h2>
                <p style={{
                  color: "var(--muted)", fontSize: 15, fontFamily: "'DM Sans',sans-serif",
                  margin: "0 0 40px", lineHeight: 1.5, maxWidth: 420,
                }}>
                  {day.phrase}
                </p>

                {/* QR Code */}
                <div style={{
                  background: "#fff", border: "3px solid var(--navy)",
                  borderRadius: 16, padding: 12, marginBottom: 28,
                  boxShadow: "0 4px 20px rgba(13,27,42,0.1)",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl(dayUrl)}
                    alt={`QR Code ${t("dayBadge", { day: day.day.toString() })}`}
                    style={{ width: 240, height: 240, display: "block" }}
                  />
                </div>

                {/* Instructions */}
                <div style={{
                  background: "var(--off-white)", borderRadius: 10, padding: "20px 32px",
                  maxWidth: 420, marginBottom: 20,
                }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "var(--navy)", fontWeight: 600, margin: "0 0 8px" }}>
                    {t("howToUse")}
                  </p>
                  <ol style={{ textAlign: "left", paddingLeft: 18, margin: 0 }}>
                    <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "var(--muted)", marginBottom: 4, lineHeight: 1.5 }}>
                      {t("scanQRCode")}
                    </li>
                    <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "var(--muted)", marginBottom: 4, lineHeight: 1.5 }}>
                      {t("watchVideo")}
                    </li>
                    <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                      {t("enterCodeConfirm").replace("ATL001", "ATL001")}
                    </li>
                  </ol>
                </div>

                {/* URL */}
                <p style={{
                  fontFamily: "monospace", fontSize: 11, color: "var(--muted)",
                  background: "var(--off-white)", padding: "6px 14px", borderRadius: 6,
                  border: "1px solid var(--border)",
                }}>
                  {dayUrl}
                </p>

                {/* Medal hint */}
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9CA3AF",
                  margin: "16px 0 0",
                }}>
                  {t("medalLabel")} {day.medal}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
