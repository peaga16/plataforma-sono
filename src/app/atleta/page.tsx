import { getUserProgress, getDayUnlockStatus } from "@/lib/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DayCards } from "./day-cards";
import { AthleteHeader } from "@/components/athlete-header";
import { AthleteProgressSummary } from "@/components/athlete-progress-summary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AthletePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const { progress, currentCycle, previousCycleDay7 } = await getUserProgress(userId);
  const completedDays = progress.filter((p) => p.completed).map((p) => p.day);
  const totalCompleted = completedDays.length;
  const userName = session.user.name || session.user.email || "Atleta";

  const daysStatus = [1, 2, 3, 4, 5, 6, 7].map((day) => {
    const status = getDayUnlockStatus(day, progress, previousCycleDay7);
    return {
      day,
      completed: completedDays.includes(day),
      unlocked: status.unlocked,
      availableAt: status.availableAt ? status.availableAt.toISOString() : null,
    };
  });

  return (
    <main style={{ minHeight: "100vh", background: "var(--off-white)" }}>
      <AthleteHeader userName={userName} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px" }}>
        <AthleteProgressSummary
          userName={userName}
          totalCompleted={totalCompleted}
          currentCycle={currentCycle}
        />

        <DayCards completedDays={completedDays} />
      </div>
    </main>
  );
}
