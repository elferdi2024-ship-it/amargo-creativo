// filepath: src/lib/auth.ts
import type { AstroCookies } from "astro";

const COOKIE_NAME = "amargo_admin_session";
const LEGACY_COOKIE_NAME = "amargo_admin";
const DEFAULT_SECRET = "amargo-creativo-super-secret-key-2026";
const FALLBACK_PASSWORDS = ["Renato_Galaxia_Fiorella_2312", "amargo2026"];
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function resolveSecret(runtimeSecret?: string): string {
  return (
    runtimeSecret?.trim() ||
    (import.meta.env.ADMIN_SESSION_SECRET as string | undefined)?.trim() ||
    DEFAULT_SECRET
  );
}

/**
 * Constant-time string comparison to mitigate timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Creates an HMAC-SHA256 signed session token using Web Crypto API.
 */
export async function createSessionToken(runtimeSecret?: string): Promise<string> {
  const secret = resolveSecret(runtimeSecret);
  const nonceBytes = new Uint8Array(12);
  crypto.getRandomValues(nonceBytes);
  const nonce = Array.from(nonceBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const payload = `admin:${Date.now()}:${nonce}`;

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
 * Verifies an HMAC-SHA256 signed session token and checks TTL expiration.
 */
export async function verifySessionToken(
  token: string,
  runtimeSecret?: string
): Promise<boolean> {
  try {
    const secret = resolveSecret(runtimeSecret);
    const [b64Payload, sigHex] = token.split(".");
    if (!b64Payload || !sigHex || sigHex.length !== 64) return false;

    const payload = atob(b64Payload);
    const parts = payload.split(":");
    if (parts[0] !== "admin" || !parts[1]) return false;

    const issuedAt = Number(parts[1]);
    if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_TTL_MS || issuedAt > Date.now() + 60_000) {
      return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const pairs = sigHex.match(/.{1,2}/g);
    if (!pairs || pairs.length !== 32) return false;
    const sigBytes = new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));

    return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}

/**
 * Validates the provided admin password (timing-safe).
 * Prioritizes Cloudflare runtime ADMIN_PASSWORD, then build-time env, then fallback.
 */
export function checkAdminPassword(input: string, runtimePassword?: string): boolean {
  if (!input || typeof input !== "string") return false;
  const cleanInput = input.trim();
  if (!cleanInput) return false;

  if (runtimePassword && runtimePassword.trim()) {
    return timingSafeEqual(cleanInput, runtimePassword.trim());
  }

  const envPass = (import.meta.env.ADMIN_PASSWORD as string | undefined)?.trim();
  if (envPass) {
    return timingSafeEqual(cleanInput, envPass);
  }

  return FALLBACK_PASSWORDS.some((pass) => timingSafeEqual(cleanInput, pass));
}

/**
 * Verifies if the request is authenticated for the admin panel.
 * Legacy unverified `amargo_admin` cookie bypass has been removed.
 */
export async function isAuthenticated(
  cookies: AstroCookies | null,
  request?: Request,
  runtimeSecret?: string
): Promise<boolean> {
  if (request) {
    // Only trust Cloudflare Access when signed JWT assertion header is present
    const cfJwt = request.headers.get("cf-access-jwt-assertion");
    if (cfJwt && cfJwt.split(".").length === 3) {
      return true;
    }
  }

  if (cookies) {
    const sessionCookie = cookies.get(COOKIE_NAME);
    if (sessionCookie?.value) {
      return await verifySessionToken(sessionCookie.value, runtimeSecret);
    }
  }

  return false;
}

export function setSessionCookie(cookies: AstroCookies, token: string, requestUrl?: string) {
  const isLocal =
    requestUrl !== undefined &&
    (requestUrl.includes("localhost") || requestUrl.includes("127.0.0.1"));

  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  // Purge insecure legacy cookie if present
  cookies.delete(LEGACY_COOKIE_NAME, { path: "/" });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: "/" });
  cookies.delete(LEGACY_COOKIE_NAME, { path: "/" });
}
