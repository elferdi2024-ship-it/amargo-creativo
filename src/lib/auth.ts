// filepath: src/lib/auth.ts
import type { AstroCookies } from "astro";

const COOKIE_NAME = "amargo_admin_session";
const DEFAULT_SECRET = "amargo-creativo-super-secret-key-2026";
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || "amargo2026";

/**
 * Creates a signed session token using Web Crypto API.
 */
export async function createSessionToken(secret = DEFAULT_SECRET): Promise<string> {
  const payload = `admin:${Date.now()}:${Math.random().toString(36).substring(2)}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${btoa(payload)}.${sigHex}`;
}

/**
 * Verifies a signed session token.
 */
export async function verifySessionToken(token: string, secret = DEFAULT_SECRET): Promise<boolean> {
  try {
    const [b64Payload, sigHex] = token.split(".");
    if (!b64Payload || !sigHex) return false;

    const payload = atob(b64Payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(
      sigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
    return valid;
  } catch {
    return false;
  }
}

/**
 * Validates the provided admin password.
 */
export function checkAdminPassword(input: string): boolean {
  if (!input) return false;
  return input.trim() === ADMIN_PASSWORD.trim();
}

/**
 * Verifies if the request is authenticated for the admin panel.
 * Supports both Session Cookie and Cloudflare Access headers.
 */
export async function isAuthenticated(
  cookies: AstroCookies | null,
  request?: Request
): Promise<boolean> {
  // 1. Check Cloudflare Access header if present
  if (request) {
    const cfUser = request.headers.get("cf-access-authenticated-user-email");
    const cfJwt = request.headers.get("cf-access-jwt-assertion");
    if (cfUser || cfJwt) {
      return true;
    }
  }

  // 2. Check session cookie
  if (cookies) {
    const sessionCookie = cookies.get(COOKIE_NAME);
    if (sessionCookie && sessionCookie.value) {
      return await verifySessionToken(sessionCookie.value);
    }
  }

  return false;
}

export function setSessionCookie(cookies: AstroCookies, token: string) {
  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: "/" });
}
