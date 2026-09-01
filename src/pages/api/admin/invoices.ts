// filepath: src/pages/api/admin/invoices.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { createInvoice, markInvoiceAsPaid } from "../../../lib/invoices";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAuthenticated } from "../../../lib/auth";
import { createNotification, messagePaymentReceived } from "../../../lib/notifications";
import { formatMoney } from "../../../lib/format";

export const POST: APIRoute = async ({ request, cookies }) => {
  const authed = await isAuthenticated(cookies, request);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const invoice = await createInvoice(body);
      return new Response(JSON.stringify({ ok: true, invoice }), { status: 200 });
    }

    if (action === "mark_paid" || action === "add_payment") {
      const result = await markInvoiceAsPaid(body.invoiceId, body.payment);

      // Notificación automática si se solicitó
      if (body.notifyClient && body.invoiceId) {
        const { data: inv } = await supabaseAdmin
          .from("invoices")
          .select("*, clients(name)")
          .eq("id", body.invoiceId)
          .single();

        if (inv) {
          const clientName = inv.clients?.name || "Cliente";
          await createNotification({
            type: "payment_received",
            invoiceId: inv.id,
            clientId: inv.client_id,
            message: messagePaymentReceived(clientName, formatMoney(body.payment.amount, inv.currency), inv.number),
            channel: "whatsapp",
          });
        }
      }

      return new Response(JSON.stringify({ ok: true, ...result }), { status: 200 });
    }

    if (action === "update_status") {
      const { error } = await supabaseAdmin
        .from("invoices")
        .update({
          status: body.status,
          paid_at: body.status === "paid" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.invoiceId);

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: false, message: "Acción no reconocida" }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const authed = await isAuthenticated(cookies, request);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ ok: false, message: "ID requerido" }), { status: 400 });

    const { error } = await supabaseAdmin.from("invoices").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};
