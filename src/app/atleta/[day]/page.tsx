"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { daysContent } from "@/content/days";
import { VideoPlayer } from "@/components/video-player";
import { CompleteButton } from "@/components/complete-button";

export default function DayPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  if (!session?.user) return null;

  const day = params.day as string;
  const dayNumber = Number(day.replace("dia-", ""));
  const content = daysContent.find((item) => item.day === dayNumber);

  if (!content) {
    return <main className="p-10">Conteúdo não encontrado.</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12">

        {/* HEADER */}
        <div className="mb-10">
          <span className="bg-black text-white px-4 py-2 rounded-full text-sm">
            Dia {content.day}
          </span>
          <h1 className="text-4xl font-bold mt-6 mb-4">{content.title}</h1>
          <p className="text-2xl text-zinc-700 leading-relaxed">{content.phrase}</p>
        </div>

        {/* INFOGRÁFICO */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Recomendações</h2>
          <div className="space-y-4">
            {content.infographic.map((item, index) => (
              <div key={index} className="bg-zinc-100 rounded-2xl p-5 text-lg">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* VÍDEO */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Vídeo educativo</h2>
          <VideoPlayer
            url={content.videoUrl}
            onWatched={() => setVideoWatched(true)}
          />
        </div>

        {/* MEDALHA */}
        <div className="border-t pt-10">
          <div className="bg-zinc-100 rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Medalha desbloqueada</h3>
            <p className="text-3xl font-semibold">{content.medal}</p>
          </div>

          {content.finalMessage && (
            <div className="bg-green-100 border border-green-300 rounded-3xl p-8 mb-8">
              <p className="text-xl font-medium">{content.finalMessage}</p>
            </div>
          )}

          {/* BOTÃO COM REQUISITOS */}
          <CompleteButton
            userId={session.user.id}
            day={content.day}
            videoWatched={videoWatched}
          />
        </div>

      </div>
    </main>
  );
}
