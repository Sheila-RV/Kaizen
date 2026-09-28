import { Plus } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { createChallengeFromTemplate } from "@/app/(app)/retos/actions";
import { CATEGORY_CLASS, CATEGORY_SOFT_CLASS, TEMPLATES } from "./constants";

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];

/** Plantillas de un clic: crean un reto ya activo con todos los días marcados. */
export function Templates() {
  return (
    <section className="card-soft p-4 sm:p-5">
      <h2 className="label mb-3">Retos sugeridos</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <div key={category}>
            <p className={`mb-2 flex items-center gap-1.5 text-sm font-semibold ${CATEGORY_CLASS[category]}`}>
              <span aria-hidden>{CATEGORY_META[category].emoji}</span> {CATEGORY_META[category].label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES[category].map((title) => (
                <form key={title} action={createChallengeFromTemplate.bind(null, category, title)}>
                  <button
                    type="submit"
                    className={`chip cursor-pointer border-2 transition-transform hover:scale-105 ${CATEGORY_SOFT_CLASS[category]}`}
                  >
                    <Plus className="size-3" aria-hidden />
                    {title}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
