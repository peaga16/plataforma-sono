"use client";

import { useRef, useState, useEffect } from "react";

interface Props { url: string; onWatched?: () => void; }

export function VideoPlayer({ url, onWatched }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watched, setWatched] = useState(false);
  const [pct, setPct] = useState(0);
  const [playing, setPlaying] = useState(false);
  const maxReachedRef = useRef(0); // máximo de progresso legítimo atingido

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Bloqueia avanço: se o usuário tentar pular, volta ao máximo legítimo
    function handleSeeking() {
      if (video!.currentTime > maxReachedRef.current + 1) {
        video!.currentTime = maxReachedRef.current;
      }
    }

    function handleTimeUpdate() {
      const current = video!.currentTime;
      const duration = video!.duration || 1;

      // Atualiza o máximo legítimo só se estiver avançando normalmente
      if (current > maxReachedRef.current) {
        maxReachedRef.current = current;
      }

      const progress = current / duration;
      setPct(Math.round(progress * 100));

      if (progress >= 0.9 && !watched) {
        setWatched(true);
        onWatched?.();
      }
    }

    function handleEnded() {
      if (!watched) { setWatched(true); onWatched?.(); }
    }

    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [watched, onWatched]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
  }

  return (
    <div>
      {/* Video container */}
      <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#000" }}>
        <video
          ref={videoRef}
          src={url}
          style={{ width: "100%", height: "100%", display: "block" }}
          playsInline
          // Remove controles nativos para evitar barra de progresso clicável
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {/* Overlay de play/pause customizado */}
        <div
          onClick={togglePlay}
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            background: playing ? "transparent" : "rgba(0,0,0,0.35)",
            transition: "background 0.2s",
          }}
        >
          {!playing && (
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: "12px solid transparent",
                borderBottom: "12px solid transparent",
                borderLeft: "20px solid #0D1B2A",
                marginLeft: 4,
              }} />
            </div>
          )}
        </div>

        {/* Barra de progresso visual (não clicável) */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "8px 12px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
        }}>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 100, height: 4 }}>
            <div style={{
              height: 4, borderRadius: 100, transition: "width 0.5s linear",
              background: watched ? "#4ADE80" : "#4A90D9",
              width: `${pct}%`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}>
              {pct}% assistido
            </span>
            {watched && (
              <span style={{ color: "#4ADE80", fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                ✓ Concluído
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status abaixo */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, background: "var(--off-white)", borderRadius: 100, height: 5, border: "1px solid var(--border)" }}>
          <div style={{
            height: 5, borderRadius: 100, transition: "width 0.5s",
            background: watched ? "var(--success)" : "#2B6CB0",
            width: `${pct}%`,
          }} />
        </div>
        <span style={{ fontSize: 12, color: watched ? "var(--success)" : "var(--muted)", fontFamily: "'DM Sans',sans-serif", width: 90, textAlign: "right", fontWeight: watched ? 600 : 400 }}>
          {watched ? "✓ Assistido" : `${pct}%`}
        </span>
      </div>

      {!watched && (
        <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>
          Assista pelo menos 90% do vídeo para liberar a conclusão do dia.
        </p>
      )}
    </div>
  );
}