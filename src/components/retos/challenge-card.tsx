"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import type { Challenge } from "@/lib/types";
import { deleteChallenge, toggleChallengeActive } from "@/app/(app)/retos/actions";
import { ChallengeForm } from "./challenge-form";
import { DAY_OPTIONS } from "./constants";

export function ChallengeCard({ challenge, editable }: { challenge: Challenge; editable: boolean }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ChallengeForm category={challenge.category} challenge={challenge} onDone={() => setIsEditing(false)} />
    );
  }

  return (
    <div
      className={`card-soft flex flex-col gap-3 p-4 transition-opacity ${
        challenge.active ? "" : "opacity-55 grayscale-40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{challenge.title}</p>
          {challenge.description && <p className="mt-0.5 text-sm text-muted">{challenge.description}</p>}
        </div>
        {editable && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Editar "${challenge.title}"`}
              className="btn btn-ghost p-2!"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
            <form action={toggleChallengeActive.bind(null, challenge.id, !challenge.active)}>
              <button
                type="submit"
                aria-label={challenge.active ? `Pausar "${challenge.title}"` : `Reanudar "${challenge.title}"`}
                className="btn btn-ghost p-2!"
              >
                {challenge.active ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
            </form>
            <form
              action={deleteChallenge.bind(null, challenge.id)}
              onSubmit={(e) => {
                if (!confirm("¿Borrar este reto? No se puede deshacer.")) e.preventDefault();
              }}
            >
              <button
                type="submit"
                aria-label={`Borrar "${challenge.title}"`}
                className="btn btn-ghost p-2! hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {DAY_OPTIONS.map((day) => {
          const scheduled = challenge.days_of_week.includes(day.value);
          return (
            <span
              key={day.value}
              aria-hidden
              className={`flex size-6 items-center justify-center rounded-full border text-[0.65rem] font-bold ${
                scheduled ? "border-ink bg-accent text-accent-foreground" : "border-border text-muted"
              }`}
            >
              {day.label}
            </span>
          );
        })}
        <span className="sr-only">Días programados: {DAY_OPTIONS.filter((d) => challenge.days_of_week.includes(d.value)).map((d) => d.label).join(", ") || "ninguno"}</span>
        {!challenge.active && <span className="chip ml-1 border-danger/40 bg-danger/10 text-danger">Pausado</span>}
      </div>
    </div>
  );
}
