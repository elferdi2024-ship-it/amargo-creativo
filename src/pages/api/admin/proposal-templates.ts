// filepath: src/pages/api/admin/proposal-templates.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { saveAsTemplate, cloneFromTemplate } from "../../../lib/proposal-templates";
import { isAuthenticated } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  const authed = await isAuthenticated(cookies, request);
  if (!authed) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, proposalId, templateName, templateId, clientId, projectTitle } = body;

    if (action === "save") {
      if (!proposalId || !templateName) {
        return new Response(JSON.stringify({ ok: false, error: "Faltan parámetros requeridos" }), { status: 400 });
      }
      const data = await saveAsTemplate(proposalId, templateName);
      return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
    }

    if (action === "clone") {
      if (!templateId || !clientId) {
        return new Response(JSON.stringify({ ok: false, error: "Seleccioná plantilla y cliente" }), { status: 400 });
      }
      const data = await cloneFromTemplate(templateId, clientId, projectTitle);
      return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: false, error: "Acción inválida" }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
};
