"use client";

import { useActionState, useEffect, useRef } from "react";
import { Save } from "lucide-react";
import type { MetricFormState } from "@/app/(app)/progreso/actions";

const FIELDS = [
  { name: "weight_kg", label: "Peso", unit: "kg" },
  { name: "waist_cm", label: "Cintura", unit: "cm" },
  { name: "thigh_cm", label: "Pierna", unit: "cm" },
  { name: "arm_cm", label: "Brazo", unit: "cm" },
  { name: "chest_cm", label: "Pecho", unit: "cm" },
  { name: "body_fat_pct", label: "Grasa corporal", unit: "%" },
] as const;

const initialState: MetricFormState = { error: null };

export function MetricForm({
  action,
  today,
}: {
  action: (prevState: MetricFormState, formData: FormData) => Promise<MetricFormState>;
  today: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpia el formulario (menos la fecha) despues de un guardado exitoso.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="card animate-rise flex flex-col gap-5 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-xl sm:text-2xl">Registrar medida</h2>
        <label className="flex items-center gap-2">
          <span className="label mb-0">Fecha</span>
          <input
            type="date"
            name="measured_on"
            defaultValue={today}
            max={today}
            required
            className="field w-auto py-1.5"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f.name} className="flex flex-col gap-1">
            <span className="label mb-0">{f.label}</span>
            <span className="relative block">
              <input
                type="number"
                step="0.1"
                name={f.name}
                placeholder="—"
                className="field pr-10"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-muted">
                {f.unit}
              </span>
            </span>
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="label mb-0">Nota</span>
        <textarea name="note" rows={2} placeholder="Opcional" className="field resize-none" />
      </label>

      {state.error && <p className="text-sm font-bold text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        <Save className="size-4" strokeWidth={2.5} aria-hidden />
        {pending ? "Guardando…" : "Guardar medida"}
      </button>
    </form>
  );
}
