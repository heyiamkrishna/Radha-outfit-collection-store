import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  "atelier_super_secret_jwt_key_2026_must_be_32_chars";

const SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const COOKIE_NAMES = ["roc_token", "token", "admin_token", "auth_token", "atelier_session"];

/**
 * Centralized admin authentication verifier.
 * Checks request authorization headers and HTTP-only session cookies.
 *
 * @param {Request} [req] - Optional incoming NextRequest or Request object
 * @returns {Promise<{ authorized: boolean, user?: object, error?: string }>}
 */
export async function verifyAdmin(req) {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (req?.headers) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
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
    const { payload } = await jwtVerify(token, SECRET);

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