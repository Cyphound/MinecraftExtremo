-- This app deliberately has no Supabase Auth users. All access is performed by
-- the server-only secret/service role after the shared app password is checked.
-- Explicit deny policies document that model and keep the database advisor clean.

create policy "deny client access to players"
on public.players for all
to anon, authenticated
using (false)
with check (false);

create policy "deny client access to runs"
on public.runs for all
to anon, authenticated
using (false)
with check (false);

create policy "deny client access to events"
on public.events for all
to anon, authenticated
using (false)
with check (false);

create policy "deny client access to punishments"
on public.punishments for all
to anon, authenticated
using (false)
with check (false);
