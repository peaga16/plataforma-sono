export const PROGRAM_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export type ProgramDay = (typeof PROGRAM_DAYS)[number];

export interface ProgressSnapshot {
  cycle: number;
  day: number;
  completed: boolean;
}

export function isProgramDay(day: number): day is ProgramDay {
  return PROGRAM_DAYS.includes(day as ProgramDay);
}

export function normalizeCompletedDays(days: number[]) {
  return [...new Set(days.filter(isProgramDay))].sort((a, b) => a - b);
}

export function isCycleComplete(completedDays: number[]) {
  const completed = new Set(normalizeCompletedDays(completedDays));
  return PROGRAM_DAYS.every((day) => completed.has(day));
}

export function getCurrentCycleFromProgress(progresses: ProgressSnapshot[]): number {
  const validProgress = progresses.filter(
    (progress) => Number.isInteger(progress.cycle) && progress.cycle > 0
  );

  if (!validProgress.length) return 1;

  // Considera qualquer registro do ciclo mais recente, mesmo que completed=false.
  const latestCycle = Math.max(...validProgress.map((progress) => progress.cycle));
  const completedDays = validProgress
    .filter((progress) => progress.cycle === latestCycle && progress.completed)
    .map((progress) => progress.day);

  return isCycleComplete(completedDays) ? latestCycle + 1 : latestCycle;
}

export function isDayUnlocked(day: number, completedDays: number[]) {
  if (!isProgramDay(day)) return false;
  if (day === 1) return true;

  const completed = new Set(normalizeCompletedDays(completedDays));

  // Exige todos os dias anteriores do ciclo atual, não apenas o imediatamente anterior.
  return PROGRAM_DAYS.slice(0, day - 1).every((previousDay) => completed.has(previousDay));
}
