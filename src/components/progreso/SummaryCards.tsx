import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { BodyMetric, Profile } from "@/lib/types";
import { Sun } from "@/components/ui/brand";
import { METRIC_FIELDS, summarizeField } from "./metrics";

function DeltaChip({ delta, unit }: { delta: number; unit: string }) {
  // Neutral a proposito: no sabemos si subir o bajar es "bueno" para cada meta.
  const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : ArrowRight;
  return (
    <span className="chip">
      <Icon className="size-3" strokeWidth={2.5} aria-hidden />
      {delta === 0 ? "sin cambio" : `${delta > 0 ? "+" : ""}${delta} ${unit}`}
    </span>
  );
}

export function SummaryCards({
  profiles,
  byUser,
}: {
  profiles: Profile[];
  byUser: Map<string, BodyMetric[]>;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      {profiles.map((profile, i) => {
        const metrics = byUser.get(profile.id) ?? [];

        if (metrics.length === 0) {
          return (
            <div
              key={profile.id}
              className="card-soft animate-rise flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Sun size={36} />
              <p className="font-bold">
                {profile.avatar_emoji} {profile.display_name}
              </p>
              <p className="text-sm text-muted">Registra tu medida inicial</p>
            </div>
          );
        }

        return (
          <div
            key={profile.id}
            className="card animate-rise p-5 sm:p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="display text-xl">
                {profile.avatar_emoji} {profile.display_name}
              </p>
              {profile.goal && <span className="chip">Meta: {profile.goal}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {METRIC_FIELDS.map((field) => {
                const summary = summarizeField(metrics, field.key);
                if (!summary) return null;
                return (
                  <div key={field.key} className="flex flex-col gap-1">
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">
                      {field.label}
                    </p>
                    <p className="stat text-2xl leading-none">
                      {summary.latest}
                      <span className="ml-1 text-xs font-normal text-muted">{field.unit}</span>
                    </p>
                    <p className="text-xs text-muted">
                      Inicio: {summary.start} {field.unit}
                    </p>
                    <DeltaChip delta={summary.delta} unit={field.unit} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
