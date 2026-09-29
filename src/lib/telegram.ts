// Cliente minimo de la Bot API de Telegram (solo servidor).

export interface InlineButton {
  text: string;
  callback_data: string;
}

export interface ReplyMarkup {
  inline_keyboard: InlineButton[][];
}

export interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    data?: string;
    message?: TelegramMessage;
  };
}

/** Llama a un metodo de la Bot API. Los errores se registran pero no cortan el webhook. */
export async function tg(method: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`telegram ${method} ${res.status}: ${await res.text()}`);
}
