import type { Category } from "@/lib/types";

/** Casillas de dia: 0 = domingo ... 6 = sabado (igual que la DB). Orden de despliegue L-D. */
export const DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

export const CATEGORY_CLASS: Record<Category, string> = {
  mente: "text-mente",
  fisico: "text-fisico",
  espiritual: "text-espiritual",
};

/** Fondo suave + texto de color para chips/cabeceras por categoria. */
export const CATEGORY_SOFT_CLASS: Record<Category, string> = {
  mente: "bg-mente/12 text-mente border-mente/40",
  fisico: "bg-fisico/12 text-fisico border-fisico/40",
  espiritual: "bg-espiritual/12 text-espiritual border-espiritual/40",
};

export const TEMPLATES: Record<Category, string[]> = {
  mente: ["Estudiar 30 min", "Leer 10 páginas"],
  fisico: ["Gym", "Cardio 30 min", "Día de pierna"],
  espiritual: ["Meditar 10 min", "Leer 10 páginas espirituales", "Diario de gratitud"],
};

export const EMOJI_OPTIONS = ["🔥", "💪", "🧘", "🧠", "🌟", "🚀", "🐯", "🌱"];

/** Texto corto de los dias programados, en orden L-D. */
export function formatDays(days: number[]): string {
  if (days.length === 7) return "Todos los días";
  if (days.length === 0) return "Sin días asignados";
  return DAY_OPTIONS.filter((d) => days.includes(d.value))
    .map((d) => d.label)
    .join(" ");
}
