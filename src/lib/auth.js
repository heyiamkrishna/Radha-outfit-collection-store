import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  "atelier_super_secret_jwt_key_2026_must_be_32_chars";

const SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// Canonical cookie name, with legacy support
export const PRIMARY_COOKIE_NAME = "roc_token";
export const LEGACY_COOKIE_NAMES = ["atelier_session", "token", "auth_token"];

export async function createSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  
  // Try primary cookie first, fallback to legacy cookie names
  let token = cookieStore.get(PRIMARY_COOKIE_NAME)?.value;
  if (!token) {
    for (const name of LEGACY_COOKIE_NAMES) {
      const match = cookieStore.get(name)?.value;
      if (match) {
        token = match;
        break;
      }
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}

export function buildSessionCookie(token) {
  return {
    name: PRIMARY_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}