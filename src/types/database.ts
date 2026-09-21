export type RunStatus = "active" | "failed" | "completed" | "cancelled";
export type Dimension = "Overworld" | "Nether" | "The End";
export type PunishmentStatus = "pending" | "completed";

export interface Player {
  id: string;
  name: string;
  nickname: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Run {
  id: string;
  try_number: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: RunStatus;
  progress_stage: number;
  dead_player_id: string | null;
  death_cause: string | null;
  dimension: Dimension | null;
  comment: string | null;
  created_at: string;
  dead_player?: Player | null;
}

export interface RunEvent {
  id: string;
  run_id: string;
  title: string;
  happened_at: string;
  created_at: string;
}

export interface Punishment {
  id: string;
  punishment_number: number;
  run_ids: string[];
  punished_player_id: string;
  instagram_note: string | null;
  occurred_at: string;
  status: PunishmentStatus;
  created_at: string;
  punished_player?: Player | null;
}

export interface AppData {
  players: Player[];
  runs: Run[];
  punishments: Punishment[];
  isDemo: boolean;
  error?: string;
}
