import Link from "next/link";
import { X } from "lucide-react";
import { dayNumber } from "@/lib/challenge";
import { dayStat, type DayStatus } from "@/lib/stats";
import type { Challenge, DailyLog, Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  dates: string[];
  challenges: Challenge[];
  /** Logs de este usuario (ya filtrados). */
  logs: DailyLog[];
  today: string;
  selectedDay?: string;
}

/** Grilla de 100 dias (10x10) de un usuario, coloreada por cumplimiento. */
export function CalendarGrid({ profile, dates, challenges, logs, today, selectedDay }: Props) {
  return (
    <div className="card-soft p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface-2 text-lg">
          {profile.avatar_emoji}
        </span>
        <h2 className="font-bold">{profile.display_name}</h2>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {dates.map((date) => {
          const stat = dayStat(challenges, logs, profile.id, date, today);
          const isToday = date === today;
          const isSelected = date === selectedDay;
          return (
            <Link
              key={date}
              href={`/calendario?day=${date}`}
              title={`${date} · ${stat.scheduled === 0 ? "sin retos" : `${stat.completed}/${stat.scheduled}`}`}
              aria-current={isSelected ? "true" : undefined}
              className={cellClasses(stat.status, isToday, isSelected)}
            >
              {stat.status === "missed" ? <X className="size-3" strokeWidth={3} aria-hidden /> : dayNumber(date)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function cellClasses(status: DayStatus, isToday: boolean, isSelected: boolean): string {
  const base =
    "flex aspect-square items-center justify-center rounded-md text-[10px] font-bold transition-transform hover:z-10 hover:scale-125 focus-visible:z-10";
  const byStatus: Record<DayStatus, string> = {
    future: "border border-dashed border-border bg-surface-2 text-muted/70",
    none: "border border-border/70 bg-transparent text-muted/60",
    done: "border border-ink/20 bg-success text-white",
    partial: "border border-ink/20 bg-mostaza text-[#2a1a10]",
    missed: "border border-ink/20 bg-danger text-white",
  };
  const today = isToday ? " ring-2 ring-accent ring-offset-1 ring-offset-surface" : "";
  const selected = isSelected ? " outline outline-2 outline-offset-1 outline-foreground" : "";
  return `${base} ${byStatus[status]}${today}${selected}`;
}
