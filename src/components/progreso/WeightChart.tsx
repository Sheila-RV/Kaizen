"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMetric, Profile } from "@/lib/types";
import { Sun } from "@/components/ui/brand";
import { toNum } from "./metrics";

// Colores fijos para el primer y segundo perfil (mismo orden en toda la pagina).
const COLORS = ["var(--accent)", "var(--espiritual)"];

function fmtDate(iso: string) {
  return format(new Date(`${iso}T12:00:00Z`), "dd MMM", { locale: es });
}

export function WeightChart({
  profiles,
  byUser,
}: {
  profiles: Profile[];
  byUser: Map<string, BodyMetric[]>;
}) {
  const dates = new Set<string>();
  for (const profile of profiles) {
    for (const m of byUser.get(profile.id) ?? []) {
      if (toNum(m.weight_kg) !== null) dates.add(m.measured_on);
    }
  }
  const sortedDates = [...dates].sort();

  if (sortedDates.length === 0) {
    return (
      <div className="card-soft animate-rise flex flex-col items-center gap-3 border-dashed p-10 text-center">
        <Sun size={36} />
        <p className="text-sm text-muted">Registra tu medida inicial para ver el gráfico de peso.</p>
      </div>
    );
  }

  const data = sortedDates.map((date) => {
    const row: Record<string, string | number | null> = { date };
    for (const profile of profiles) {
      const match = (byUser.get(profile.id) ?? []).find((m) => m.measured_on === date);
      row[profile.id] = match ? toNum(match.weight_kg) : null;
    }
    return row;
  });

  return (
    <div className="card animate-rise p-5 sm:p-6">
      <p className="display mb-4 text-lg sm:text-xl">Peso (kg)</p>
      <div className="h-72 w-full">
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
            <Legend wrapperStyle={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600 }} />
            {profiles.map((profile, i) => (
              <Line
                key={profile.id}
                type="monotone"
                dataKey={profile.id}
                name={`${profile.avatar_emoji} ${profile.display_name}`}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={3}
                strokeLinecap="round"
                connectNulls
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--ink)", fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--ink)" }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
