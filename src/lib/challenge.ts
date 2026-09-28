// Fechas del reto. Todo se calcula en hora de Bolivia (UTC-4, sin horario de verano).
export const CHALLENGE_START = "2026-09-23";
export const CHALLENGE_END = "2026-12-31";
export const TOTAL_DAYS = 100;
export const PENALTY_BS = 50;
export const TIME_ZONE = "America/La_Paz";

/** Fecha de hoy en Bolivia como YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Suma dias a una fecha YYYY-MM-DD. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Dia de la semana (0 = domingo) de una fecha YYYY-MM-DD. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** Numero de dia del reto (1..100) para una fecha; fuera de rango devuelve <1 o >100. */
export function dayNumber(iso: string): number {
  const ms = Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${CHALLENGE_START}T12:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}

/** Las 100 fechas del reto, en orden. */
export function allChallengeDates(): string[] {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(CHALLENGE_START, i));
}

/** Si un reto esta programado para esa fecha. */
export function isScheduled(daysOfWeek: number[], iso: string): boolean {
  return daysOfWeek.includes(weekday(iso));
}
