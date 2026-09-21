-- Borra solamente las filas de demostración con UUIDs reservados.
delete from public.events where id::text like '40000000-0000-0000-0000-%';
delete from public.punishments where id::text like '30000000-0000-0000-0000-%';
delete from public.runs where id::text like '20000000-0000-0000-0000-%';
delete from public.players where id::text like '10000000-0000-0000-0000-%';
