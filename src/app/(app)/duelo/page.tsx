import { createClient, getUser } from "@/lib/supabase/server";
import { todayISO } from "@/lib/challenge";
import { bestStreak, completionStats, currentStreak } from "@/lib/stats";
import { Sun } from "@/components/ui/brand";
import { PlayerCard, type DuelCard } from "@/components/duelo/player-card";
import { VsBadge } from "@/components/duelo/vs-badge";
import { RealtimeRefresh } from "./realtime-refresh";

export default async function DueloPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const today = todayISO();

  const [{ data: profiles }, { data: challenges }, { data: logs }, { data: penalties }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("challenges").select("*"),
    supabase.from("daily_logs").select("*"),
    supabase.from("penalties").select("*"),
  ]);

  // Solo quienes participan; quien pauso no compite (sus multas siguen en /multas).
  const people = (profiles ?? []).filter((p) => p.active);
  if (people.length < 2) {
    return (
      <div className="card-soft p-8 text-center animate-rise">
        <Sun size={56} className="mx-auto mb-3 opacity-80" />
        <p className="display text-xl">Todavía falta un jugador</p>
        <p className="mt-1 text-sm text-muted">Se necesitan al menos dos personas activas para ver el duelo.</p>
      </div>
    );
  }

  const cards: DuelCard[] = people.map((p) => {
    const stats = completionStats(challenges ?? [], logs ?? [], p.id, today);
    const mine = (penalties ?? []).filter((x) => x.user_id === p.id);
    return {
      profile: p,
      current: currentStreak(challenges ?? [], logs ?? [], p.id, today),
      best: bestStreak(challenges ?? [], logs ?? [], p.id, today),
      ...stats,
      owed: mine.filter((x) => !x.paid).reduce((s, x) => s + Number(x.amount), 0),
      total: mine.reduce((s, x) => s + Number(x.amount), 0),
    };
  });

  const winner = cards.reduce((a, b) => (b.overallPct > a.overallPct ? b : a));
  const tie = cards.every((c) => c.overallPct === cards[0].overallPct);

  const [left, right, ...rest] = cards;

  return (
    <div className="flex flex-col gap-6">
      <RealtimeRefresh />

      <div>
        <h1 className="display text-center text-3xl sm:text-4xl">El Duelo</h1>
        <p className="mt-1 text-center text-sm text-muted">100 días, un solo ganador.</p>
      </div>

      {tie ? (
        <div className="card p-3 text-center font-bold">Van empatados — ¡sigan así! 🔥</div>
      ) : (
        <div className="card flex items-center justify-center gap-2.5 bg-mostaza p-3 text-center text-[#2a1a10]">
          <Sun size={24} spin />
          <p className="font-bold">
            {winner.profile.avatar_emoji} {winner.profile.display_name} va ganando el duelo
          </p>
        </div>
      )}

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
        <PlayerCard data={left} leading={!tie && left === winner} />
        <VsBadge />
        <PlayerCard data={right} leading={!tie && right === winner} />
      </div>

      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((c) => (
            <PlayerCard key={c.profile.id} data={c} leading={!tie && c === winner} />
          ))}
        </div>
      )}
    </div>
  );
}
