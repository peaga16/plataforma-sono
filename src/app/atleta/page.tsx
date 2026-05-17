import Link from "next/link";
import { getUserProgress, isDayUnlocked } from "@/lib/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const days = [1, 2, 3, 4, 5, 6, 7];

export default async function AthletePage() {
  const session = await auth();

  // 🔐 Redireciona se não estiver logado
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const progress = await getUserProgress(userId);

  const completedDays = progress
    .filter((p) => p.completed)
    .map((p) => p.day);

  return (
    <main className="min-h-screen bg-zinc-100 p-10">

      <h1 className="text-4xl font-bold mb-2">
        Jornada do Sono
      </h1>

      <p className="text-zinc-500 mb-10">
        Olá, {session.user.name || session.user.email}! Complete os 7 dias.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {days.map((day) => {

          const unlocked = isDayUnlocked(day, completedDays);
          const completed = completedDays.includes(day);

          return (
            <Link
              key={day}
              href={unlocked ? `/atleta/dia-${day}` : "#"}
              className={`
                rounded-3xl p-8 shadow-md transition
                ${unlocked
                  ? "bg-white hover:scale-[1.02] cursor-pointer"
                  : "bg-zinc-200 opacity-60 pointer-events-none"}
              `}
            >

              <h2 className="text-2xl font-bold mb-2">
                Dia {day}{" "}
                {completed ? "✅" : unlocked ? "" : "🔒"}
              </h2>

              <p className="text-zinc-500">
                {completed
                  ? "Concluído!"
                  : unlocked
                  ? "Conteúdo disponível"
                  : "Complete o dia anterior para desbloquear"}
              </p>

            </Link>
          );

        })}

      </div>

    </main>
  );
}
