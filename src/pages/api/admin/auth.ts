// filepath: src/pages/api/admin/auth.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { checkAdminPassword, createSessionToken, setSessionCookie, clearSessionCookie } from "../../../lib/auth";
import { resolveTotpSecret, verifyTotpCode } from "../../../lib/totp";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json();
    const { password, totpCode } = body;

    const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
    const runtimePass = runtimeEnv.ADMIN_PASSWORD;
    const runtimeSecret = runtimeEnv.ADMIN_SESSION_SECRET;
    const totpSecret = resolveTotpSecret(runtimeEnv);

    if (!checkAdminPassword(password, runtimePass)) {
      return new Response(
        JSON.stringify({ ok: false, message: "Contraseña incorrecta" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si Google Authenticator (TOTP 2FA) está configurado en el entorno, exigir código de 6 dígitos
    if (totpSecret) {
      const cleanCode = String(totpCode || "").trim();
      if (!cleanCode) {
        return new Response(
          JSON.stringify({
            ok: false,
            requireTotp: true,
            message: "Ingresá el código de 6 dígitos de Google Authenticator",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const validTotp = await verifyTotpCode(cleanCode, totpSecret, 1);
      if (!validTotp) {
        return new Response(
          JSON.stringify({
            ok: false,
            requireTotp: true,
            message: "Código de Google Authenticator incorrecto o expirado",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const token = await createSessionToken(runtimeSecret);
    setSessionCookie(cookies, token, request.url);

    return new Response(
      JSON.stringify({ ok: true, twoFactor: Boolean(totpSecret) }),
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
