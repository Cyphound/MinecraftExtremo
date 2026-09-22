import { revalidatePath } from "next/cache";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  authenticateMinecraftWebhook,
  deathWebhookSchema,
  jsonResponse,
  minecraftRpcErrorStatus,
  normalizeDeathPayload,
} from "@/lib/minecraft-webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = authenticateMinecraftWebhook(request);
  if (!auth.ok) return jsonResponse({ ok: false, error: auth.error }, auth.status);
  if (!isSupabaseConfigured()) return jsonResponse({ ok: false, error: "Base de datos no configurada." }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "El cuerpo debe ser JSON válido." }, 400);
  }

  const parsed = deathWebhookSchema.safeParse(body);
  if (!parsed.success) return jsonResponse({ ok: false, error: "Payload inválido.", details: parsed.error.flatten().fieldErrors }, 400);

  const payload = normalizeDeathPayload(parsed.data);
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("process_minecraft_death", {
    p_event_id: payload.eventId,
    p_player_name: payload.player,
    p_minecraft_uuid: payload.minecraftUuid,
    p_death_cause: payload.cause,
    p_dimension: payload.dimension,
    p_death_message: payload.deathMessage,
    p_occurred_at: payload.occurredAt,
  });

  if (error) {
    console.error("Minecraft death webhook failed:", error.message);
    return jsonResponse({ ok: false, error: error.message }, minecraftRpcErrorStatus(error.message));
  }

  revalidatePath("/", "layout");
  revalidatePath("/overlay");
  return jsonResponse(data);
}
