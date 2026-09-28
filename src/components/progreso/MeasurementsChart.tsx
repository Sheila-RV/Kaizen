"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMetric, Profile } from "@/lib/types";
import { MEASUREMENT_FIELDS, type MetricKey, toNum } from "./metrics";

function fmtDate(iso: string) {
  return format(new Date(`${iso}T12:00:00Z`), "dd MMM", { locale: es });
}

export function MeasurementsChart({
  profile,
  metrics,
  delayMs = 0,
}: {
  profile: Profile;
  metrics: BodyMetric[];
  delayMs?: number;
}) {
  const [field, setField] = useState<MetricKey>(MEASUREMENT_FIELDS[0].key);
  const active = MEASUREMENT_FIELDS.find((f) => f.key === field) ?? MEASUREMENT_FIELDS[0];

  const data = metrics
    .map((m) => ({ date: m.measured_on, value: toNum(m[field]) }))
    .filter((row): row is { date: string; value: number } => row.value !== null);

  return (
    <div className="card animate-rise flex flex-col gap-4 p-5 sm:p-6" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="display text-lg">
          {profile.avatar_emoji} {profile.display_name}
        </p>
        <div
          role="tablist"
          aria-label="Medida a mostrar"
          className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink bg-surface-2 p-1"
        >
          {MEASUREMENT_FIELDS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={f.key === field}
              onClick={() => setField(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                f.key === field
                  ? "bg-accent text-accent-foreground shadow-sticker-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted">
          Sin datos de {active.label.toLowerCase()} todavía.
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                stroke="var(--muted)"
                tick={{ fill: "var(--muted)" }}
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted)"
                tick={{ fill: "var(--muted)" }}
                fontSize={12}
                domain={["auto", "auto"]}
              />
              <Tooltip
                labelFormatter={(v) => fmtDate(String(v))}
                formatter={(value) => [`${value} ${active.unit}`, active.label]}
                contentStyle={{
                  background: "var(--surface)",
                  border: "2px solid var(--ink)",
                  borderRadius: 14,
                  boxShadow: "var(--shadow-sticker-sm)",
                  fontSize: 13,
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 700, marginBottom: 4 }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--fisico)"
                strokeWidth={3}
                strokeLinecap="round"
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--ink)", fill: "var(--fisico)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--ink)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
