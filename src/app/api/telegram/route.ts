import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { TOTAL_DAYS, addDays, dayNumber, todayISO } from "@/lib/challenge";
import { appliesOn } from "@/lib/stats";
import { tg, type ReplyMarkup, type TelegramUpdate } from "@/lib/telegram";
import { CATEGORY_META, type Challenge } from "@/lib/types";

const HELP =
  "Comandos:\n/hoy — tus retos de hoy\n/ayer — tus retos de ayer (día de gracia)\n/salir — desconectar este chat";

// Webhook del bot. Telegram manda cada mensaje y cada toque de boton aqui.
// No hay sesion de usuario: se identifica por el chat vinculado y se usa el service role.
export async function POST(request: Request) {
  if (request.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  const update = (await request.json()) as TelegramUpdate;
  try {
    if (update.callback_query) await handleButton(update.callback_query);
    else if (update.message?.text) await handleText(update.message.chat.id, update.message.text.trim());
  } catch (err) {
    console.error("telegram webhook", err);
  }
  // Siempre 200: si no, Telegram reintenta el mismo update.
  return new Response("ok");
}

async function linkedUserId(chatId: number): Promise<string | null> {
  const { data } = await createAdminClient().from("telegram_links").select("user_id").eq("chat_id", chatId).maybeSingle();
  return data?.user_id ?? null;
}

async function handleText(chatId: number, text: string) {
  const command = text.split(/[\s@]/)[0].toLowerCase();
  const userId = await linkedUserId(chatId);

  if (command === "/salir") {
    await createAdminClient().from("telegram_links").delete().eq("chat_id", chatId);
    return send(chatId, "Listo, este chat quedó desconectado. Mándame tu correo para volver a conectarlo.");
  }

  if (!userId) {
    if (text.includes("@") && !text.startsWith("/")) return linkByEmail(chatId, text.toLowerCase());
    return send(chatId, "¡Hola! 🔥 Soy el bot de KAIZEN.\nMándame el correo con el que entras a la app para conectar tu cuenta.");
  }

  const today = todayISO();
  if (command === "/hoy" || command === "/start") return sendDay(chatId, userId, today);
  if (command === "/ayer") return sendDay(chatId, userId, addDays(today, -1));
  return send(chatId, HELP);
}

async function linkByEmail(chatId: number, email: string) {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 50 });
  const user = data?.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return send(chatId, "No encontré ese correo en el reto. Revisa que sea el mismo con el que entras a la app.");
  }

  // Un chat por usuaria: si este chat estaba con otra cuenta, se reemplaza.
  await admin.from("telegram_links").delete().eq("chat_id", chatId);
  const { error } = await admin.from("telegram_links").upsert({ user_id: user.id, chat_id: chatId }, { onConflict: "user_id" });
  if (error) return send(chatId, "No pude conectar tu cuenta. Intenta de nuevo.");

  await send(chatId, `¡Conectada! ✨\n\n${HELP}`);
  return sendDay(chatId, user.id, todayISO());
}

async function handleButton(query: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  if (!chatId || !messageId) return tg("answerCallbackQuery", { callback_query_id: query.id });

  const userId = await linkedUserId(chatId);
  if (!userId) {
    return tg("answerCallbackQuery", { callback_query_id: query.id, text: "Primero mándame tu correo.", show_alert: true });
  }

  // callback_data: "t|<challengeId>|<fecha>" para marcar, "d|<fecha>" para cambiar de dia.
  const [kind, a, b] = (query.data ?? "").split("|");
  let date = a;
  let notice: string | undefined;
  if (kind === "t") {
    date = b;
    notice = await toggle(userId, a, date);
  }

  const view = await dayView(userId, date);
  await tg("editMessageText", { chat_id: chatId, message_id: messageId, ...view });
  await tg("answerCallbackQuery", { callback_query_id: query.id, text: notice });
}

/** Marca o desmarca un reto. Mismas reglas que la web: solo retos propios, solo hoy o ayer. */
async function toggle(userId: string, challengeId: string, date: string): Promise<string | undefined> {
  const today = todayISO();
  if (date !== today && date !== addDays(today, -1)) return "Ese día ya se cerró.";

  const admin = createAdminClient();
  const { data: challenge } = await admin.from("challenges").select("user_id").eq("id", challengeId).maybeSingle();
  if (!challenge || challenge.user_id !== userId) return "Ese reto no es tuyo.";

  const { data: existing } = await admin
    .from("daily_logs")
    .select("id, completed")
    .eq("challenge_id", challengeId)
    .eq("log_date", date)
    .maybeSingle();

  if (existing) {
    await admin.from("daily_logs").update({ completed: !existing.completed }).eq("id", existing.id);
  } else {
    await admin.from("daily_logs").insert({ challenge_id: challengeId, user_id: userId, log_date: date, completed: true });
  }

  revalidatePath("/");
  return existing?.completed ? "Desmarcado" : "¡Cumplido! 🎉";
}

async function sendDay(chatId: number, userId: string, date: string) {
  return tg("sendMessage", { chat_id: chatId, ...(await dayView(userId, date)) });
}

/** Texto y botones con los retos de una usuaria para una fecha. */
async function dayView(userId: string, date: string): Promise<{ text: string; reply_markup?: ReplyMarkup }> {
  const today = todayISO();
  const isToday = date === today;
  const label = isToday ? "Hoy" : "Ayer";
  const switchDay = isToday
    ? { text: "⬅️ Ver ayer", callback_data: `d|${addDays(today, -1)}` }
    : { text: "Ver hoy ➡️", callback_data: `d|${today}` };

  const day = dayNumber(date);
  if (day < 1 || day > TOTAL_DAYS) {
    return { text: day < 1 ? "El reto todavía no empieza." : "El reto ya terminó. 🏁" };
  }

  const admin = createAdminClient();
  const [{ data: challenges }, { data: logs }] = await Promise.all([
    admin.from("challenges").select("*").eq("user_id", userId).eq("active", true).order("created_at"),
    admin.from("daily_logs").select("challenge_id, completed").eq("user_id", userId).eq("log_date", date),
  ]);

  const list = ((challenges ?? []) as Challenge[]).filter((c) => appliesOn(c, date));
  const done = new Set((logs ?? []).filter((l) => l.completed).map((l) => l.challenge_id));

  if (list.length === 0) {
    return {
      text: `${label} · Día ${day} de ${TOTAL_DAYS}\n\nNo tienes retos programados. Créalos en la app, en Mis retos.`,
      reply_markup: { inline_keyboard: [[switchDay]] },
    };
  }

  const doneCount = list.filter((c) => done.has(c.id)).length;
  const status = doneCount === list.length ? "¡Todo cumplido! 🎉" : `${doneCount} de ${list.length} cumplidos`;

  return {
    text: `${label} · Día ${day} de ${TOTAL_DAYS}\n${status}\n\nToca un reto para marcarlo o desmarcarlo.`,
    reply_markup: {
      inline_keyboard: [
        ...list.map((c) => [
          {
            text: `${done.has(c.id) ? "✅" : "⬜"} ${CATEGORY_META[c.category].emoji} ${c.title}`,
            callback_data: `t|${c.id}|${date}`,
          },
        ]),
        [switchDay],
      ],
    },
  };
}

function send(chatId: number, text: string) {
  return tg("sendMessage", { chat_id: chatId, text });
}
