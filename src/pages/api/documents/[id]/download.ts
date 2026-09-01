// filepath: src/pages/api/documents/[id]/download.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../../lib/supabase";
import { getSignedDocumentUrl } from "../../../../lib/storage";
import { isAuthenticated } from "../../../../lib/auth";

export const GET: APIRoute = async ({ params, cookies, request }) => {
  const { id } = params;

  if (!id) {
    return new Response("Documento no encontrado", { status: 404 });
  }

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc) {
    return new Response("Documento no encontrado", { status: 404 });
  }

  // Si el documento NO está marcado como visible para el cliente, verificar autenticación admin
  if (!doc.visible_to_client) {
    const authed = await isAuthenticated(cookies, request);
    if (!authed) {
      return new Response("Acceso no autorizado", { status: 403 });
    }
  }

  // Generar URL firmada
  const signedUrl = await getSignedDocumentUrl("documents", doc.storage_path, 600);

  if (!signedUrl) {
    return new Response("No se pudo generar el enlace de descarga", { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: signedUrl,
    },
  });
};
