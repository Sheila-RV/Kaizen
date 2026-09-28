// Funciones puras para calcular rachas, cumplimiento y estado de dias.
// Se usan en Hoy, Duelo y Calendario a partir de challenges/daily_logs/penalties ya cargados.
import type { Category, Challenge, DailyLog } from "./types";
import { CHALLENGE_START, addDays, isScheduled, todayISO } from "./challenge";

const LA_PAZ_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz" });

/** Fecha (YYYY-MM-DD) en que se creo un reto, en hora de Bolivia. */
export function createdDateISO(createdAt: string): string {
  return LA_PAZ_FMT.format(new Date(createdAt));
}

/** Si un reto aplica (activo, ya creado y programado) para una fecha dada. */
export function appliesOn(challenge: Challenge, date: string): boolean {
  return challenge.active && createdDateISO(challenge.created_at) <= date && isScheduled(challenge.days_of_week, date);
}

export type DayStatus = "future" | "none" | "done" | "partial" | "missed";

export interface DayStat {
  date: string;
  scheduled: number;
  completed: number;
  status: DayStatus;
}

/** Estado de un dia para un usuario: cuantos retos tenia programados y cuantos cumplio. */
export function dayStat(
  challenges: Challenge[],
  logs: DailyLog[],
  userId: string,
  date: string,
  today: string = todayISO(),
): DayStat {
  if (date > today) return { date, scheduled: 0, completed: 0, status: "future" };

  const scheduled = challenges.filter((c) => c.user_id === userId && appliesOn(c, date));
  if (scheduled.length === 0) return { date, scheduled: 0, completed: 0, status: "none" };

  const doneIds = new Set(
    logs.filter((l) => l.user_id === userId && l.log_date === date && l.completed).map((l) => l.challenge_id),
  );
  const completed = scheduled.filter((c) => doneIds.has(c.id)).length;

  const status: DayStatus =
    completed === scheduled.length ? "done" : date === today ? "partial" : "missed";

  return { date, scheduled: scheduled.length, completed, status };
}

/** Racha actual: dias consecutivos con todo cumplido, contando hacia atras. Hoy no rompe la racha si aun esta en curso. */
export function currentStreak(
  challenges: Challenge[],
  logs: DailyLog[],
  userId: string,
  today: string = todayISO(),
): number {
  let streak = 0;
  let date = today;
  if (dayStat(challenges, logs, userId, today, today).status !== "done") date = addDays(today, -1);

  while (date >= CHALLENGE_START) {
    const stat = dayStat(challenges, logs, userId, date, today);
    if (stat.status === "none") {
      date = addDays(date, -1);
      continue;
    }
    if (stat.status !== "done") break;
    streak++;
    date = addDays(date, -1);
  }
  return streak;
}

/** Mejor racha historica desde el inicio del reto hasta hoy. */
export function bestStreak(
  challenges: Challenge[],
  logs: DailyLog[],
  userId: string,
  today: string = todayISO(),
): number {
  let best = 0;
  let running = 0;
  for (let date = CHALLENGE_START; date <= today; date = addDays(date, 1)) {
    const stat = dayStat(challenges, logs, userId, date, today);
    if (stat.status === "none") continue;
    if (stat.status === "done") {
      running++;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }
  return best;
}

export interface CompletionStats {
  overallPct: number;
  byCategory: Record<Category, number>;
}

/** % de cumplimiento (por instancia reto-dia programada) desde el inicio del reto hasta hoy, total y por categoria. */
export function completionStats(
  challenges: Challenge[],
  logs: DailyLog[],
  userId: string,
  today: string = todayISO(),
): CompletionStats {
  const doneSet = new Set(
    logs.filter((l) => l.user_id === userId && l.completed).map((l) => `${l.challenge_id}_${l.log_date}`),
  );

  let scheduled = 0;
  let done = 0;
  const byCategoryCount: Record<Category, { scheduled: number; done: number }> = {
    mente: { scheduled: 0, done: 0 },
    fisico: { scheduled: 0, done: 0 },
    espiritual: { scheduled: 0, done: 0 },
  };

  for (const c of challenges.filter((c) => c.user_id === userId && c.active)) {
    const start = createdDateISO(c.created_at) > CHALLENGE_START ? createdDateISO(c.created_at) : CHALLENGE_START;
    if (start > today) continue;
    for (let date = start; date <= today; date = addDays(date, 1)) {
      if (!isScheduled(c.days_of_week, date)) continue;
      scheduled++;
      byCategoryCount[c.category].scheduled++;
      if (doneSet.has(`${c.id}_${date}`)) {
        done++;
        byCategoryCount[c.category].done++;
      }
    }
  }

  const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

  return {
    overallPct: pct(done, scheduled),
    byCategory: {
      mente: pct(byCategoryCount.mente.done, byCategoryCount.mente.scheduled),
      fisico: pct(byCategoryCount.fisico.done, byCategoryCount.fisico.scheduled),
      espiritual: pct(byCategoryCount.espiritual.done, byCategoryCount.espiritual.scheduled),
    },
  };
}
