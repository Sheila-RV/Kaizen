-- DayDay: estado de la conversacion del bot (ej. creando un reto paso a paso).
alter table public.telegram_links add column pending jsonb;
