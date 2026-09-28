import { createClient, getUser } from "@/lib/supabase/server";
import { allChallengeDates, todayISO } from "@/lib/challenge";
import { CalendarGrid } from "./calendar-grid";
import { DayDetail } from "./day-detail";
import { RealtimeRefresh } from "./realtime-refresh";

interface Props {
  searchParams: Promise<{ day?: string }>;
}

const LEGEND: { swatch: string; label: string }[] = [
  { swatch: "bg-success", label: "Cumplido" },
  { swatch: "bg-mostaza", label: "Hoy, en progreso" },
  { swatch: "bg-danger", label: "Fallado" },
  { swatch: "border border-dashed border-border bg-surface-2", label: "Futuro" },
  { swatch: "border border-border/70", label: "Sin retos" },
];

export default async function CalendarioPage({ searchParams }: Props) {
  const user = await getUser();
  if (!user) return null;

  const { day: selectedDay } = await searchParams;
  const today = todayISO();
  const dates = allChallengeDates();

  const supabase = await createClient();
  const [{ data: profiles }, { data: challenges }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("challenges").select("*"),
    supabase.from("daily_logs").select("*"),
  ]);

  const people = profiles ?? [];
  const allChallenges = challenges ?? [];
  const allLogs = logs ?? [];
  const validSelectedDay = selectedDay && dates.includes(selectedDay) ? selectedDay : undefined;

  return (
    <div className="flex flex-col gap-6">
      <RealtimeRefresh />
      <div>
        <h1 className="display text-3xl sm:text-4xl">Calendario de 100 días</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEGEND.map((l) => (
            <span key={l.label} className="chip">
              <span className={`size-2.5 rounded-full ${l.swatch}`} aria-hidden />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap">
        {people.map((p, i) => (
          <div key={p.id} className="animate-rise sm:min-w-70 sm:flex-1" style={{ animationDelay: `${i * 80}ms` }}>
            <CalendarGrid
              profile={p}
              dates={dates}
              challenges={allChallenges}
              logs={allLogs.filter((l) => l.user_id === p.id)}
              today={today}
              selectedDay={validSelectedDay}
            />
          </div>
        ))}
      </div>

      {validSelectedDay && <DayDetail day={validSelectedDay} profiles={people} challenges={allChallenges} logs={allLogs} />}
    </div>
  );
}
