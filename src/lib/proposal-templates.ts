// filepath: src/lib/proposal-templates.ts
import { supabaseAdmin } from "./supabase";
import { generateSlug } from "./slug";

export async function saveAsTemplate(proposalId: string, templateName: string) {
  const { data: proposal, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (error || !proposal) throw new Error("Propuesta no encontrada");

  const { data, error: insertError } = await supabaseAdmin
    .from("proposals")
    .insert({
      slug: `template-${Date.now()}`,
      project_title: proposal.project_title,
      value_phrase: proposal.value_phrase,
      challenge: proposal.challenge,
      solution: proposal.solution,
      includes: proposal.includes || [],
      excludes: proposal.excludes || [],
      investment: proposal.investment,
      timeline: proposal.timeline,
      roi_table: proposal.roi_table,
      whatsapp_message: proposal.whatsapp_message,
      notes: proposal.notes,
      status: "draft",
      is_template: true,
      template_name: templateName,
      client_id: null,
      accepted_name: null,
      accepted_contact: null,
      accepted_plan: null,
      accepted_at: null,
      disabled_at: null,
      cloned_from: proposalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

export async function cloneFromTemplate(templateId: string, clientId: string, projectTitle?: string) {
  const { data: template, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("id", templateId)
    .eq("is_template", true)
    .single();

  if (error || !template) throw new Error("Plantilla no encontrada");

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("name")
    .eq("id", clientId)
    .single();

  const title = projectTitle || template.project_title;
  const slug = generateSlug(client?.name || "cliente", title);

  const { data, error: insertError } = await supabaseAdmin
    .from("proposals")
    .insert({
      client_id: clientId,
      slug,
      project_title: title,
      status: "draft",
      value_phrase: template.value_phrase,
      challenge: template.challenge,
      solution: template.solution,
      includes: template.includes || [],
      excludes: template.excludes || [],
      investment: template.investment,
      timeline: template.timeline,
      roi_table: template.roi_table,
      whatsapp_message: template.whatsapp_message,
      notes: template.notes,
      is_template: false,
      cloned_from: templateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}
