// filepath: src/pages/api/admin/auth.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { checkAdminPassword, createSessionToken, setSessionCookie, clearSessionCookie } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json();
    const { password } = body;

    const runtimeEnv = (locals as any)?.runtime?.env || {};
    const runtimePass = runtimeEnv.ADMIN_PASSWORD;

    if (!checkAdminPassword(password, runtimePass)) {
      return new Response(
        JSON.stringify({ ok: false, message: "Contraseña incorrecta" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = await createSessionToken();
    setSessionCookie(cookies, token);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Auth error:", err);
    return new Response(
      JSON.stringify({ ok: false, message: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  clearSessionCookie(cookies);
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
