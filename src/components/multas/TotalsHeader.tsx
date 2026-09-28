import { Coins, HandCoins, PiggyBank } from "lucide-react";
import type { Profile } from "@/lib/types";
import { totalsByUser, type PenaltyWithChallenge } from "./penalties";

export function TotalsHeader({
  profiles,
  penalties,
}: {
  profiles: Profile[];
  penalties: PenaltyWithChallenge[];
}) {
  const bote = Math.round(penalties.reduce((sum, p) => sum + Number(p.amount), 0) * 100) / 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="card animate-rise flex flex-col items-center gap-2 p-6 text-center sm:p-10">
        <span className="chip">
          <Coins className="size-3.5" strokeWidth={2.5} aria-hidden />
          Bote total
        </span>
        <p className="display flex items-center gap-3 text-5xl sm:text-6xl">
          <PiggyBank className="size-10 text-accent sm:size-12" strokeWidth={2} aria-hidden />
          {bote} Bs
        </p>
        <p className="text-sm text-muted">Todas las multas generadas por el reto</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((profile, i) => {
          const totals = totalsByUser(penalties, profile.id);
          return (
            <div
              key={profile.id}
              className="card animate-rise p-5 sm:p-6"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="display text-lg">
                  {profile.avatar_emoji} {profile.display_name}
                </p>
                <HandCoins className="size-5 text-muted" strokeWidth={2} aria-hidden />
              </div>
              <p className="mt-3 text-xs font-bold tracking-wide text-muted uppercase">
                Deuda pendiente
              </p>
              <p className={`stat text-4xl ${totals.pending > 0 ? "text-danger" : "text-success"}`}>
                {totals.pending} Bs
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t-2 border-dashed border-border pt-3 text-xs text-muted">
                <div>
                  <p className="stat text-sm text-foreground">{totals.generated} Bs</p>
                  Generado
                </div>
                <div>
                  <p className="stat text-sm text-success">{totals.paid} Bs</p>
                  Pagado
                </div>
                <div>
                  <p className="stat text-sm text-foreground">{totals.count}</p>
                  Retos fallados
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
