// filepath: src/pages/api/admin/notifications.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";
import { dispatchOutboundWebhook } from "../../../lib/notifications";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  if (!(await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { action, id, webhookUrl } = body;

    if (action === "mark_sent" && id) {
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ status: "sent" })
        .eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "resend_webhook" && id) {
      const { data: notif, error } = await supabaseAdmin
        .from("notifications")
        .select("*, clients(name, phone, email)")
        .eq("id", id)
        .single();
      if (error || !notif) {
        return new Response(JSON.stringify({ ok: false, message: "Notificación no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const targetUrl = webhookUrl || runtimeEnv.AUTOMATION_WEBHOOK_URL;
      const result = await dispatchOutboundWebhook(
        {
          event: notif.type,
          notification_id: notif.id,
          channel: notif.channel,
          message: notif.message,
          client: notif.clients || null,
        },
        targetUrl
      );

      if (result.delivered) {
        await supabaseAdmin.from("notifications").update({ status: "sent" }).eq("id", id);
      }

      return new Response(JSON.stringify({ ok: result.delivered, ...result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "test_webhook") {
      const targetUrl = webhookUrl || runtimeEnv.AUTOMATION_WEBHOOK_URL;
      const result = await dispatchOutboundWebhook(
        {
          event: "webhook_test",
          message: "Ping de prueba desde Amargo Studio OS",
        },
        targetUrl
      );

      return new Response(JSON.stringify({ ok: result.delivered, ...result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, message: "Acción no válida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, message: err instanceof Error ? err.message : "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
