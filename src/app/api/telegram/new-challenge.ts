import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { tg, type InlineButton, type ReplyMarkup } from "@/lib/telegram";
import { CATEGORY_META, type Category } from "@/lib/types";
import { DAY_OPTIONS, TEMPLATES, formatDays } from "@/components/retos/constants";

// Crear un reto desde el bot, paso a paso: categoria -> nombre -> dias -> guardar.
// El paso actual se guarda en telegram_links.pending.

export type Pending =
  | { step: "title"; category: Category }
  | { step: "days"; category: Category; title: string; days: number[] };

const CATEGORIES: Category[] = ["mente", "fisico", "espiritual"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const MAX_TITLE = 80;
const CANCEL: InlineButton = { text: "✖️ Cancelar", callback_data: "x" };

async function setPending(chatId: number, pending: Pending | null) {
  await createAdminClient().from("telegram_links").update({ pending }).eq("chat_id", chatId);
}

function label(category: Category) {
  const meta = CATEGORY_META[category];
  return `${meta.emoji} ${meta.label}`;
}

/** /nuevo: pregunta la categoria. */
export async function startNew(chatId: number) {
  await setPending(chatId, null);
  return tg("sendMessage", {
    chat_id: chatId,
    text: "Nuevo reto ✨\n¿De qué categoría?",
    reply_markup: {
      inline_keyboard: [CATEGORIES.map((c) => ({ text: label(c), callback_data: `n|${c}` })), [CANCEL]],
    },
  });
}

/** Toques de boton del flujo. Devuelve el aviso corto para answerCallbackQuery. */
export async function handleNewButton(
  chatId: number,
  messageId: number,
  userId: string,
  pending: Pending | null,
  kind: string,
  arg: string,
): Promise<string | undefined> {
  const edit = (text: string, reply_markup?: ReplyMarkup) =>
    tg("editMessageText", { chat_id: chatId, message_id: messageId, text, reply_markup });

  if (kind === "x") {
    await setPending(chatId, null);
    await edit("Cancelado.");
    return;
  }

  if (kind === "n" && CATEGORIES.includes(arg as Category)) {
    const category = arg as Category;
    await setPending(chatId, { step: "title", category });
    await edit(`${label(category)}\nEscribe el nombre del reto, o elige una idea:`, {
      inline_keyboard: [
        ...TEMPLATES[category].map((t, i) => [{ text: t, callback_data: `tp|${i}` }]),
        [CANCEL],
      ],
    });
    return;
  }

  if (kind === "tp" && pending?.step === "title") {
    const title = TEMPLATES[pending.category][Number(arg)];
    if (!title) return;
    const next: Pending = { step: "days", category: pending.category, title, days: ALL_DAYS };
    await setPending(chatId, next);
    await edit(daysText(next), daysKeyboard(next.days));
    return;
  }

  if (pending?.step !== "days") return "Ese paso ya pasó. Manda /nuevo para empezar de nuevo.";

  if (kind === "dw" || kind === "dp") {
    let days: number[];
    if (kind === "dp") days = arg === "wk" ? WEEKDAYS : ALL_DAYS;
    else {
      const d = Number(arg);
      days = pending.days.includes(d) ? pending.days.filter((x) => x !== d) : [...pending.days, d];
    }
    const next: Pending = { ...pending, days: days.sort((a, b) => a - b) };
    await setPending(chatId, next);
    await edit(daysText(next), daysKeyboard(next.days));
    return;
  }

  if (kind === "ds") {
    if (pending.days.length === 0) return "Elige al menos un día.";
    const { error } = await createAdminClient().from("challenges").insert({
      user_id: userId,
      category: pending.category,
      title: pending.title,
      days_of_week: pending.days,
    });
    if (error) return "No pude guardar el reto. Intenta de nuevo.";

    await setPending(chatId, null);
    revalidatePath("/", "layout");
    await edit(`✅ Reto creado\n${label(pending.category)} · ${pending.title}\n${formatDays(pending.days)}`);
    return "¡Reto creado!";
  }
}

/** Texto escrito mientras se espera el nombre del reto. */
export async function handleNewTitle(chatId: number, pending: Extract<Pending, { step: "title" }>, text: string) {
  const title = text.slice(0, MAX_TITLE).trim();
  const next: Pending = { step: "days", category: pending.category, title, days: ALL_DAYS };
  await setPending(chatId, next);
  return tg("sendMessage", { chat_id: chatId, text: daysText(next), reply_markup: daysKeyboard(next.days) });
}

export function cancelPending(chatId: number) {
  return setPending(chatId, null);
}

function daysText(p: Extract<Pending, { step: "days" }>) {
  return `${label(p.category)} · ${p.title}\n¿Qué días? ${formatDays(p.days)}\n\nToca los días para activarlos o quitarlos.`;
}

function daysKeyboard(days: number[]): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: "Todos los días", callback_data: "dp|all" },
        { text: "Lunes a viernes", callback_data: "dp|wk" },
      ],
      DAY_OPTIONS.map((d) => ({ text: days.includes(d.value) ? `✅${d.label}` : d.label, callback_data: `dw|${d.value}` })),
      [{ text: "💾 Guardar", callback_data: "ds" }, CANCEL],
    ],
  };
}
