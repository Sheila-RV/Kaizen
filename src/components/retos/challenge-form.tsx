"use client";

import { Check, X } from "lucide-react";
import type { Category, Challenge } from "@/lib/types";
import { createChallenge, updateChallenge } from "@/app/(app)/retos/actions";
import { DAY_OPTIONS } from "./constants";

export function ChallengeForm({
  category,
  challenge,
  onDone,
}: {
  category: Category;
  challenge?: Challenge;
  onDone: () => void;
}) {
  const submit = challenge ? updateChallenge.bind(null, challenge.id) : createChallenge;

  return (
    <form
      action={async (formData) => {
        await submit(formData);
        onDone();
      }}
      className="card-soft space-y-3 p-4"
    >
      {!challenge && <input type="hidden" name="category" value={category} />}
      <div>
        <label className="label" htmlFor={`title-${category}`}>
          Título
        </label>
        <input
          id={`title-${category}`}
          name="title"
          required
          defaultValue={challenge?.title}
          placeholder="p.ej. Gym"
          className="field"
        />
      </div>
      <div>
        <label className="label" htmlFor={`description-${category}`}>
          Descripción (opcional)
        </label>
        <textarea
          id={`description-${category}`}
          name="description"
          rows={2}
          defaultValue={challenge?.description ?? ""}
          className="field"
        />
      </div>
      <fieldset>
        <legend className="label">Días programados</legend>
        <div className="flex flex-wrap gap-1.5">
          {DAY_OPTIONS.map((day) => (
            <label
              key={day.value}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-border text-xs font-bold transition-transform hover:scale-105 has-checked:border-ink has-checked:bg-accent has-checked:text-accent-foreground has-checked:shadow-sticker-sm"
            >
              <input
                type="checkbox"
                name="days_of_week"
                value={day.value}
                defaultChecked={challenge ? challenge.days_of_week.includes(day.value) : true}
                className="sr-only"
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="btn btn-ghost">
          <X className="size-4" aria-hidden />
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          <Check className="size-4" aria-hidden />
          {challenge ? "Guardar" : "Crear reto"}
        </button>
      </div>
    </form>
  );
}
