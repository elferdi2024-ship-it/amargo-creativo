// filepath: src/pages/api/upload-document.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const proposalId = formData.get("proposal_id") as string;
    const projectId = formData.get("project_id") as string;
    const clientId = formData.get("client_id") as string;
    const visible = formData.get("visible_to_client") === "true";

    if (!file) {
      return new Response(JSON.stringify({ ok: false, message: "No se envió ningún archivo" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ext = file.name.split(".").pop() || "bin";
    const path = `${proposalId || projectId || "general"}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from("documents")
      .getPublicUrl(path);

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        name: name?.trim() || file.name,
        type: type || "other",
        storage_path: path,
        url: urlData?.publicUrl || null,
        proposal_id: proposalId || null,
        project_id: projectId || null,
        client_id: clientId || null,
        visible_to_client: visible,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, document: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Upload document error:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
