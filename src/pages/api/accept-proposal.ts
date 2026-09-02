// filepath: src/pages/api/accept-proposal.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { DEFAULT_STAGES } from "../../lib/stages";
import { DEFAULT_TEMPLATES, renderContract } from "../../lib/contracts";
import { createNotification, messageProposalAccepted } from "../../lib/notifications";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, name, contact, plan } = body;

    if (!slug || !name?.trim() || !contact?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Buscar propuesta con cliente
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("*, clients(*)")
      .eq("slug", slug)
      .single();

    if (error || !proposal) {
      return new Response(
        JSON.stringify({ ok: false, reason: "not_found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (proposal.status === "disabled") {
      return new Response(
        JSON.stringify({ ok: false, reason: "disabled" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (proposal.status === "accepted") {
      return new Response(
        JSON.stringify({ ok: true, already: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Extraer detalles y precio del plan seleccionado
    const inv = proposal.investment || {};
    const plans = inv.plans || [];
    const chosenPlan = plans.find((p: any) => p.name === plan) || plans.find((p: any) => p.recommended || p.featured) || plans[0];
    const finalPrice = chosenPlan?.price || inv.amount || 0;
    const currency = inv.currency || "UYU";
    const billingPeriod = chosenPlan?.period || inv.paymentTerms || "Mensual";
    const planName = plan || chosenPlan?.name || "Servicio Digital";

    // 3. Actualizar propuesta con el plan y precio aceptado
    const { error: updateError } = await supabaseAdmin
      .from("proposals")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_name: name.trim(),
        accepted_contact: contact.trim(),
        accepted_plan: planName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    if (updateError) {
      console.error("Error updating proposal:", updateError);
      throw updateError;
    }

    // 4. Crear o sincronizar proyecto asociado en Pipeline con el presupuesto exacto
    const { data: existingProject } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("proposal_id", proposal.id)
      .maybeSingle();

    let projectId = existingProject?.id;

    if (!projectId) {
      const { data: project, error: projectError } = await supabaseAdmin
        .from("projects")
        .insert({
          client_id: proposal.client_id,
          proposal_id: proposal.id,
          title: proposal.project_title,
          status: "active",
          current_stage: 2, // Avanzar automáticamente a Kick-off y Contenidos
          stages: DEFAULT_STAGES,
          budget: finalPrice,
          currency: currency,
          start_date: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
      } else {
        projectId = project.id;
      }
    } else {
      await supabaseAdmin
        .from("projects")
        .update({
          budget: finalPrice,
          currency: currency,
          current_stage: 2,
        })
        .eq("id", projectId);
    }

    // 5. Generar Contrato Oficial automático en base al plan elegido
    try {
      const contractTemplate = DEFAULT_TEMPLATES[0].content;
      const contractText = renderContract(contractTemplate, {
        ...proposal,
        accepted_plan: planName,
        accepted_name: name.trim(),
        accepted_contact: contact.trim(),
        accepted_at: new Date().toISOString(),
        investment: {
          ...inv,
          amount: finalPrice,
          currency: currency,
          paymentTerms: billingPeriod,
        },
      });

      const fileName = `contrato-${proposal.slug}-${Date.now()}.txt`;
      const path = `${proposal.id}/${fileName}`;
      const buffer = new TextEncoder().encode(contractText);

      await supabaseAdmin.storage
        .from("documents")
        .upload(path, buffer, { contentType: "text/plain;charset=utf-8", upsert: true });

      const { data: urlData } = supabaseAdmin.storage.from("documents").getPublicUrl(path);

      await supabaseAdmin.from("documents").insert({
        name: `Contrato Oficial · ${proposal.project_title} (${planName})`,
        type: "contract",
        storage_path: path,
        url: urlData?.publicUrl || null,
        proposal_id: proposal.id,
        project_id: projectId || null,
        client_id: proposal.client_id || null,
        visible_to_client: true,
      });
    } catch (contractErr) {
      console.warn("Auto-contract generation warning:", contractErr);
    }

    // 6. Generar Factura / Registro de Cobro Inicial en Finanzas
    try {
      const { count } = await supabaseAdmin
        .from("invoices")
        .select("id", { count: "exact", head: true });

      const invoiceNum = String((count || 0) + 1).padStart(4, "0");
      const today = new Date().toISOString().slice(0, 10);
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      await supabaseAdmin.from("invoices").insert({
        number: invoiceNum,
        series: "A",
        client_id: proposal.client_id,
        project_id: projectId || null,
        proposal_id: proposal.id,
        status: "issued",
        total: finalPrice,
        currency: currency,
        concept: `${proposal.project_title} · ${planName} (Primer Período)`,
        issue_date: today,
        due_date: dueDate,
        notes: `Factura generada automáticamente por aceptación digital de ${name.trim()} (${contact.trim()}) vía Magic Link.`,
      });
    } catch (invoiceErr) {
      console.warn("Auto-invoice generation warning:", invoiceErr);
    }

    // 7. Disparar automatización / Notificación interna
    const clientDisplayName = proposal.clients?.name || name.trim();
    await createNotification({
      type: "proposal_accepted",
      proposalId: proposal.id,
      projectId: projectId || null,
      clientId: proposal.client_id || null,
      message: messageProposalAccepted(clientDisplayName, proposal.project_title, planName),
      channel: "whatsapp",
    });

    return new Response(
      JSON.stringify({
        ok: true,
        projectId,
        plan: planName,
        price: finalPrice,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Error in accept-proposal API:", err);
    return new Response(
      JSON.stringify({ ok: false, reason: "server_error", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
