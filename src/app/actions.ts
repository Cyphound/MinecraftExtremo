"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertSession, createSession, destroySession, verifyPassword } from "@/lib/auth";
import { DEATH_CAUSES, DIMENSIONS, PROGRESS_STAGES } from "@/lib/game-config";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export type ActionState = { error?: string; success?: string } | undefined;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function refreshAll() {
  revalidatePath("/", "layout");
}

async function ready() {
  await assertSession();
  if (!isSupabaseConfigured()) throw new Error("Conecta Supabase para guardar cambios. Ahora estás viendo la demo local.");
  return createAdminClient();
}

const playerSchema = z.object({
  name: z.string().trim().min(1, "Escribe el nombre del jugador.").max(60),
  nickname: z.string().trim().max(60).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
});

export async function createPlayerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = playerSchema.parse({
      name: formData.get("name"),
      nickname: formData.get("nickname") || undefined,
      avatarUrl: formData.get("avatarUrl") || undefined,
    });
    const supabase = await ready();
    const { error } = await supabase.from("players").insert({
      name: parsed.name,
      nickname: parsed.nickname || null,
      avatar_url: parsed.avatarUrl || null,
    });
    if (error) throw error;
    refreshAll();
    revalidatePath("/players");
    return { success: "Jugador registrado en el Realm." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.APP_PASSWORD) return { error: "Configura APP_PASSWORD antes de acceder." };
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta." };
  await createSession();
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const deathSchema = z.object({
  playerId: z.string().uuid(),
  cause: z.string().min(1).max(80),
  customCause: z.string().trim().max(80).optional(),
  dimension: z.enum(DIMENSIONS),
  progressStage: z.coerce.number().int().min(0).max(PROGRESS_STAGES.length - 1),
  comment: z.string().trim().max(500).optional(),
});

export async function registerDeathAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = deathSchema.parse({
      playerId: formData.get("playerId"),
      cause: formData.get("cause"),
      customCause: formData.get("customCause") || undefined,
      dimension: formData.get("dimension"),
      progressStage: formData.get("progressStage"),
      comment: formData.get("comment") || undefined,
    });
    if (!DEATH_CAUSES.includes(parsed.cause as (typeof DEATH_CAUSES)[number])) throw new Error("Causa de muerte inválida.");
    if (parsed.cause === "Otra" && !parsed.customCause) throw new Error("Escribe la causa personalizada.");
    const supabase = await ready();
    const { error } = await supabase.rpc("fail_active_run", {
      p_player_id: parsed.playerId,
      p_death_cause: parsed.cause === "Otra" ? parsed.customCause : parsed.cause,
      p_dimension: parsed.dimension,
      p_progress_stage: parsed.progressStage,
      p_comment: parsed.comment || null,
    });
    if (error) throw error;
    refreshAll();
    return { success: "Muerte registrada. El TRY terminó para todos." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function startNextRunAction() {
  const supabase = await ready();
  const { error } = await supabase.rpc("start_next_run");
  if (error) throw error;
  refreshAll();
}

export async function completeRunAction() {
  const supabase = await ready();
  const { error } = await supabase.rpc("complete_active_run");
  if (error) throw error;
  refreshAll();
}

export async function cancelRunAction() {
  const supabase = await ready();
  const { error } = await supabase.rpc("cancel_active_run");
  if (error) throw error;
  refreshAll();
}

const updateRunSchema = z.object({
  runId: z.string().uuid(),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  status: z.enum(["active", "failed", "completed", "cancelled"]),
  progressStage: z.coerce.number().int().min(0).max(PROGRESS_STAGES.length - 1),
  deadPlayerId: z.string().uuid().or(z.literal("")),
  deathCause: z.string().trim().max(80).optional(),
  dimension: z.enum(DIMENSIONS).or(z.literal("")),
  comment: z.string().trim().max(500).optional(),
});

export async function updateRunAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = updateRunSchema.parse({
      runId: formData.get("runId"), startedAt: formData.get("startedAt"), endedAt: formData.get("endedAt") || undefined,
      status: formData.get("status"), progressStage: formData.get("progressStage"), deadPlayerId: formData.get("deadPlayerId") ?? "",
      deathCause: formData.get("deathCause") || undefined, dimension: formData.get("dimension") ?? "", comment: formData.get("comment") || undefined,
    });
    const started = new Date(parsed.startedAt);
    const ended = parsed.endedAt ? new Date(parsed.endedAt) : null;
    if (Number.isNaN(started.valueOf()) || (ended && Number.isNaN(ended.valueOf()))) throw new Error("Fecha inválida.");
    const supabase = await ready();
    const { error } = await supabase.from("runs").update({
      started_at: started.toISOString(), ended_at: ended?.toISOString() ?? null,
      duration_seconds: ended ? Math.max(0, Math.floor((ended.valueOf() - started.valueOf()) / 1000)) : null,
      status: parsed.status, progress_stage: parsed.progressStage, dead_player_id: parsed.deadPlayerId || null,
      death_cause: parsed.deathCause || null, dimension: parsed.dimension || null, comment: parsed.comment || null,
    }).eq("id", parsed.runId);
    if (error) throw error;
    refreshAll();
    return { success: "TRY actualizado." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function addEventAction(formData: FormData) {
  const schema = z.object({ runId: z.string().uuid(), title: z.string().trim().min(2).max(120) });
  const parsed = schema.parse({ runId: formData.get("runId"), title: formData.get("title") });
  const supabase = await ready();
  const { error } = await supabase.from("events").insert({ run_id: parsed.runId, title: parsed.title });
  if (error) throw error;
  refreshAll();
}

export async function deleteEventAction(formData: FormData) {
  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const supabase = await ready();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
  refreshAll();
}

export async function updatePunishmentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "completed"]),
      note: z.string().trim().max(160).optional(),
    }).parse({ id: formData.get("id"), status: formData.get("status"), note: formData.get("note") || undefined });
    const supabase = await ready();
    const { error } = await supabase.from("punishments").update({ status: parsed.status, instagram_note: parsed.note || null }).eq("id", parsed.id);
    if (error) throw error;
    refreshAll();
    return { success: "Castigo actualizado." };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
