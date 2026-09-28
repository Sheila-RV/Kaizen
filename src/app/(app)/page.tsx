import Link from "next/link";
import { Sparkles, TriangleAlert } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { CHALLENGE_START, PENALTY_BS, TOTAL_DAYS, addDays, dayNumber, todayISO } from "@/lib/challenge";
import { appliesOn } from "@/lib/stats";
import type { Category, Challenge, DailyLog } from "@/lib/types";
import { Sun } from "@/components/ui/brand";
import { DayRing } from "@/components/hoy/day-ring";
import { DayPanel } from "@/components/hoy/day-panel";
import { BestieToday } from "@/components/hoy/bestie-today";

export default async function HoyPage() {
  const user = await getUser();
  if (!user) return null; // el layout ya redirige a /login

  const today = todayISO();
  const day = dayNumber(today);

  if (day < 1) {
    return (
      <EmptyState
        title="El duelo todavía no arranca"
        message={`Empieza el ${formatDate(CHALLENGE_START)}. Faltan ${1 - day} día${1 - day === 1 ? "" : "s"}.`}
      />
    );
  }
  if (day > TOTAL_DAYS) {
    return <EmptyState title="¡Reto terminado!" message="Los 100 días llegaron a su fin. Revisen el duelo final." />;
  }

  const supabase = await createClient();
  const yesterday = addDays(today, -1);

  const [{ data: profiles }, { data: challenges }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("challenges").select("*").eq("active", true),
    supabase.from("daily_logs").select("*").in("log_date", [today, yesterday]),
  ]);

  const bestie = (profiles ?? []).find((p) => p.id !== user.id) ?? null;
  const allChallenges: Challenge[] = challenges ?? [];
  const allLogs: DailyLog[] = logs ?? [];

  const myChallenges = allChallenges.filter((c) => c.user_id === user.id);
  const todayChallenges = myChallenges.filter((c) => appliesOn(c, today));
  const showYesterday = yesterday >= CHALLENGE_START;
  const yesterdayChallenges = showYesterday ? myChallenges.filter((c) => appliesOn(c, yesterday)) : [];

  const logsFor = (date: string, userId: string) => allLogs.filter((l) => l.log_date === date && l.user_id === userId);
  const todayLogs = logsFor(today, user.id);

  const bestieChallengesToday = bestie ? allChallenges.filter((c) => c.user_id === bestie.id && appliesOn(c, today)) : [];
  const bestieDoneToday = bestie ? logsFor(today, bestie.id).filter((l) => l.completed).length : 0;

  // Progreso de hoy, total y por categoria, para el anillo del hero.
  const logByChallenge = new Map(todayLogs.map((l) => [l.challenge_id, l]));
  const byCategory: Record<Category, { done: number; total: number }> = {
    mente: { done: 0, total: 0 },
    fisico: { done: 0, total: 0 },
    espiritual: { done: 0, total: 0 },
  };
  for (const c of todayChallenges) {
    byCategory[c.category].total++;
    if (logByChallenge.get(c.id)?.completed) byCategory[c.category].done++;
  }
  const overallTotal = todayChallenges.length;
  const overallDone = todayChallenges.filter((c) => logByChallenge.get(c.id)?.completed).length;
  const pendingToday = overallTotal - overallDone;
  const allDoneToday = overallTotal > 0 && pendingToday === 0;
  const remaining = TOTAL_DAYS - day;

  return (
    <div className="flex flex-col gap-6">
      <section className="card relative overflow-hidden p-5 sm:p-7">
        <Sun size={260} className="pointer-events-none absolute -top-16 -right-16 opacity-[0.07]" />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          {overallTotal > 0 && <DayRing byCategory={byCategory} overallDone={overallDone} overallTotal={overallTotal} />}

          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <p className="label">Kaizen · 改善</p>
            <h1 className="display text-5xl leading-none sm:text-6xl">
              Día {day}
              <span className="stat align-top text-lg text-muted"> /{TOTAL_DAYS}</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              quedan {remaining} día{remaining === 1 ? "" : "s"}
            </p>

            {allDoneToday && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-success">
                <Sparkles className="size-4" aria-hidden /> ¡Día completo!
              </p>
            )}
          </div>
        </div>

        {!allDoneToday && pendingToday > 0 && (
          <p className="chip relative mt-5 w-full justify-center gap-2 border-danger bg-danger/10 py-2 text-sm text-danger sm:w-auto">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            Te falta{pendingToday === 1 ? "" : "n"} {pendingToday} reto{pendingToday === 1 ? "" : "s"} hoy · te arriesgas a {pendingToday}×{PENALTY_BS} Bs
          </p>
        )}
      </section>

      {bestie && (
        <BestieToday bestieId={bestie.id} name={bestie.display_name} emoji={bestie.avatar_emoji} done={bestieDoneToday} total={bestieChallengesToday.length} />
      )}

      {myChallenges.length === 0 ? (
        <EmptyState title="Aún no tienes retos" message="Crea tu primer reto para empezar a registrar tus días." cta />
      ) : (
        <DayPanel
          userId={user.id}
          todayIso={today}
          yesterdayIso={yesterday}
          showYesterday={showYesterday}
          todayChallenges={todayChallenges}
          yesterdayChallenges={yesterdayChallenges}
          todayLogs={todayLogs}
          yesterdayLogs={showYesterday ? logsFor(yesterday, user.id) : []}
        />
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}

function EmptyState({ title, message, cta }: { title: string; message: string; cta?: boolean }) {
  return (
    <div className="card-soft relative overflow-hidden p-8 text-center animate-rise">
      <Sun size={64} className="mx-auto mb-3 opacity-80" />
      <p className="display text-2xl">{title}</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {cta && (
        <Link href="/retos" className="btn btn-primary mt-4 inline-flex">
          Ir a Mis retos
        </Link>
      )}
    </div>
  );
}
