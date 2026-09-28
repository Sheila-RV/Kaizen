// Utilidades puras para agrupar y resumir medidas corporales. Sin JSX.
import type { BodyMetric } from "@/lib/types";

export type MetricKey =
  | "weight_kg"
  | "waist_cm"
  | "thigh_cm"
  | "arm_cm"
  | "chest_cm"
  | "body_fat_pct";

export interface MetricFieldMeta {
  key: MetricKey;
  label: string;
  unit: string;
}

/** Todos los campos medibles, en el orden en que se muestran. */
export const METRIC_FIELDS: MetricFieldMeta[] = [
  { key: "weight_kg", label: "Peso", unit: "kg" },
  { key: "waist_cm", label: "Cintura", unit: "cm" },
  { key: "thigh_cm", label: "Pierna", unit: "cm" },
  { key: "arm_cm", label: "Brazo", unit: "cm" },
  { key: "chest_cm", label: "Pecho", unit: "cm" },
  { key: "body_fat_pct", label: "Grasa corporal", unit: "%" },
];

/** Campos de circunferencia usados en el grafico de medidas con selector. */
export const MEASUREMENT_FIELDS: MetricFieldMeta[] = METRIC_FIELDS.filter(
  (f) => f.key === "waist_cm" || f.key === "thigh_cm" || f.key === "arm_cm" || f.key === "chest_cm",
);

/** Postgres puede devolver columnas numeric como string; siempre normalizamos a number. */
export function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Agrupa medidas por usuario, ordenadas por fecha ascendente. */
export function groupMetricsByUser(metrics: BodyMetric[]): Map<string, BodyMetric[]> {
  const map = new Map<string, BodyMetric[]>();
  const sorted = [...metrics].sort((a, b) => a.measured_on.localeCompare(b.measured_on));
  for (const m of sorted) {
    const arr = map.get(m.user_id) ?? [];
    arr.push(m);
    map.set(m.user_id, arr);
  }
  return map;
}

export interface FieldSummary {
  start: number;
  startDate: string;
  latest: number;
  latestDate: string;
  delta: number;
}

/** Primer y ultimo valor no nulo registrado para un campo (asume metrics ordenado por fecha). */
export function summarizeField(metrics: BodyMetric[], key: MetricKey): FieldSummary | null {
  let first: { v: number; d: string } | null = null;
  let last: { v: number; d: string } | null = null;

  for (const m of metrics) {
    const v = toNum(m[key]);
    if (v === null) continue;
    if (!first) first = { v, d: m.measured_on };
    last = { v, d: m.measured_on };
  }

  if (!first || !last) return null;

  return {
    start: first.v,
    startDate: first.d,
    latest: last.v,
    latestDate: last.d,
    delta: Math.round((last.v - first.v) * 100) / 100,
  };
}
