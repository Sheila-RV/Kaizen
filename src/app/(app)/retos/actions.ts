"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

/** Extrae y valida los dias de la semana marcados en el formulario (0=domingo..6=sabado). */
function parseDays(formData: FormData): number[] {
  const days = formData
    .getAll("days_of_week")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  return days.length ? Array.from(new Set(days)).sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const displayName = String(formData.get("display_name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const avatarEmoji = String(formData.get("avatar_emoji") ?? "").trim();

  await supabase
    .from("profiles")
    .update({
      display_name: displayName || "Sin nombre",
      goal: goal || null,
      avatar_emoji: avatarEmoji || "🔥",
    })
    .eq("id", user.id);

  revalidatePath("/retos");
}

/** Pausa o reanuda mi participacion en el reto. Mis multas anteriores se conservan. */
export async function setParticipation(active: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ active }).eq("id", user.id);
  revalidatePath("/", "layout");
}

export async function createChallenge(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const category = String(formData.get("category") ?? "") as Category;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !["mente", "fisico", "espiritual"].includes(category)) return;

  await supabase.from("challenges").insert({
    user_id: user.id,
    category,
    title,
    description: description || null,
    days_of_week: parseDays(formData),
  });

  revalidatePath("/retos");
}

export async function createChallengeFromTemplate(category: Category, title: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("challenges").insert({
    user_id: user.id,
    category,
    title,
  });

  revalidatePath("/retos");
}

export async function updateChallenge(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;

  await supabase
    .from("challenges")
    .update({
      title,
      description: description || null,
      days_of_week: parseDays(formData),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/retos");
}

export async function toggleChallengeActive(id: string, active: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("challenges").update({ active }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/retos");
}

export async function deleteChallenge(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("challenges").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/retos");
}
