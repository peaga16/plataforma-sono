"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { daysContent } from "@/content/days";
import { VideoPlayer } from "@/components/video-player";
import Link from "next/link";

export default function PublicDayPage() {
  const params = useParams();
  const dayParam = params.day as string;
  const dayNumber = Number(dayParam.replace("dia-", ""));
  const content = daysContent.find((item) => item.day === dayNumber);

  const [videoWatched, setVideoWatched] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [athleteName, setAthleteName] = useState("");

  async function handleComplete() {
    if (!code.trim()) { setErrorMsg("Digite seu código de atleta."); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/progress-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), day: dayNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao salvar progresso.");
      } else {
        setStatus("success");
        setAthleteName(data.athleteName || "");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erro de conexão. Tente novamente.");
    }
  }

  if (!content) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--off-white)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif" }}>Conteúdo não encontrado.</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>

      {/* Nav */}
      <header style={{
        background: "var(--navy)", height: 64, padding: "0 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg,#2B6CB0,#4A90D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌙</div>
          <span style={{ color: "#F8F9FC", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: 14 }}>Plataforma do Sono</span>
        </div>
        <span style={{
          background: "#EFF6FF", color: "#2B6CB0", border: "1px solid #BFDBFE",
          fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100,
          fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Dia {content.day} de 7
        </span>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "52px 48px" }}>

        {/* Day badge + title */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display',serif", fontSize: 42, color: "var(--navy)",
            margin: "0 0 12px", fontWeight: 400, lineHeight: 1.15,
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
            Recomendações
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
            Vídeo educativo
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 16 }}>
            {content.videoTitle}
          </p>
          <div style={{ background: "#fff", borderRadius: 12, padding: 4, border: "1px solid var(--border)" }}>
            <VideoPlayer url={content.videoUrl} onWatched={() => setVideoWatched(true)} />
          </div>
        </section>

        {/* Medal */}
        <section style={{
          background: "linear-gradient(135deg, var(--navy), var(--navy-light))",
          borderRadius: 12, padding: "28px 32px", marginBottom: 40,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 40 }}>{content.medal.split(" ")[0]}</div>
          <div>
            <p style={{ color: "rgba(248,249,252,0.5)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Medalha do dia</p>
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

        {/* Complete section */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "32px",
        }}>
          {status === "success" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏅</div>
              <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: "var(--navy)", margin: "0 0 8px", fontWeight: 400 }}>
                Dia {dayNumber} concluído!
              </h3>
              {athleteName && (
                <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, margin: "0 0 4px" }}>
                  Parabéns, <strong style={{ color: "var(--navy)" }}>{athleteName}</strong>!
                </p>
              )}
              <p style={{ color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, margin: 0 }}>
                Seu progresso foi registrado com sucesso. Até amanhã! 🌙
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "var(--navy)", margin: "0 0 8px", fontWeight: 400 }}>
                Marcar presença
              </h3>
              <p style={{ color: "var(--muted)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", margin: "0 0 24px" }}>
                {!videoWatched
                  ? "Assista ao vídeo acima e depois insira seu código para confirmar a presença."
                  : "Insira seu código de atleta para confirmar que assistiu ao conteúdo de hoje."}
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    type="text"
                    placeholder="Seu código (ex: ATL001)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleComplete()}
                    style={{
                      width: "100%", border: `1px solid ${errorMsg ? "#FCA5A5" : "var(--border)"}`,
                      borderRadius: 8, padding: "12px 16px", fontSize: 14,
                      fontFamily: "'DM Sans',sans-serif", outline: "none", color: "var(--navy)",
                      fontWeight: 600, letterSpacing: "0.05em", boxSizing: "border-box",
                    }}
                  />
                  {errorMsg && (
                    <p style={{ color: "#DC2626", fontSize: 12, fontFamily: "'DM Sans',sans-serif", margin: "6px 0 0" }}>{errorMsg}</p>
                  )}
                </div>
                <button
                  onClick={handleComplete}
                  disabled={status === "loading" || !videoWatched}
                  title={!videoWatched ? "Assista ao vídeo primeiro" : ""}
                  style={{
                    background: videoWatched ? "var(--navy)" : "#9CA3AF",
                    color: "#fff", border: "none", borderRadius: 8,
                    padding: "12px 28px", fontSize: 14, fontWeight: 500,
                    cursor: status === "loading" || !videoWatched ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    opacity: status === "loading" ? 0.7 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {status === "loading" ? "Salvando..." : "✓ Confirmar presença"}
                </button>
              </div>
              {!videoWatched && (
                <p style={{ color: "var(--muted)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 10 }}>
                  ⬆ Assista ao vídeo completo para habilitar a confirmação.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
