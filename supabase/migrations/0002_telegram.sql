-- DayDay: bot de Telegram. Cada usuaria vincula su chat mandandole su correo al bot.

create table public.telegram_links (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  chat_id bigint not null unique,
  linked_at timestamptz not null default now()
);

-- Sin politicas: solo el servidor (service role, desde el webhook) lee y escribe.
alter table public.telegram_links enable row level security;
