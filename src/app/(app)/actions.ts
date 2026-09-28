"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { addDays, todayISO } from "@/lib/challenge";

interface SaveLogInput {
  challengeId: string;
  /** YYYY-MM-DD */
  date: string;
  completed?: boolean;
  note?: string | null;
  photoUrl?: string | null;
}

/**
 * Crea o actualiza el registro del dia para uno de mis retos (upsert parcial:
 * los campos omitidos conservan el valor existente). Nunca confiamos en el
 * user_id del cliente: se verifica que el reto sea del usuario autenticado.
 */
export async function saveLog(input: SaveLogInput): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error("No autenticado");

  // Solo hoy o ayer (la RLS tambien lo exige).
  const today = todayISO();
  if (input.date > today || input.date < addDays(today, -1)) throw new Error("Solo puedes registrar hoy o ayer");

  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, user_id")
    .eq("id", input.challengeId)
    .single();
  if (!challenge || challenge.user_id !== user.id) throw new Error("No autorizado");

  const { data: existing } = await supabase
    .from("daily_logs")
    .select("completed, note, photo_url")
    .eq("challenge_id", input.challengeId)
    .eq("log_date", input.date)
    .maybeSingle();

  // Una nota sola no cuenta como cumplido; una foto de prueba si.
  const completed = input.completed ?? existing?.completed ?? Boolean(input.photoUrl);
  const note = input.note !== undefined ? input.note : (existing?.note ?? null);
  const photo_url = input.photoUrl !== undefined ? input.photoUrl : (existing?.photo_url ?? null);

  const { error } = await supabase.from("daily_logs").upsert(
    {
      challenge_id: input.challengeId,
      user_id: user.id,
      log_date: input.date,
      completed,
      note,
      photo_url,
    },
    { onConflict: "challenge_id,log_date" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
