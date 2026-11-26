// filepath: src/pages/api/generate-content.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabase";
import { CONTENT_PROMPTS } from "../../lib/content-templates";
import { isAuthenticated } from "../../lib/auth";

const CONTENT_TYPES = ["case_study", "linkedin", "instagram", "web", "email"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

async function generateWithGemini(
  apiKey: string,
  payload: { title: string; client_name: string; challenge?: string; solution?: string }
): Promise<Partial<Record<ContentType, string>> | null> {
  try {
    const prompt = `Sos el director creativo de Amargo Creativo (Product Studio de Uruguay que construye Apps PWA, software con IA, plataformas SaaS y comercio propio sin comisiones).
Tono: directo, rioplatense profesional (sin humo corporativo ni frases genéricas de IA).
Proyecto: ${payload.title}
Cliente: ${payload.client_name}
Desafío: ${payload.challenge || "Modernizar la operación y construir un producto digital propio."}
Solución: ${payload.solution || "Desarrollo a medida con arquitectura moderna y UX móvil real."}

Devolvé ÚNICAMENTE un JSON válido con estas 5 claves exactas (valores en texto Markdown limpio, español rioplatense):
- "case_study": caso de estudio estructurado (contexto, problema, arquitectura, resultado).
- "linkedin": post de LinkedIn con gancho fuerte, 3 bullets concretos y cierre conversacional.
- "instagram": guion de carrusel de 5 slides (Slide 1 gancho .. Slide 5 CTA).
- "web": bloque corto listo para portafolio web (titular + 2 líneas + resultado clave).
- "email": correo breve de prospección para enviar a clientes del mismo rubro.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;
    return JSON.parse(rawText) as Partial<Record<ContentType, string>>;
  } catch (err) {
    console.warn("[Content Engine] Gemini fallback to templates:", err);
    return null;
  }
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  if (!(await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return new Response(JSON.stringify({ ok: false, message: "ID de proyecto requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select(`
        id, title, client_id, proposal_id,
        clients ( name, company ),
        proposals ( challenge, solution, value_phrase, investment )
      `)
      .eq("id", projectId)
      .single();

    if (error || !project) {
      return new Response(JSON.stringify({ ok: false, reason: "not_found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = {
      title: project.title,
      client_name: (project.clients as { name?: string } | null)?.name || "Cliente",
      challenge: (project.proposals as { challenge?: string } | null)?.challenge,
      solution: (project.proposals as { solution?: string } | null)?.solution,
    };

    const geminiKey =
      runtimeEnv.GEMINI_API_KEY?.trim() ||
      (import.meta.env.GEMINI_API_KEY as string | undefined)?.trim();

    const aiDrafts = geminiKey ? await generateWithGemini(geminiKey, payload) : null;
    const aiPowered = Boolean(aiDrafts);

    const created = [];

    for (const type of CONTENT_TYPES) {
      const fallbackGenerator = CONTENT_PROMPTS[type];
      const content = aiDrafts?.[type] || (fallbackGenerator ? fallbackGenerator(payload) : "");
      if (!content) continue;

      const title = `${type.replace("_", " ").toUpperCase()} – ${project.title}`;

      const { data: piece, error: insertError } = await supabaseAdmin
        .from("content_pieces")
        .insert({
          project_id: projectId,
          proposal_id: project.proposal_id,
          client_id: project.client_id,
          type,
          title,
          content,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting content piece:", insertError);
      } else if (piece) {
        created.push(piece);
      }
    }

    return new Response(JSON.stringify({ ok: true, aiPowered, pieces: created }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Generate content error:", err);
    return new Response(JSON.stringify({ ok: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
