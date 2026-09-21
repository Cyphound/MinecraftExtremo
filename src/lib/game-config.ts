export const PROGRESS_STAGES = [
  "Inicio",
  "Hierro",
  "Diamante",
  "Nether",
  "Fortaleza del Nether",
  "Blaze Rods",
  "Ender Pearls / Eyes of Ender",
  "Stronghold",
  "The End",
  "Ender Dragon",
  "Victoria",
] as const;

export const DEATH_CAUSES = [
  "Creeper",
  "Zombie",
  "Skeleton",
  "Spider",
  "Enderman",
  "Blaze",
  "Ghast",
  "Piglin",
  "Hoglin",
  "Wither Skeleton",
  "Ender Dragon",
  "End Crystal",
  "Lava",
  "Caída",
  "Ahogado",
  "Fuego",
  "Explosión",
  "Void",
  "Suffocation",
  "Otro jugador",
  "Otra",
] as const;

export const DIMENSIONS = ["Overworld", "Nether", "The End"] as const;

export function progressName(stage: number) {
  return PROGRESS_STAGES[Math.max(0, Math.min(stage, PROGRESS_STAGES.length - 1))];
}
