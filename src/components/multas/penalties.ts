// Utilidades puras para totales y agrupacion de multas. Sin JSX.
import type { Category, Penalty } from "@/lib/types";

export type PenaltyWithChallenge = Penalty & {
  challenges: { title: string; category: Category } | null;
};

export interface UserTotals {
  generated: number;
  paid: number;
  pending: number;
  count: number;
}

/** Postgres puede devolver `numeric` como string; normalizamos siempre. */
function toNum(v: number | string): number {
  return Number(v);
}

/** Totales de un usuario sobre el conjunto completo (sin filtrar) de multas. */
export function totalsByUser(penalties: PenaltyWithChallenge[], userId: string): UserTotals {
  const mine = penalties.filter((p) => p.user_id === userId);
  const generated = mine.reduce((sum, p) => sum + toNum(p.amount), 0);
  const paid = mine.filter((p) => p.paid).reduce((sum, p) => sum + toNum(p.amount), 0);
  return { generated, paid, pending: Math.round((generated - paid) * 100) / 100, count: mine.length };
}

/** Agrupa multas por fecha, mas reciente primero. */
export function groupByDate(penalties: PenaltyWithChallenge[]): [string, PenaltyWithChallenge[]][] {
  const map = new Map<string, PenaltyWithChallenge[]>();
  for (const p of penalties) {
    const arr = map.get(p.penalty_date) ?? [];
    arr.push(p);
    map.set(p.penalty_date, arr);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
