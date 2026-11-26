// filepath: src/pages/api/admin/totp.ts
export const prerender = false;

import type { APIRoute } from "astro";
import QRCode from "qrcode";
import { isAuthenticated } from "../../../lib/auth";
import { generateTotpSecret, buildOtpAuthUri, verifyTotpCode, resolveTotpSecret } from "../../../lib/totp";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env || {};
  if (!(await isAuthenticated(cookies, request, runtimeEnv.ADMIN_SESSION_SECRET))) {
    return new Response(JSON.stringify({ ok: false, message: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { action, secret, code, account } = body;

    if (action === "generate") {
      const newSecret = generateTotpSecret();
      const uri = buildOtpAuthUri(
        newSecret,
        typeof account === "string" && account.trim() ? account.trim() : "admin",
        "Amargo"
      );
      const qrSvg = await QRCode.toString(uri, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 4,
        width: 240,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      return new Response(
        JSON.stringify({ ok: true, secret: newSecret, uri, qrSvg }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      const targetSecret =
        (typeof secret === "string" && secret.trim()) ||
        resolveTotpSecret(runtimeEnv) ||
        "";

      if (!targetSecret) {
        return new Response(
          JSON.stringify({ ok: false, message: "Generá primero un secreto TOTP" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const valid = await verifyTotpCode(String(code || ""), targetSecret, 1);
      return new Response(
        JSON.stringify({
          ok: valid,
          message: valid
            ? "✓ Código verificado. Tu Google Authenticator está 100% sincronizado."
            : "Código incorrecto. Revisá los 6 dígitos actuales en tu teléfono.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: false, message: "Acción inválida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, message: err instanceof Error ? err.message : "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
