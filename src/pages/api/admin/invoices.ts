// filepath: src/pages/api/admin/invoices.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { createInvoice, markInvoiceAsPaid } from "../../../lib/invoices";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAuthenticated } from "../../../lib/auth";
import { createNotification, messagePaymentReceived } from "../../../lib/notifications";
import { formatMoney } from "../../../lib/format";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  const authed = await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const invoice = await createInvoice(body);
      return new Response(JSON.stringify({ ok: true, invoice }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Superpoder Fase 3: Propuesta Aceptada -> Factura Anticipo 50% (o 100%) en 1 clic
    if (action === "create_from_proposal") {
      const { proposalId, percentage = 50 } = body;
      if (!proposalId) {
        return new Response(JSON.stringify({ ok: false, message: "proposalId requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data: proposal, error: propErr } = await supabaseAdmin
        .from("proposals")
        .select("*, clients(id, name, company)")
        .eq("id", proposalId)
        .single();

      if (propErr || !proposal) {
        return new Response(JSON.stringify({ ok: false, message: "Propuesta no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!proposal.client_id) {
        return new Response(
          JSON.stringify({ ok: false, message: "La propuesta debe tener un cliente asignado para emitir factura" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("proposal_id", proposal.id)
        .maybeSingle();

      const inv = proposal.investment || {};
      const currency = (inv.currency || "USD").toUpperCase();
      let baseAmount = 0;
      let planSuffix = "";

      if (inv.type === "plans" && Array.isArray(inv.plans)) {
        const chosen = inv.plans.find((p: any) => p.name === proposal.accepted_plan) || inv.plans[0];
        baseAmount = Number(chosen?.price || 0);
        if (chosen?.name) planSuffix = ` (Plan ${chosen.name})`;
      } else {
        baseAmount = Number(inv.amount || 0);
      }

      const pct = Math.min(100, Math.max(10, Number(percentage) || 50));
      const lineAmount = Math.round((baseAmount * (pct / 100)) * 100) / 100;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const invoice = await createInvoice({
        client_id: proposal.client_id,
        project_id: project?.id || undefined,
        proposal_id: proposal.id,
        currency,
        tax_rate: currency === "USD" ? 0 : 22,
        cfe_type: currency === "USD" ? "112" : "111",
        due_date: dueDate,
        notes: `Generada automáticamente desde propuesta "${proposal.project_title}" (${pct}%).`,
        items: [
          {
            description: `Anticipo ${pct}% — ${proposal.project_title}${planSuffix}`,
            quantity: 1,
            unit_price: lineAmount,
            tax_rate: currency === "USD" ? 0 : 22,
            total: lineAmount,
          },
        ],
      });

      return new Response(JSON.stringify({ ok: true, invoice }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "mark_paid" || action === "add_payment") {
      const result = await markInvoiceAsPaid(body.invoiceId, body.payment);

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
            webhookUrl: runtimeEnv.AUTOMATION_WEBHOOK_URL,
          });
        }
      }

      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, message: "Acción no reconocida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  const authed = await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ ok: false, message: "ID requerido" }), { status: 400 });

    const { error } = await supabaseAdmin.from("invoices").delete().eq("id", id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
