import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const MINECRAFT_EVENT_TYPES = [
  "NETHER_ENTERED",
  "BLAZE_ROD_OBTAINED",
  "END_ENTERED",
  "ENDER_DRAGON_KILLED",
] as const;

const minecraftCauses = [
  "SKELETON", "CREEPER", "ZOMBIE", "SPIDER", "ENDERMAN", "BLAZE", "GHAST",
  "PIGLIN", "HOGLIN", "WITHER_SKELETON", "ENDER_DRAGON", "END_CRYSTAL", "LAVA",
  "FALL", "DROWNING", "FIRE", "EXPLOSION", "VOID", "SUFFOCATION", "PLAYER", "OTHER",
] as const;

const timestamp = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Timestamp inválido.");

export const deathWebhookSchema = z.object({
  eventId: z.string().uuid(),
  player: z.string().trim().min(1).max(60),
  uuid: z.string().uuid(),
  cause: z.enum(minecraftCauses),
  dimension: z.enum(["OVERWORLD", "NETHER", "THE_END"]),
  deathMessage: z.string().trim().min(1).max(500),
  timestamp,
});

export const progressWebhookSchema = z.object({
  eventId: z.string().uuid(),
  player: z.string().trim().min(1).max(60),
  type: z.enum([...MINECRAFT_EVENT_TYPES, "CONNECTION_TEST"]),
  timestamp,
});

const causeLabels: Record<(typeof minecraftCauses)[number], string> = {
  SKELETON: "Skeleton",
  CREEPER: "Creeper",
  ZOMBIE: "Zombie",
  SPIDER: "Spider",
  ENDERMAN: "Enderman",
  BLAZE: "Blaze",
  GHAST: "Ghast",
  PIGLIN: "Piglin",
  HOGLIN: "Hoglin",
  WITHER_SKELETON: "Wither Skeleton",
  ENDER_DRAGON: "Ender Dragon",
  END_CRYSTAL: "End Crystal",
  LAVA: "Lava",
  FALL: "Caída",
  DROWNING: "Ahogado",
  FIRE: "Fuego",
  EXPLOSION: "Explosión",
  VOID: "Void",
  SUFFOCATION: "Suffocation",
  PLAYER: "Otro jugador",
  OTHER: "Otra",
};

const dimensionLabels = {
  OVERWORLD: "Overworld",
  NETHER: "Nether",
  THE_END: "The End",
} as const;

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function authenticateMinecraftWebhook(request: Request) {
  const secret = process.env.MINECRAFT_WEBHOOK_SECRET;
  if (!secret) return { ok: false as const, status: 503, error: "Webhook de Minecraft no configurado." };

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const accepted = timingSafeEqual(digest(token), digest(secret));
  return accepted
    ? { ok: true as const }
    : { ok: false as const, status: 401, error: "No autorizado." };
}

export function normalizeDeathPayload(payload: z.infer<typeof deathWebhookSchema>) {
  return {
    eventId: payload.eventId,
    player: payload.player,
    minecraftUuid: payload.uuid,
    cause: causeLabels[payload.cause],
    dimension: dimensionLabels[payload.dimension],
    deathMessage: payload.deathMessage,
    occurredAt: new Date(payload.timestamp).toISOString(),
  };
}

export function normalizeEventTimestamp(value: string) {
  return new Date(value).toISOString();
}

export function minecraftRpcErrorStatus(message: string) {
  if (message.includes("No hay un TRY activo")) return 409;
  if (message.includes("Jugador de Minecraft no registrado")) return 404;
  if (message.includes("inválido")) return 400;
  return 500;
}

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
