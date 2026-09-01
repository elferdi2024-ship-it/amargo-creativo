// filepath: src/pages/api/generate-contract.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { DEFAULT_TEMPLATES, renderContract } from "../../lib/contracts";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { proposalId, templateId, templateName, customContent } = await request.json();

    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("*, clients(*)")
      .eq("id", proposalId)
      .single();

    if (!proposal) {
      return new Response(JSON.stringify({ ok: false, message: "Propuesta no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let templateContent = customContent;
    let finalTemplateName = templateName || "Contrato";

    if (!templateContent) {
      if (templateId) {
        const { data: dbTmpl } = await supabaseAdmin
          .from("contract_templates")
          .select("*")
          .eq("id", templateId)
          .single();
        if (dbTmpl) {
          templateContent = dbTmpl.content;
          finalTemplateName = dbTmpl.name;
        }
      }

      if (!templateContent) {
        const defaultTmpl = DEFAULT_TEMPLATES.find((t) => t.name === templateName) || DEFAULT_TEMPLATES[0];
        templateContent = defaultTmpl.content;
        finalTemplateName = defaultTmpl.name;
      }
    }

    const content = customContent || renderContract(templateContent, proposal);

    // Guardar como documento en Supabase Storage
    const fileName = `contrato-${proposal.slug}-${Date.now()}.txt`;
    const path = `${proposal.id}/${fileName}`;
    const buffer = new TextEncoder().encode(content);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(path, buffer, { contentType: "text/plain;charset=utf-8", upsert: true });

    if (uploadError) {
      console.warn("Storage upload warning:", uploadError);
    }

    const { data: urlData } = supabaseAdmin.storage.from("documents").getPublicUrl(path);

    const { data: docRecord } = await supabaseAdmin
      .from("documents")
      .insert({
        name: `${finalTemplateName} - ${proposal.project_title}`,
        type: "contract",
        storage_path: path,
        url: urlData?.publicUrl || null,
        proposal_id: proposalId,
        client_id: proposal.client_id || null,
        visible_to_client: true,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        ok: true,
        content,
        document: docRecord,
        url: urlData?.publicUrl || null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Contract generation error:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
