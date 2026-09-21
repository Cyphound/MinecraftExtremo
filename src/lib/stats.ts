import { PROGRESS_STAGES, progressName } from "@/lib/game-config";
import type { Dimension, Player, Run } from "@/types/database";

type Count = { label: string; value: number };

function countBy(values: (string | null)[]): Count[] {
  const counts = new Map<string, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function concluded(runs: Run[]) {
  return runs.filter((run) => run.status === "failed" || run.status === "completed");
}

export function currentStreak(playerId: string, runs: Run[]) {
  let streak = 0;
  for (const run of concluded(runs).sort((a, b) => b.try_number - a.try_number)) {
    if (run.dead_player_id === playerId) break;
    streak += 1;
  }
  return streak;
}

export function maxStreak(playerId: string, runs: Run[]) {
  let best = 0;
  let streak = 0;
  for (const run of concluded(runs).sort((a, b) => a.try_number - b.try_number)) {
    if (run.dead_player_id === playerId) streak = 0;
    else {
      streak += 1;
      best = Math.max(best, streak);
    }
  }
  return best;
}

export function playerStats(player: Player, runs: Run[]) {
  const deaths = runs.filter((run) => run.status === "failed" && run.dead_player_id === player.id);
  const allDeaths = runs.filter((run) => run.status === "failed").length;
  const byDimension = (dimension: Dimension) => deaths.filter((run) => run.dimension === dimension).length;
  return {
    deaths: deaths.length,
    percentage: allDeaths ? Math.round((deaths.length / allDeaths) * 100) : 0,
    overworld: byDimension("Overworld"),
    nether: byDimension("Nether"),
    end: byDimension("The End"),
    currentStreak: currentStreak(player.id, runs),
    maxStreak: maxStreak(player.id, runs),
    topDimension: countBy(deaths.map((run) => run.dimension))[0]?.label ?? "—",
    topCause: countBy(deaths.map((run) => run.death_cause))[0]?.label ?? "—",
  };
}

export function globalStats(runs: Run[], players: Player[]) {
  const finished = concluded(runs);
  const failed = runs.filter((run) => run.status === "failed");
  const durations = finished.filter((run) => run.duration_seconds != null);
  const longest = durations.reduce<Run | null>((best, run) => !best || (run.duration_seconds ?? 0) > (best.duration_seconds ?? 0) ? run : best, null);
  const shortest = durations.reduce<Run | null>((best, run) => !best || (run.duration_seconds ?? 0) < (best.duration_seconds ?? 0) ? run : best, null);
  const maxProgress = runs.reduce((max, run) => Math.max(max, run.progress_stage), 0);
  const ranking = players.map((player) => ({ player, ...playerStats(player, runs) })).sort((a, b) => b.deaths - a.deaths);
  const causeCounts = countBy(failed.map((run) => run.death_cause));
  const dimensionCounts = countBy(failed.map((run) => run.dimension));
  const totalDuration = finished.reduce((sum, run) => sum + (run.duration_seconds ?? 0), 0);
  const netherReached = finished.filter((run) => run.progress_stage >= 3).length;
  const endReached = finished.filter((run) => run.progress_stage >= 8).length;
  return {
    totalRuns: runs.filter((run) => run.status !== "cancelled").length,
    totalDeaths: failed.length,
    current: runs.find((run) => run.status === "active") ?? runs[0] ?? null,
    longest,
    shortest,
    maxProgress,
    bestProgress: progressName(maxProgress),
    netherReached,
    endReached,
    victories: runs.filter((run) => run.status === "completed").length,
    totalDuration,
    averageDuration: durations.length ? Math.round(totalDuration / durations.length) : 0,
    ranking,
    mostDeaths: ranking[0] ?? null,
    leastDeaths: [...ranking].sort((a, b) => a.deaths - b.deaths)[0] ?? null,
    causeCounts,
    dimensionCounts,
    topCause: causeCounts[0]?.label ?? "—",
    deadliestDimension: dimensionCounts[0]?.label ?? "—",
    netherPercentage: finished.length ? Math.round((netherReached / finished.length) * 100) : 0,
    endPercentage: finished.length ? Math.round((endReached / finished.length) * 100) : 0,
    progressScale: PROGRESS_STAGES.length - 1,
  };
}
