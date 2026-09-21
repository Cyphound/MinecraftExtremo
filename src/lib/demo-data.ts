import type { Player, Punishment, Run, RunEvent } from "@/types/database";

const players: Player[] = [
  { id: "10000000-0000-0000-0000-000000000001", name: "Bayron", nickname: "B4YR0N", avatar_url: null, created_at: "2026-08-01T12:00:00Z" },
  { id: "10000000-0000-0000-0000-000000000002", name: "Yaron", nickname: "Y4R0N", avatar_url: null, created_at: "2026-08-01T12:00:00Z" },
  { id: "10000000-0000-0000-0000-000000000003", name: "Jugador 3", nickname: "Steve", avatar_url: null, created_at: "2026-08-01T12:00:00Z" },
];

const rawRuns: Omit<Run, "dead_player">[] = [
  { id: "20000000-0000-0000-0000-000000000009", try_number: 9, started_at: new Date(Date.now() - 4_807_000).toISOString(), ended_at: null, duration_seconds: null, status: "active", progress_stage: 3, dead_player_id: null, death_cause: null, dimension: null, comment: null, created_at: new Date(Date.now() - 4_807_000).toISOString() },
  { id: "20000000-0000-0000-0000-000000000008", try_number: 8, started_at: "2026-09-14T18:00:00Z", ended_at: "2026-09-14T22:12:00Z", duration_seconds: 15120, status: "failed", progress_stage: 8, dead_player_id: players[1].id, death_cause: "Enderman", dimension: "The End", comment: "Miró al Enderman justo antes de entrar al portal.", created_at: "2026-09-14T18:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000007", try_number: 7, started_at: "2026-09-11T19:00:00Z", ended_at: "2026-09-11T19:17:00Z", duration_seconds: 1020, status: "failed", progress_stage: 1, dead_player_id: players[2].id, death_cause: "Creeper", dimension: "Overworld", comment: "La clásica: silencio, siseo y pantalla roja.", created_at: "2026-09-11T19:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000006", try_number: 6, started_at: "2026-09-07T17:00:00Z", ended_at: "2026-09-07T19:43:00Z", duration_seconds: 9780, status: "failed", progress_stage: 5, dead_player_id: players[0].id, death_cause: "Lava", dimension: "Nether", comment: "Cavó recto hacia el lago equivocado.", created_at: "2026-09-07T17:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000005", try_number: 5, started_at: "2026-09-03T20:00:00Z", ended_at: "2026-09-03T21:31:00Z", duration_seconds: 5460, status: "failed", progress_stage: 3, dead_player_id: players[0].id, death_cause: "Ghast", dimension: "Nether", comment: null, created_at: "2026-09-03T20:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000004", try_number: 4, started_at: "2026-08-29T18:00:00Z", ended_at: "2026-08-29T23:48:00Z", duration_seconds: 20880, status: "failed", progress_stage: 9, dead_player_id: players[2].id, death_cause: "Ender Dragon", dimension: "The End", comment: "El dragón hizo un giro que nadie vio venir.", created_at: "2026-08-29T18:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000003", try_number: 3, started_at: "2026-08-24T18:00:00Z", ended_at: "2026-08-24T18:38:00Z", duration_seconds: 2280, status: "failed", progress_stage: 2, dead_player_id: players[1].id, death_cause: "Caída", dimension: "Overworld", comment: "Se tiró a una ravine sin agua.", created_at: "2026-08-24T18:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000002", try_number: 2, started_at: "2026-08-18T19:00:00Z", ended_at: "2026-08-18T21:06:00Z", duration_seconds: 7560, status: "failed", progress_stage: 4, dead_player_id: players[2].id, death_cause: "Wither Skeleton", dimension: "Nether", comment: null, created_at: "2026-08-18T19:00:00Z" },
  { id: "20000000-0000-0000-0000-000000000001", try_number: 1, started_at: "2026-08-12T18:00:00Z", ended_at: "2026-08-12T18:09:00Z", duration_seconds: 540, status: "failed", progress_stage: 0, dead_player_id: players[0].id, death_cause: "Skeleton", dimension: "Overworld", comment: "Ni siquiera encontramos hierro.", created_at: "2026-08-12T18:00:00Z" },
];

export const demoRuns: Run[] = rawRuns.map((run) => ({
  ...run,
  dead_player: players.find((player) => player.id === run.dead_player_id) ?? null,
}));

export const demoPunishments: Punishment[] = [
  { id: "30000000-0000-0000-0000-000000000002", punishment_number: 2, run_ids: rawRuns.slice(2, 5).map((run) => run.id), punished_player_id: players[0].id, instagram_note: null, occurred_at: "2026-09-07T19:43:00Z", status: "pending", created_at: "2026-09-07T19:43:00Z", punished_player: players[0] },
  { id: "30000000-0000-0000-0000-000000000001", punishment_number: 1, run_ids: rawRuns.slice(6, 9).map((run) => run.id), punished_player_id: players[2].id, instagram_note: "No vuelvo a saltar sin cubeta 💧", occurred_at: "2026-08-24T18:38:00Z", status: "completed", created_at: "2026-08-24T18:38:00Z", punished_player: players[2] },
];

export const demoEvents: RunEvent[] = [
  { id: "40000000-0000-0000-0000-000000000001", run_id: rawRuns[1].id, title: "Entramos al Nether", happened_at: "2026-09-14T18:52:00Z", created_at: "2026-09-14T18:52:00Z" },
  { id: "40000000-0000-0000-0000-000000000002", run_id: rawRuns[1].id, title: "Encontramos la fortaleza", happened_at: "2026-09-14T19:37:00Z", created_at: "2026-09-14T19:37:00Z" },
  { id: "40000000-0000-0000-0000-000000000003", run_id: rawRuns[1].id, title: "Entramos a The End", happened_at: "2026-09-14T21:58:00Z", created_at: "2026-09-14T21:58:00Z" },
];

export const demoPlayers = players;
