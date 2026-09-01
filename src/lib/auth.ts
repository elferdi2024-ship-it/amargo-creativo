// filepath: src/lib/auth.ts
import type { AstroCookies } from "astro";

const COOKIE_NAME = "amargo_admin_session";
const DEFAULT_SECRET = "amargo-creativo-super-secret-key-2026";
const FALLBACK_PASSWORDS = ["Renato_Galaxia_Fiorella_2312", "amargo2026"];

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
 * Checks runtime environment, build-time import.meta.env, and fallback passwords.
 */
export function checkAdminPassword(input: string, runtimePassword?: string): boolean {
  if (!input) return false;
  const cleanInput = input.trim();

  // 1. Check runtime variable from Cloudflare
  if (runtimePassword && cleanInput === runtimePassword.trim()) {
    return true;
  }

  // 2. Check import.meta.env
  const envPass = import.meta.env.ADMIN_PASSWORD;
  if (envPass && cleanInput === envPass.trim()) {
    return true;
  }

  // 3. Check fallbacks
  return FALLBACK_PASSWORDS.some((pass) => cleanInput === pass);
}

/**
 * Verifies if the request is authenticated for the admin panel.
 */
export async function isAuthenticated(
  cookies: AstroCookies | null,
  request?: Request
): Promise<boolean> {
  if (request) {
    const cfUser = request.headers.get("cf-access-authenticated-user-email");
    const cfJwt = request.headers.get("cf-access-jwt-assertion");
    if (cfUser || cfJwt) {
      return true;
    }
  }

  if (cookies) {
    const sessionCookie = cookies.get(COOKIE_NAME);
    if (sessionCookie && sessionCookie.value) {
      return await verifySessionToken(sessionCookie.value);
    }
    const adminCookie = cookies.get("amargo_admin");
    if (adminCookie && adminCookie.value) {
      return true;
    }
  }

  return false;
}

export function setSessionCookie(cookies: AstroCookies, token: string) {
  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  cookies.set("amargo_admin", "authenticated", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: "/" });
  cookies.delete("amargo_admin", { path: "/" });
}
