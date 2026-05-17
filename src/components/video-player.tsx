"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Props { url: string; onWatched?: () => void; }

export function VideoPlayer({ url, onWatched }: Props) {
  const [played, setPlayed] = useState(0);
  const [watched, setWatched] = useState(false);
  const playerRef = useRef<any>(null);

  function handleProgress({ played }: { played: number }) {
    setPlayed(played);
    if (played >= 0.9 && !watched) { setWatched(true); onWatched?.(); }
  }

  function handleEnded() {
    if (!watched) { setWatched(true); onWatched?.(); }
  }

  return (
    <div>
      <div style={{ aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#000" }}>
        <ReactPlayer ref={playerRef} url={url} width="100%" height="100%" controls
          onProgress={handleProgress} onEnded={handleEnded} progressInterval={500} />
      </div>

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, background: "var(--off-white)", borderRadius: 100, height: 5, border: "1px solid var(--border)" }}>
          <div style={{
            height: 5, borderRadius: 100, transition: "width 0.3s",
            background: watched ? "var(--success)" : "#2B6CB0",
            width: `${Math.round(played * 100)}%`,
          }} />
        </div>
        <span style={{ fontSize: 12, color: watched ? "var(--success)" : "var(--muted)", fontFamily: "'DM Sans',sans-serif", width: 90, textAlign: "right", fontWeight: watched ? 600 : 400 }}>
          {watched ? "✓ Assistido" : `${Math.round(played * 100)}%`}
        </span>
      </div>

      {!watched && (
        <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>
          Assista pelo menos 90% do vídeo para liberar a conclusão.
        </p>
      )}
    </div>
  );
}
