"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Props {
  url: string;
  onWatched?: () => void;
}

export function VideoPlayer({ url, onWatched }: Props) {
  const [played, setPlayed] = useState(0); // 0 a 1
  const [watched, setWatched] = useState(false);
  const playerRef = useRef<any>(null);

  // Considera assistido quando chegar a 90% do vídeo
  function handleProgress({ played }: { played: number }) {
    setPlayed(played);
    if (played >= 0.9 && !watched) {
      setWatched(true);
      onWatched?.();
    }
  }

  function handleEnded() {
    if (!watched) {
      setWatched(true);
      onWatched?.();
    }
  }

  return (
    <div>
      <div className="aspect-video rounded-3xl overflow-hidden bg-black">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          controls
          onProgress={handleProgress}
          onEnded={handleEnded}
          progressInterval={500}
        />
      </div>

      {/* Barra de progresso do vídeo */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 bg-zinc-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${watched ? "bg-green-500" : "bg-zinc-400"}`}
            style={{ width: `${Math.round(played * 100)}%` }}
          />
        </div>
        <span className="text-sm text-zinc-500 w-16 text-right">
          {watched ? "✅ Assistido" : `${Math.round(played * 100)}%`}
        </span>
      </div>

      {!watched && (
        <p className="text-xs text-zinc-400 mt-2">
          Assista pelo menos 90% do vídeo para liberar a conclusão.
        </p>
      )}
    </div>
  );
}
