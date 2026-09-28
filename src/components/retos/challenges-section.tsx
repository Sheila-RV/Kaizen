"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Category, Challenge } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { ChallengeCard } from "./challenge-card";
import { ChallengeForm } from "./challenge-form";
import { CATEGORY_CLASS, CATEGORY_SOFT_CLASS } from "./constants";

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];

export function ChallengesSection({
  title,
  challenges,
  editable,
}: {
  title: string;
  challenges: Challenge[];
  editable: boolean;
}) {
  const [addingCategory, setAddingCategory] = useState<Category | null>(null);

  return (
    <section className="space-y-4">
      <h2 className="display text-xl">{title}</h2>
      {challenges.length === 0 && !editable && <p className="text-sm text-muted">Todavía no hay retos.</p>}
      <div className="space-y-5">
        {CATEGORIES.map((category) => {
          const items = challenges.filter((c) => c.category === category);
          if (items.length === 0 && !editable) return null;
          const meta = CATEGORY_META[category];

          return (
            <div key={category}>
              <div
                className={`mb-2 flex items-center justify-between rounded-xl border-2 px-3 py-1.5 ${CATEGORY_SOFT_CLASS[category]}`}
              >
                <h3 className="flex items-center gap-1.5 text-sm font-bold">
                  <span aria-hidden>{meta.emoji}</span> {meta.label}
                </h3>
                {editable && addingCategory !== category && (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(category)}
                    aria-label={`Agregar reto de ${meta.label}`}
                    className={`flex cursor-pointer items-center gap-1 text-xs font-bold hover:underline ${CATEGORY_CLASS[category]}`}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Nuevo
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {addingCategory === category && (
                  <ChallengeForm category={category} onDone={() => setAddingCategory(null)} />
                )}
                {items.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} editable={editable} />
                ))}
                {items.length === 0 && editable && addingCategory !== category && (
                  <p className="pl-1 text-xs text-muted">Sin retos todavía.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
