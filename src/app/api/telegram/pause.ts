import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { tg, type ReplyMarkup } from "@/lib/telegram";
import { CATEGORY_META, type Challenge } from "@/lib/types";

// Pausar y reanudar retos desde el bot. Se pausa en vez de borrar: asi se conservan el
// historial y las multas; un reto pausado no aparece en /hoy ni genera multas.

export async function sendPauseList(chatId: number, userId: string) {
  return tg("sendMessage", { chat_id: chatId, ...(await pauseView(userId)) });
}

/** Toque en "p|<challengeId>": pausa o reanuda y refresca la lista. */
export async function togglePause(chatId: number, messageId: number, userId: string, challengeId: string) {
  const admin = createAdminClient();
  const { data: challenge } = await admin
    .from("challenges")
    .select("user_id, active")
    .eq("id", challengeId)
    .maybeSingle();
  if (!challenge || challenge.user_id !== userId) return "Ese reto no es tuyo.";

  await admin.from("challenges").update({ active: !challenge.active }).eq("id", challengeId);
  revalidatePath("/", "layout");

  await tg("editMessageText", { chat_id: chatId, message_id: messageId, ...(await pauseView(userId)) });
  return challenge.active ? "Pausado ⏸️" : "Reanudado ▶️";
}

async function pauseView(userId: string): Promise<{ text: string; reply_markup?: ReplyMarkup }> {
  const { data } = await createAdminClient()
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  const challenges = (data ?? []) as Challenge[];

  if (challenges.length === 0) return { text: "No tienes retos todavía. Crea uno con /nuevo." };

  return {
    text:
      "Pausar o reanudar retos\n\n🟢 Activo · ⏸️ Pausado: no aparece en /hoy ni genera multas.\n" +
      "Tu historial y tus multas se conservan.\n\nToca un reto para cambiarlo.",
    reply_markup: {
      inline_keyboard: challenges.map((c) => [
        {
          text: `${c.active ? "🟢" : "⏸️"} ${CATEGORY_META[c.category].emoji} ${c.title}${c.active ? "" : " (pausado)"}`,
          callback_data: `p|${c.id}`,
        },
      ]),
    },
  };
}
