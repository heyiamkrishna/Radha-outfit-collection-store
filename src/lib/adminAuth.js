import { jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Encodes JWT secret into a Uint8Array for jose verification.
 */
function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET environment variable is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

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
    if (req && req.headers) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 2. Check Next.js server cookie store
    if (!token) {
      const cookieStore = await cookies();
      const sessionCookie =
        cookieStore.get("token") ||
        cookieStore.get("admin_token") ||
        cookieStore.get("auth_token");

      if (sessionCookie) {
        token = sessionCookie.value;
      }
    }

    if (!token) {
      return { authorized: false, error: "Missing authentication token" };
    }

    // 3. Cryptographically verify signature
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

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

// Named alias matching api/admin/products, api/inventory, and api/qr/generate imports
export const verifyAdminSession = verifyAdmin;

// Default export fallback
export default verifyAdmin;