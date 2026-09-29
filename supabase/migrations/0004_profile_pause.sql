-- DayDay: cada jugador puede pausar su participacion. En pausa no aparece en el reto
-- ni genera multas; sus multas anteriores se conservan en el bote.

alter table public.profiles add column active boolean not null default true;

create or replace function public.close_day(p_date date)
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
  join public.profiles p on p.id = c.user_id and p.active
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
