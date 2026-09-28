"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { CATEGORY_META, type Category, type Challenge, type DailyLog } from "@/lib/types";
import { ChallengeItem } from "./challenge-item";

interface Props {
  userId: string;
  /** YYYY-MM-DD */
  todayIso: string;
  /** YYYY-MM-DD */
  yesterdayIso: string;
  showYesterday: boolean;
  todayChallenges: Challenge[];
  yesterdayChallenges: Challenge[];
  todayLogs: DailyLog[];
  yesterdayLogs: DailyLog[];
}

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];

/** Lista de mis retos agrupados por categoria, con toggle Hoy/Ayer (para no olvidar marcar antes de medianoche). */
export function DayPanel({
  userId,
  todayIso,
  yesterdayIso,
  showYesterday,
  todayChallenges,
  yesterdayChallenges,
  todayLogs,
  yesterdayLogs,
}: Props) {
  const [tab, setTab] = useState<"hoy" | "ayer">("hoy");
  const isToday = tab === "hoy";
  const date = isToday ? todayIso : yesterdayIso;
  const challenges = isToday ? todayChallenges : yesterdayChallenges;
  const logs = isToday ? todayLogs : yesterdayLogs;
  const logByChallenge = new Map(logs.map((l) => [l.challenge_id, l]));

  const completedCount = challenges.filter((c) => logByChallenge.get(c.id)?.completed).length;
  const allDone = challenges.length > 0 && completedCount === challenges.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="display text-xl">Mis retos</h2>
        {showYesterday && (
          <div role="tablist" aria-label="Elegir dia" className="flex gap-1 rounded-full border-2 border-ink bg-surface-2 p-1 text-sm shadow-sticker-sm">
            <button
              type="button"
              role="tab"
              aria-selected={isToday}
              onClick={() => setTab("hoy")}
              className={`rounded-full px-3.5 py-1 font-semibold transition-colors ${isToday ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}
            >
              Hoy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isToday}
              onClick={() => setTab("ayer")}
              className={`rounded-full px-3.5 py-1 font-semibold transition-colors ${!isToday ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}
            >
              Ayer
            </button>
          </div>
        )}
      </div>

      {allDone && (
        <p className="chip justify-center gap-2 border-success bg-success/10 py-2 text-success">
          <Sparkles className="size-4" aria-hidden /> ¡Completaste todo {isToday ? "hoy" : "ayer"}!
        </p>
      )}

      {challenges.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted">No tienes retos programados {isToday ? "hoy" : "ayer"}.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {CATEGORIES.map((cat, i) => {
            const items = challenges.filter((c) => c.category === cat);
            if (items.length === 0) return null;
            const meta = CATEGORY_META[cat];
            const done = items.filter((c) => logByChallenge.get(c.id)?.completed).length;
            return (
              <div key={cat} className="animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
                <div
                  className="mb-2 inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-bold"
                  style={{ borderColor: meta.color, color: meta.color, backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)` }}
                >
                  <span aria-hidden>{meta.emoji}</span> {meta.label}
                  <span className="stat text-xs opacity-70">
                    {done}/{items.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {items.map((c) => (
                    <ChallengeItem key={`${c.id}-${date}`} challenge={c} initialLog={logByChallenge.get(c.id) ?? null} date={date} userId={userId} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
