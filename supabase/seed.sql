-- Datos de demostración idempotentes. Ejecuta después de la migración.
insert into public.players (id,name,nickname) values
('10000000-0000-0000-0000-000000000001','Bayron','B4YR0N'),
('10000000-0000-0000-0000-000000000002','Yaron','Y4R0N'),
('10000000-0000-0000-0000-000000000003','Jugador 3','Steve')
on conflict (id) do update set name=excluded.name,nickname=excluded.nickname;

insert into public.runs (id,try_number,started_at,ended_at,duration_seconds,status,progress_stage,dead_player_id,death_cause,dimension,comment) values
('20000000-0000-0000-0000-000000000001',1,'2026-08-12 18:00+00','2026-08-12 18:09+00',540,'failed',0,'10000000-0000-0000-0000-000000000001','Skeleton','Overworld','Ni siquiera encontramos hierro.'),
('20000000-0000-0000-0000-000000000002',2,'2026-08-18 19:00+00','2026-08-18 21:06+00',7560,'failed',4,'10000000-0000-0000-0000-000000000003','Wither Skeleton','Nether',null),
('20000000-0000-0000-0000-000000000003',3,'2026-08-24 18:00+00','2026-08-24 18:38+00',2280,'failed',2,'10000000-0000-0000-0000-000000000002','Caída','Overworld','Se tiró a una ravine sin agua.'),
('20000000-0000-0000-0000-000000000004',4,'2026-08-29 18:00+00','2026-08-29 23:48+00',20880,'failed',9,'10000000-0000-0000-0000-000000000003','Ender Dragon','The End','El dragón hizo un giro que nadie vio venir.'),
('20000000-0000-0000-0000-000000000005',5,'2026-09-03 20:00+00','2026-09-03 21:31+00',5460,'failed',3,'10000000-0000-0000-0000-000000000001','Ghast','Nether',null),
('20000000-0000-0000-0000-000000000006',6,'2026-09-07 17:00+00','2026-09-07 19:43+00',9780,'failed',5,'10000000-0000-0000-0000-000000000001','Lava','Nether','Cavó recto hacia el lago equivocado.'),
('20000000-0000-0000-0000-000000000007',7,'2026-09-11 19:00+00','2026-09-11 19:17+00',1020,'failed',1,'10000000-0000-0000-0000-000000000003','Creeper','Overworld','La clásica: silencio, siseo y pantalla roja.'),
('20000000-0000-0000-0000-000000000008',8,'2026-09-14 18:00+00','2026-09-14 22:12+00',15120,'failed',8,'10000000-0000-0000-0000-000000000002','Enderman','The End','Miró al Enderman justo antes de entrar al portal.'),
('20000000-0000-0000-0000-000000000009',9,now()-interval '1 hour 20 minutes',null,null,'active',3,null,null,null,null)
on conflict (id) do nothing;

insert into public.events (id,run_id,title,happened_at) values
('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','Entramos al Nether','2026-09-14 18:52+00'),
('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000008','Encontramos la fortaleza','2026-09-14 19:37+00'),
('40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000008','Entramos a The End','2026-09-14 21:58+00')
on conflict (id) do nothing;

insert into public.punishments (id,punishment_number,run_ids,punished_player_id,instagram_note,occurred_at,status) values
('30000000-0000-0000-0000-000000000001',1,array['20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003']::uuid[],'10000000-0000-0000-0000-000000000002','No vuelvo a saltar sin cubeta 💧','2026-08-24 18:38+00','completed'),
('30000000-0000-0000-0000-000000000002',2,array['20000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000006']::uuid[],'10000000-0000-0000-0000-000000000001',null,'2026-09-07 19:43+00','pending')
on conflict (id) do nothing;
