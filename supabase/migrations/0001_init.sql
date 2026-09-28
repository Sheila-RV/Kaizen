-- DayDay: reto de 100 dias (23-sep-2026 a 31-dic-2026)
-- Ejecutar en Supabase > SQL Editor (o `supabase db push`).

create type public.challenge_category as enum ('mente', 'fisico', 'espiritual');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Sin nombre',
  goal text,
  avatar_emoji text not null default '🔥',
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category public.challenge_category not null,
  title text not null,
  description text,
  -- 0 = domingo ... 6 = sabado (igual que extract(dow)). Por defecto todos los dias.
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  photo_url text,
  note text,
  created_at timestamptz not null default now(),
  unique (challenge_id, log_date)
);

create table public.penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  penalty_date date not null,
  amount numeric(10, 2) not null default 50,
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (challenge_id, penalty_date)
);

create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5, 2),
  waist_cm numeric(5, 1),
  thigh_cm numeric(5, 1),
  arm_cm numeric(5, 1),
  chest_cm numeric(5, 1),
  body_fat_pct numeric(4, 1),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

create index on public.daily_logs (log_date);
create index on public.penalties (user_id, paid);
create index on public.body_metrics (user_id, measured_on);

-- ---------------------------------------------------------------------------
-- Perfil automatico al registrarse
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: es un duelo, asi que ambos pueden VER todo; cada uno solo EDITA lo suyo.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.daily_logs enable row level security;
alter table public.penalties enable row level security;
alter table public.body_metrics enable row level security;

create policy "ver perfiles" on public.profiles for select to authenticated using (true);
create policy "editar mi perfil" on public.profiles for update to authenticated using (id = auth.uid());

create policy "ver retos" on public.challenges for select to authenticated using (true);
create policy "crear mis retos" on public.challenges for insert to authenticated with check (user_id = auth.uid());
create policy "editar mis retos" on public.challenges for update to authenticated using (user_id = auth.uid());
create policy "borrar mis retos" on public.challenges for delete to authenticated using (user_id = auth.uid());

create policy "ver logs" on public.daily_logs for select to authenticated using (true);
-- Solo se puede registrar hoy o ayer (hora Bolivia): evita marcar dias viejos para esquivar multas.
create policy "crear mis logs" on public.daily_logs for insert to authenticated
  with check (user_id = auth.uid() and log_date >= (now() at time zone 'America/La_Paz')::date - 1
              and log_date <= (now() at time zone 'America/La_Paz')::date);
create policy "editar mis logs" on public.daily_logs for update to authenticated
  using (user_id = auth.uid() and log_date >= (now() at time zone 'America/La_Paz')::date - 1)
  with check (user_id = auth.uid() and log_date >= (now() at time zone 'America/La_Paz')::date - 1
              and log_date <= (now() at time zone 'America/La_Paz')::date);
create policy "borrar mis logs" on public.daily_logs for delete to authenticated using (user_id = auth.uid());

-- Las multas solo las crea close_day(). Cualquiera de los dos puede marcarlas como pagadas.
create policy "ver multas" on public.penalties for select to authenticated using (true);
create policy "marcar multa pagada" on public.penalties for update to authenticated using (true);

create policy "ver medidas" on public.body_metrics for select to authenticated using (true);
create policy "crear mis medidas" on public.body_metrics for insert to authenticated with check (user_id = auth.uid());
create policy "editar mis medidas" on public.body_metrics for update to authenticated using (user_id = auth.uid());
create policy "borrar mis medidas" on public.body_metrics for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Cierre del dia: 50 Bs por cada reto activo, programado ese dia, sin cumplir.
-- ---------------------------------------------------------------------------

create function public.close_day(p_date date)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  inserted integer;
begin
  if p_date < date '2026-09-23' or p_date > date '2026-12-31' then
    return 0;
  end if;

  insert into public.penalties (user_id, challenge_id, penalty_date)
  select c.user_id, c.id, p_date
  from public.challenges c
  where c.active
    and (c.created_at at time zone 'America/La_Paz')::date <= p_date
    and extract(dow from p_date)::smallint = any (c.days_of_week)
    and not exists (
      select 1 from public.daily_logs l
      where l.challenge_id = c.id and l.log_date = p_date and l.completed
    )
  on conflict (challenge_id, penalty_date) do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke execute on function public.close_day(date) from public, anon, authenticated;

-- 00:05 hora Bolivia (UTC-4) = 04:05 UTC; cierra el dia ANTERIOR A AYER.
-- Asi hay un dia de gracia: "ayer" todavia se puede registrar y la multa coincide con lo que se ve.
-- Requiere la extension pg_cron (Database > Extensions > pg_cron).
create extension if not exists pg_cron;
select cron.schedule(
  'dayday-close-day',
  '5 4 * * *',
  $$ select public.close_day(((now() at time zone 'America/La_Paz')::date - 2)); $$
);

-- ---------------------------------------------------------------------------
-- Storage: fotos de prueba (bucket publico de lectura, cada uno sube a su carpeta)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('proofs', 'proofs', true)
on conflict (id) do nothing;

create policy "subir mis pruebas" on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "borrar mis pruebas" on storage.objects for delete to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Realtime: ver al instante cuando el otro marca un reto
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.daily_logs, public.penalties;
