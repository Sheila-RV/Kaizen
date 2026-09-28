"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

/** Marca (o desmarca) una multa como pagada. Cualquiera de los dos puede hacerlo. */
export async function updatePenalty(id: string, paid: boolean): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("penalties")
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/multas");
}
