"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface Props {
  userId: string;
  day: number;
  videoWatched: boolean;
}

export function CompleteButton({ userId, day, videoWatched }: Props) {
  const router = useRouter();
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const canComplete = videoWatched && scrolledToEnd;

  // Libera o scroll quando o botão entra na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrolledToEnd(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    if (buttonRef.current) observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  async function handleComplete() {
    if (!canComplete) return;
    setLoading(true);

    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, day }),
    });

    setLoading(false);

    if (response.ok) {
      alert("Dia concluído com sucesso! 🎉");
      router.push("/atleta");
    } else {
      alert("Erro ao registrar progresso. Tente novamente.");
    }
  }

  return (
    <div ref={buttonRef}>

      {/* Indicadores de requisitos */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
          videoWatched
            ? "bg-green-100 text-green-700"
            : "bg-zinc-100 text-zinc-500"
        }`}>
          {videoWatched ? "✅" : "⏳"} Vídeo assistido
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
          scrolledToEnd
            ? "bg-green-100 text-green-700"
            : "bg-zinc-100 text-zinc-500"
        }`}>
          {scrolledToEnd ? "✅" : "⏳"} Conteúdo lido
        </div>
      </div>

      {/* Mensagem orientativa */}
      {!canComplete && (
        <p className="text-zinc-400 text-sm mb-4">
          {!videoWatched && !scrolledToEnd
            ? "Assista ao vídeo completo e role até o fim da página para liberar."
            : !videoWatched
            ? "Assista ao vídeo completo para liberar."
            : "Continue rolando a página para liberar."}
        </p>
      )}

      {/* Botão */}
      <button
        onClick={handleComplete}
        disabled={!canComplete || loading}
        className={`w-full py-5 rounded-2xl text-lg font-semibold transition ${
          canComplete
            ? "bg-black text-white hover:bg-zinc-800 cursor-pointer"
            : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
        }`}
      >
        {loading
          ? "Registrando..."
          : canComplete
          ? "Concluí o conteúdo de hoje ✅"
          : "🔒 Complete os requisitos acima"}
      </button>

    </div>
  );
}
