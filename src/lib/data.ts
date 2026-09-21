import "server-only";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { demoEvents, demoPlayers, demoPunishments, demoRuns } from "@/lib/demo-data";
import type { AppData, Player, Punishment, Run, RunEvent } from "@/types/database";

export async function getAppData(): Promise<AppData> {
  if (!isSupabaseConfigured()) {
    return { players: demoPlayers, runs: demoRuns, punishments: demoPunishments, isDemo: true };
  }

  try {
    const supabase = createAdminClient();
    const [playersResult, runsResult, punishmentsResult] = await Promise.all([
      supabase.from("players").select("*").order("created_at"),
      supabase.from("runs").select("*, dead_player:players(*)").order("try_number", { ascending: false }),
      supabase.from("punishments").select("*, punished_player:players(*)").order("punishment_number", { ascending: false }),
    ]);

    const error = playersResult.error || runsResult.error || punishmentsResult.error;
    if (error) throw error;

    return {
      players: (playersResult.data ?? []) as Player[],
      runs: (runsResult.data ?? []) as unknown as Run[],
      punishments: (punishmentsResult.data ?? []) as unknown as Punishment[],
      isDemo: false,
    };
  } catch (error) {
    console.error("No se pudo leer Supabase:", error);
    return {
      players: demoPlayers,
      runs: demoRuns,
      punishments: demoPunishments,
      isDemo: true,
      error: "No se pudo conectar con Supabase. Se muestran datos de demostración.",
    };
  }
}

export async function getRun(id: string): Promise<{ run: Run | null; events: RunEvent[]; isDemo: boolean }> {
  if (!isSupabaseConfigured()) {
    return { run: demoRuns.find((run) => run.id === id) ?? null, events: demoEvents.filter((event) => event.run_id === id), isDemo: true };
  }
  const supabase = createAdminClient();
  const [runResult, eventsResult] = await Promise.all([
    supabase.from("runs").select("*, dead_player:players(*)").eq("id", id).maybeSingle(),
    supabase.from("events").select("*").eq("run_id", id).order("happened_at"),
  ]);
  if (runResult.error) throw runResult.error;
  if (eventsResult.error) throw eventsResult.error;
  return {
    run: runResult.data as unknown as Run | null,
    events: (eventsResult.data ?? []) as RunEvent[],
    isDemo: false,
  };
}
