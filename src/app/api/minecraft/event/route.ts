import { revalidatePath } from "next/cache";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  authenticateMinecraftWebhook,
  jsonResponse,
  minecraftRpcErrorStatus,
  normalizeEventTimestamp,
  progressWebhookSchema,
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

  const parsed = progressWebhookSchema.safeParse(body);
  if (!parsed.success) return jsonResponse({ ok: false, error: "Payload inválido.", details: parsed.error.flatten().fieldErrors }, 400);

  const supabase = createAdminClient();
  if (parsed.data.type === "CONNECTION_TEST") {
    const { data, error } = await supabase.from("runs").select("try_number,status").eq("status", "active").maybeSingle();
    if (error) return jsonResponse({ ok: false, error: "No se pudo comprobar la base de datos." }, 500);
    return jsonResponse({ ok: true, connected: true, activeTry: data?.try_number ?? null });
  }

  const { data, error } = await supabase.rpc("process_minecraft_progress", {
    p_event_id: parsed.data.eventId,
    p_player_name: parsed.data.player,
    p_event_type: parsed.data.type,
    p_occurred_at: normalizeEventTimestamp(parsed.data.timestamp),
  });

  if (error) {
    console.error("Minecraft progress webhook failed:", error.message);
    return jsonResponse({ ok: false, error: error.message }, minecraftRpcErrorStatus(error.message));
  }

  revalidatePath("/", "layout");
  revalidatePath("/overlay");
  return jsonResponse(data);
}
