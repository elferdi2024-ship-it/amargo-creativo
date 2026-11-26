// filepath: src/pages/api/admin/search.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase";

interface SearchResult {
  type: "client" | "proposal" | "project" | "invoice";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  if (!(await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  try {
    const [clientsRes, proposalsRes, projectsRes, invoicesRes] = await Promise.all([
      supabaseAdmin.from("clients").select("id, name, company, email").order("created_at", { ascending: false }).limit(25),
      supabaseAdmin.from("proposals").select("id, project_title, slug, status, clients(name)").order("created_at", { ascending: false }).limit(25),
      supabaseAdmin.from("projects").select("id, title, status, clients(name)").order("created_at", { ascending: false }).limit(25),
      supabaseAdmin.from("invoices").select("id, number, total, currency, status, clients(name)").order("created_at", { ascending: false }).limit(25),
    ]);

    const results: SearchResult[] = [];

    for (const c of clientsRes.data || []) {
      const hay = `${c.name || ""} ${c.company || ""} ${c.email || ""}`.toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({
          type: "client",
          title: c.name,
          subtitle: c.company || c.email || "Cliente",
          href: `/admin/clients/${c.id}`,
          badge: "CLIENTE",
        });
      }
    }

    for (const p of proposalsRes.data || []) {
      const clientName = (p.clients as { name?: string } | null)?.name || "";
      const hay = `${p.project_title || ""} ${p.slug || ""} ${clientName}`.toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({
          type: "proposal",
          title: p.project_title,
          subtitle: clientName ? `${clientName} · /p/${p.slug}` : `/p/${p.slug}`,
          href: `/admin/proposals/${p.id}`,
          badge: String(p.status || "PROPUESTA").toUpperCase(),
        });
      }
    }

    for (const pr of projectsRes.data || []) {
      const clientName = (pr.clients as { name?: string } | null)?.name || "";
      const hay = `${pr.title || ""} ${clientName}`.toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({
          type: "project",
          title: pr.title,
          subtitle: clientName || "Proyecto activo",
          href: `/admin/projects/${pr.id}`,
          badge: String(pr.status || "PROYECTO").toUpperCase(),
        });
      }
    }

    for (const inv of invoicesRes.data || []) {
      const clientName = (inv.clients as { name?: string } | null)?.name || "";
      const hay = `${inv.number || ""} ${clientName} ${inv.status || ""}`.toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({
          type: "invoice",
          title: inv.number || "Borrador CFE",
          subtitle: `${clientName || "Sin cliente"} · ${inv.currency || "UYU"} ${inv.total || 0}`,
          href: `/admin/finanzas/facturas/${inv.id}`,
          badge: String(inv.status || "FACTURA").toUpperCase(),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, results: results.slice(0, 18) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, message: err instanceof Error ? err.message : "Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
