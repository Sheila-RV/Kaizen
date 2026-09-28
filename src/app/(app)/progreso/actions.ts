"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { todayISO } from "@/lib/challenge";

export interface MetricFormState {
  error: string | null;
  ok?: boolean;
}

const NUMERIC_FIELDS = [
  "weight_kg",
  "waist_cm",
  "thigh_cm",
  "arm_cm",
  "chest_cm",
  "body_fat_pct",
] as const;

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Crea o actualiza (upsert) la medida del dia indicado para el usuario autenticado. */
export async function upsertMetric(
  _prevState: MetricFormState,
  formData: FormData,
): Promise<MetricFormState> {
  const user = await getUser();
  if (!user) return { error: "No autenticado." };

  const measuredOn = String(formData.get("measured_on") || todayISO());
  const note = String(formData.get("note") || "").trim() || null;

  const values: Record<string, number | null> = {};
  for (const field of NUMERIC_FIELDS) {
    values[field] = parseNumber(formData.get(field));
  }

  const hasAnyValue = Object.values(values).some((v) => v !== null) || note !== null;
  if (!hasAnyValue) return { error: "Registra al menos un dato." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("body_metrics")
    .upsert(
      { user_id: user.id, measured_on: measuredOn, note, ...values },
      { onConflict: "user_id,measured_on" },
    );

  if (error) return { error: error.message };

  revalidatePath("/progreso");
  return { error: null, ok: true };
}

/** Elimina una medida propia. */
export async function deleteMetric(id: string): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("body_metrics").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/progreso");
}
