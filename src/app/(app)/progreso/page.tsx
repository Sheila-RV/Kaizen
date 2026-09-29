import { createClient, getUser } from "@/lib/supabase/server";
import { todayISO } from "@/lib/challenge";
import type { BodyMetric, Profile } from "@/lib/types";
import { MetricForm } from "@/components/progreso/MetricForm";
import { SummaryCards } from "@/components/progreso/SummaryCards";
import { WeightChart } from "@/components/progreso/WeightChart";
import { MeasurementsChart } from "@/components/progreso/MeasurementsChart";
import { HistoryTable } from "@/components/progreso/HistoryTable";
import { groupMetricsByUser } from "@/components/progreso/metrics";
import { upsertMetric } from "./actions";

export default async function ProgresoPage() {
  const user = await getUser();
  if (!user) return null; // el layout de (app) ya redirige a /login

  const supabase = await createClient();
  const [{ data: profiles }, { data: metrics }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("body_metrics").select("*").order("measured_on"),
  ]);

  // Yo primero, siempre. Quien pauso su participacion no aparece (salvo yo).
  const orderedProfiles = ((profiles ?? []) as Profile[]).filter((p) => p.active || p.id === user.id).sort((a, b) =>
    a.id === user.id ? -1 : b.id === user.id ? 1 : 0,
  );
  const byUser = groupMetricsByUser((metrics ?? []) as BodyMetric[]);
  const myMetrics = byUser.get(user.id) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-rise">
        <h1 className="display text-3xl sm:text-4xl">Progreso</h1>
        <p className="text-sm text-muted">Registra tus medidas y compara tu avance.</p>
      </div>

      <MetricForm action={upsertMetric} today={todayISO()} />

      <SummaryCards profiles={orderedProfiles} byUser={byUser} />

      <WeightChart profiles={orderedProfiles} byUser={byUser} />

      <div className="grid gap-6 md:grid-cols-2">
        {orderedProfiles.map((profile, i) => (
          <MeasurementsChart
            key={profile.id}
            profile={profile}
            metrics={byUser.get(profile.id) ?? []}
            delayMs={i * 80}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="display text-xl sm:text-2xl">Mi historial</h2>
        <HistoryTable metrics={myMetrics} />
      </div>
    </div>
  );
}
