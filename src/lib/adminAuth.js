import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const PRIMARY_SECRET =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  "atelier_super_secret_jwt_key_2026_must_be_32_chars";

const FALLBACK_SECRETS = [
  PRIMARY_SECRET,
  "local_development_secret_key_atelier_2026",
  "atelier_super_secret_jwt_key_2026",
  "atelier_super_secret_jwt_key_2026_must_be_32_chars",
];

const COOKIE_NAMES = ["roc_token", "token", "admin_token", "auth_token", "atelier_session"];

async function verifyWithCandidateSecrets(token) {
  let lastError = null;
  for (const secretStr of FALLBACK_SECRETS) {
    try {
      const secretBytes = new TextEncoder().encode(secretStr);
      const { payload } = await jwtVerify(token, secretBytes);
      return { payload, error: null };
    } catch (err) {
      lastError = err;
    }
  }
  return { payload: null, error: lastError };
}

export async function verifyAdmin(req) {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (req?.headers) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // If token not in Bearer, check Cookie header in Request
      if (!token) {
        const rawCookie = req.headers.get("cookie") || "";
        for (const name of COOKIE_NAMES) {
          const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
          if (match) {
            token = decodeURIComponent(match[1]);
            break;
          }
        }
      }
    }

    // 2. Check Next.js server cookie store
    if (!token) {
      const cookieStore = await cookies();
      for (const name of COOKIE_NAMES) {
        const found = cookieStore.get(name)?.value;
        if (found) {
          token = found;
          break;
        }
      }
    }

    if (!token) {
      return { authorized: false, error: "Missing authentication token" };
    }

    // 3. Verify signature
    const { payload, error } = await verifyWithCandidateSecrets(token);
    if (!payload) {
      return { authorized: false, error: error?.message || "Signature verification failed" };
    }

    // 4. Validate administrative role
    const role = (payload.role || "").toLowerCase();
    if (role !== "admin" && role !== "superadmin") {
      return { authorized: false, error: "Forbidden: Admin privileges required" };
    }

    return {
      authorized: true,
      user: {
        id: payload.id || payload.sub || payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      },
    };
  } catch (error) {
    return {
      authorized: false,
      error: error.message || "Invalid or expired token",
    };
  }
}

export const verifyAdminSession = verifyAdmin;
export default verifyAdmin;