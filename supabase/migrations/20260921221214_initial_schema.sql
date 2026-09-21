create extension if not exists pgcrypto;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  nickname text check (nickname is null or char_length(nickname) <= 60),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 500),
  created_at timestamptz not null default now()
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  try_number integer not null unique check (try_number > 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  status text not null default 'active' check (status in ('active', 'failed', 'completed', 'cancelled')),
  progress_stage smallint not null default 0 check (progress_stage between 0 and 10),
  dead_player_id uuid references public.players(id) on delete restrict,
  death_cause text check (death_cause is null or char_length(death_cause) between 1 and 80),
  dimension text check (dimension is null or dimension in ('Overworld', 'Nether', 'The End')),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  constraint run_time_order check (ended_at is null or ended_at >= started_at),
  constraint run_state_shape check (
    (status = 'active' and ended_at is null and duration_seconds is null and dead_player_id is null and death_cause is null and dimension is null)
    or (status = 'failed' and ended_at is not null and duration_seconds is not null and dead_player_id is not null and death_cause is not null and dimension is not null)
    or (status in ('completed', 'cancelled') and ended_at is not null and duration_seconds is not null and dead_player_id is null and death_cause is null and dimension is null)
  )
);

create unique index one_active_run on public.runs ((status)) where status = 'active';
create index runs_started_at_idx on public.runs (started_at desc);
create index runs_dead_player_idx on public.runs (dead_player_id) where dead_player_id is not null;
create index runs_status_idx on public.runs (status);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index events_run_time_idx on public.events (run_id, happened_at);

create table public.punishments (
  id uuid primary key default gen_random_uuid(),
  punishment_number integer not null unique check (punishment_number > 0),
  run_ids uuid[] not null check (cardinality(run_ids) = 3),
  punished_player_id uuid not null references public.players(id) on delete restrict,
  instagram_note text check (instagram_note is null or char_length(instagram_note) <= 160),
  occurred_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);
create index punishments_player_idx on public.punishments (punished_player_id);
create index punishments_status_idx on public.punishments (status);

alter table public.players enable row level security;
alter table public.runs enable row level security;
alter table public.events enable row level security;
alter table public.punishments enable row level security;

-- La app no usa Supabase Auth: anon/authenticated no pueden leer ni escribir.
revoke all on table public.players, public.runs, public.events, public.punishments from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.players, public.runs, public.events, public.punishments to service_role;

create or replace function public.start_next_run()
returns public.runs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_run public.runs;
begin
  if exists (select 1 from public.runs where status = 'active') then
    raise exception 'Ya existe un TRY activo';
  end if;
  insert into public.runs (try_number, started_at, status, progress_stage)
  values ((select coalesce(max(try_number), 0) + 1 from public.runs), now(), 'active', 0)
  returning * into created_run;
  return created_run;
end;
$$;

create or replace function public.fail_active_run(
  p_player_id uuid,
  p_death_cause text,
  p_dimension text,
  p_progress_stage smallint,
  p_comment text default null
)
returns public.runs
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.runs;
  failed_ids uuid[];
  punished uuid;
begin
  select * into target from public.runs where status = 'active' for update;
  if target.id is null then raise exception 'No hay un TRY activo'; end if;
  if not exists (select 1 from public.players where id = p_player_id) then raise exception 'Jugador inválido'; end if;

  update public.runs set
    status = 'failed', ended_at = now(),
    duration_seconds = greatest(0, floor(extract(epoch from (now() - started_at)))::integer),
    progress_stage = p_progress_stage, dead_player_id = p_player_id,
    death_cause = p_death_cause, dimension = p_dimension,
    comment = nullif(trim(p_comment), '')
  where id = target.id returning * into target;

  select array_agg(id order by try_number) into failed_ids
  from (
    select r.id, r.try_number from public.runs r
    where r.status = 'failed'
      and not exists (select 1 from public.punishments p where r.id = any(p.run_ids))
    order by r.try_number desc limit 3
  ) recent;

  if cardinality(failed_ids) = 3 then
    select r.dead_player_id into punished
    from public.runs r where r.id = any(failed_ids)
    group by r.dead_player_id
    order by count(*) desc, max(r.try_number) desc limit 1;

    insert into public.punishments (punishment_number, run_ids, punished_player_id, occurred_at)
    values ((select coalesce(max(punishment_number), 0) + 1 from public.punishments), failed_ids, punished, now());
  end if;
  return target;
end;
$$;

create or replace function public.complete_active_run()
returns public.runs
language plpgsql
security invoker
set search_path = ''
as $$
declare target public.runs;
begin
  select * into target from public.runs where status = 'active' for update;
  if target.id is null then raise exception 'No hay un TRY activo'; end if;
  update public.runs set status='completed', ended_at=now(), duration_seconds=greatest(0,floor(extract(epoch from (now()-started_at)))::integer), progress_stage=10
  where id=target.id returning * into target;
  return target;
end;
$$;

create or replace function public.cancel_active_run()
returns public.runs
language plpgsql
security invoker
set search_path = ''
as $$
declare target public.runs;
begin
  select * into target from public.runs where status = 'active' for update;
  if target.id is null then raise exception 'No hay un TRY activo'; end if;
  update public.runs set status='cancelled', ended_at=now(), duration_seconds=greatest(0,floor(extract(epoch from (now()-started_at)))::integer), progress_stage=0
  where id=target.id returning * into target;
  return target;
end;
$$;

revoke all on function public.start_next_run() from public, anon, authenticated;
revoke all on function public.fail_active_run(uuid,text,text,smallint,text) from public, anon, authenticated;
revoke all on function public.complete_active_run() from public, anon, authenticated;
revoke all on function public.cancel_active_run() from public, anon, authenticated;
grant execute on function public.start_next_run() to service_role;
grant execute on function public.fail_active_run(uuid,text,text,smallint,text) to service_role;
grant execute on function public.complete_active_run() to service_role;
grant execute on function public.cancel_active_run() to service_role;

comment on table public.runs is 'Intentos Hardcore. Las estadísticas se derivan de este historial.';
comment on column public.runs.progress_stage is 'Índice 0-10 definido en src/lib/game-config.ts.';
