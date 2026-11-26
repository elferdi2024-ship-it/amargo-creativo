// filepath: src/lib/totp.ts
// Pure Web Crypto API RFC 6238 TOTP implementation (Cloudflare Workers / V8 native, 0 Node dependencies)

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[\s=-]+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

/**
 * Generates a cryptographically strong 160-bit Base32 TOTP secret (32 chars).
 */
export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

/**
 * Builds standard otpauth:// URI compatible with Google Authenticator, Authy, 1Password, Apple Passwords.
 */
export function buildOtpAuthUri(
  secret: string,
  account = "admin@amargocreativo.uy",
  issuer = "Amargo Studio OS"
): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const params = new URLSearchParams({
    secret: secret.replace(/\s+/g, "").toUpperCase(),
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Generates a 6-digit RFC 6238 TOTP code for a given Base32 secret and Unix timestamp (ms).
 */
export async function generateTotpCode(
  secret: string,
  timestampMs = Date.now(),
  stepSeconds = 30
): Promise<string> {
  const keyBytes = base32Decode(secret);
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);

  const counterBuf = new ArrayBuffer(8);
  const view = new DataView(counterBuf);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, counterBuf));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP token with ±window step tolerance (default ±30s clock skew).
 */
export async function verifyTotpCode(
  token: string,
  secret: string,
  windowSteps = 1,
  nowMs = Date.now()
): Promise<boolean> {
  const cleanToken = String(token || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanToken) || !secret?.trim()) return false;

  for (let delta = -windowSteps; delta <= windowSteps; delta++) {
    const expected = await generateTotpCode(secret, nowMs + delta * 30_000);
    // Constant-time 6-char comparison
    let diff = 0;
    for (let i = 0; i < 6; i++) {
      diff |= cleanToken.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff === 0) return true;
  }
  return false;
}

/**
 * Resolves active TOTP secret from Cloudflare runtime env or build-time env.
 */
export function resolveTotpSecret(runtimeEnv?: Record<string, string>): string | null {
  const val =
    runtimeEnv?.ADMIN_TOTP_SECRET?.trim() ||
    (import.meta.env.ADMIN_TOTP_SECRET as string | undefined)?.trim() ||
    "";
  return val.length >= 16 ? val : null;
}
