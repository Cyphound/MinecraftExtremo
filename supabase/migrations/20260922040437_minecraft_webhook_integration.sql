alter table public.players
  add column minecraft_uuid uuid;

create unique index players_minecraft_uuid_idx
  on public.players (minecraft_uuid)
  where minecraft_uuid is not null;

alter table public.runs
  add column minecraft_death_message text
  check (minecraft_death_message is null or char_length(minecraft_death_message) <= 500);

create table public.minecraft_webhook_events (
  event_id uuid primary key,
  event_type text not null check (char_length(event_type) between 2 and 60),
  run_id uuid references public.runs(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  player_name text check (player_name is null or char_length(player_name) <= 60),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index minecraft_webhook_events_run_idx
  on public.minecraft_webhook_events (run_id);

create index minecraft_webhook_events_player_idx
  on public.minecraft_webhook_events (player_id)
  where player_id is not null;

alter table public.minecraft_webhook_events enable row level security;
revoke all on table public.minecraft_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.minecraft_webhook_events to service_role;

create policy "deny client access to minecraft webhook events"
on public.minecraft_webhook_events for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.process_minecraft_death(
  p_event_id uuid,
  p_player_name text,
  p_minecraft_uuid uuid,
  p_death_cause text,
  p_dimension text,
  p_death_message text,
  p_occurred_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.runs;
  victim public.players;
  failed_ids uuid[];
  punished uuid;
  finished_at timestamptz;
begin
  insert into public.minecraft_webhook_events (
    event_id, event_type, player_name, occurred_at
  ) values (
    p_event_id, 'PLAYER_DEATH', left(trim(p_player_name), 60), p_occurred_at
  )
  on conflict (event_id) do nothing;

  if not found then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  select * into target
  from public.runs
  where status = 'active'
  for update;

  if target.id is null then
    raise exception using errcode = 'P0002', message = 'No hay un TRY activo';
  end if;

  select * into victim
  from public.players
  where minecraft_uuid = p_minecraft_uuid
     or (
       minecraft_uuid is null
       and (
         lower(name) = lower(trim(p_player_name))
         or lower(coalesce(nickname, '')) = lower(trim(p_player_name))
       )
     )
  order by (minecraft_uuid = p_minecraft_uuid) desc nulls last, created_at
  limit 1
  for update;

  if victim.id is null then
    raise exception using errcode = 'P0002', message = 'Jugador de Minecraft no registrado';
  end if;

  update public.players
  set minecraft_uuid = coalesce(minecraft_uuid, p_minecraft_uuid)
  where id = victim.id;

  finished_at := greatest(p_occurred_at, target.started_at);

  update public.runs set
    status = 'failed',
    ended_at = finished_at,
    duration_seconds = greatest(0, floor(extract(epoch from (finished_at - started_at)))::integer),
    dead_player_id = victim.id,
    death_cause = left(trim(p_death_cause), 80),
    dimension = p_dimension,
    minecraft_death_message = left(trim(p_death_message), 500)
  where id = target.id
  returning * into target;

  update public.minecraft_webhook_events
  set run_id = target.id, player_id = victim.id
  where event_id = p_event_id;

  select array_agg(id order by try_number) into failed_ids
  from (
    select r.id, r.try_number
    from public.runs r
    where r.status = 'failed'
      and not exists (
        select 1 from public.punishments p where r.id = any(p.run_ids)
      )
    order by r.try_number desc
    limit 3
  ) recent;

  if cardinality(failed_ids) = 3 then
    select r.dead_player_id into punished
    from public.runs r
    where r.id = any(failed_ids)
    group by r.dead_player_id
    order by count(*) desc, max(r.try_number) desc
    limit 1;

    insert into public.punishments (
      punishment_number, run_ids, punished_player_id, occurred_at
    ) values (
      (select coalesce(max(punishment_number), 0) + 1 from public.punishments),
      failed_ids,
      punished,
      finished_at
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'runId', target.id,
    'tryNumber', target.try_number,
    'status', target.status,
    'durationSeconds', target.duration_seconds
  );
end;
$$;

create or replace function public.process_minecraft_progress(
  p_event_id uuid,
  p_player_name text,
  p_event_type text,
  p_occurred_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.runs;
  new_progress_stage smallint;
  event_title text;
  finished_at timestamptz;
begin
  new_progress_stage := case p_event_type
    when 'NETHER_ENTERED' then 3
    when 'BLAZE_ROD_OBTAINED' then 5
    when 'END_ENTERED' then 8
    when 'ENDER_DRAGON_KILLED' then 10
    else null
  end;

  event_title := case p_event_type
    when 'NETHER_ENTERED' then trim(p_player_name) || ' entró al Nether'
    when 'BLAZE_ROD_OBTAINED' then trim(p_player_name) || ' obtuvo una Blaze Rod'
    when 'END_ENTERED' then trim(p_player_name) || ' entró a The End'
    when 'ENDER_DRAGON_KILLED' then 'El Ender Dragon fue derrotado'
    else null
  end;

  if new_progress_stage is null then
    raise exception using errcode = '22023', message = 'Tipo de evento de progreso inválido';
  end if;

  insert into public.minecraft_webhook_events (
    event_id, event_type, player_name, occurred_at
  ) values (
    p_event_id, p_event_type, left(trim(p_player_name), 60), p_occurred_at
  )
  on conflict (event_id) do nothing;

  if not found then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  select * into target
  from public.runs
  where status = 'active'
  for update;

  if target.id is null then
    raise exception using errcode = 'P0002', message = 'No hay un TRY activo';
  end if;

  if p_event_type = 'ENDER_DRAGON_KILLED' then
    finished_at := greatest(p_occurred_at, target.started_at);
    update public.runs set
      status = 'completed',
      ended_at = finished_at,
      duration_seconds = greatest(0, floor(extract(epoch from (finished_at - started_at)))::integer),
      progress_stage = greatest(public.runs.progress_stage, new_progress_stage)
    where id = target.id
    returning * into target;
  else
    update public.runs set
      progress_stage = greatest(public.runs.progress_stage, new_progress_stage)
    where id = target.id
    returning * into target;
  end if;

  insert into public.events (run_id, title, happened_at)
  values (target.id, left(event_title, 120), p_occurred_at);

  update public.minecraft_webhook_events
  set run_id = target.id
  where event_id = p_event_id;

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'runId', target.id,
    'tryNumber', target.try_number,
    'status', target.status,
    'progressStage', target.progress_stage
  );
end;
$$;

revoke all on function public.process_minecraft_death(uuid,text,uuid,text,text,text,timestamptz)
  from public, anon, authenticated;
revoke all on function public.process_minecraft_progress(uuid,text,text,timestamptz)
  from public, anon, authenticated;

grant execute on function public.process_minecraft_death(uuid,text,uuid,text,text,text,timestamptz)
  to service_role;
grant execute on function public.process_minecraft_progress(uuid,text,text,timestamptz)
  to service_role;

comment on column public.players.minecraft_uuid is 'UUID de Minecraft Java, vinculado por el webhook del servidor.';
comment on column public.runs.minecraft_death_message is 'Mensaje original enviado por PaperMC para la muerte que cerró el TRY.';
comment on table public.minecraft_webhook_events is 'Registro idempotente de webhooks recibidos desde el plugin PaperMC.';
