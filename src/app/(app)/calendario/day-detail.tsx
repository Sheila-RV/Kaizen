import { Check, X } from "lucide-react";
import { appliesOn } from "@/lib/stats";
import { CATEGORY_META } from "@/lib/types";
import type { Challenge, DailyLog, Profile } from "@/lib/types";

interface Props {
  /** YYYY-MM-DD */
  day: string;
  profiles: Profile[];
  challenges: Challenge[];
  logs: DailyLog[];
}

/** Detalle de un dia: que reto hizo o fallo cada quien, con foto/nota si las hay. */
export function DayDetail({ day, profiles, challenges, logs }: Props) {
  return (
    <section className="card animate-rise p-5">
      <h3 className="display mb-4 text-xl">Detalle del {formatDate(day)}</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        {profiles.map((p) => {
          const scheduled = challenges.filter((c) => c.user_id === p.id && appliesOn(c, day));
          const logByChallenge = new Map(
            logs.filter((l) => l.user_id === p.id && l.log_date === day).map((l) => [l.challenge_id, l]),
          );
          return (
            <div key={p.id}>
              <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                <span className="flex size-7 items-center justify-center rounded-full border-2 border-ink bg-surface-2 text-sm">{p.avatar_emoji}</span>
                {p.display_name}
              </p>
              {scheduled.length === 0 ? (
                <p className="text-sm text-muted">Sin retos programados.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {scheduled.map((c) => {
                    const log = logByChallenge.get(c.id);
                    const done = log?.completed ?? false;
                    return (
                      <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-2.5 py-2 text-sm">
                        <span style={{ color: CATEGORY_META[c.category].color }} aria-hidden>
                          {CATEGORY_META[c.category].emoji}
                        </span>
                        <span className="flex-1 truncate font-medium">{c.title}</span>
                        <span className={`inline-flex items-center gap-1 font-bold ${done ? "text-success" : "text-danger"}`}>
                          {done ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                          {done ? "Hecho" : "Fallado"}
                        </span>
                        {log?.photo_url && (
                          // eslint-disable-next-line @next/next/no-img-element -- foto de usuario en Supabase Storage
                          <img
                            src={log.photo_url}
                            alt={`Prueba de ${c.title}`}
                            className="size-9 shrink-0 rounded-lg border-2 border-ink object-cover"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}
