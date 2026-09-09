import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Validates the administrative JWT session cookie (`roc_token`).
 * Throws explicit errors if JWT_SECRET is missing or the token is invalid/unauthorized.
 */
export async function verifyAdminSession() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("CRITICAL CONFIGURATION ERROR: JWT_SECRET is not defined in environment variables.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("roc_token")?.value;

  if (!token) {
    return { authorized: false, error: "Authentication token missing.", status: 401 };
  }

  try {
    const encodedSecret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, encodedSecret);

    if (payload.role !== "admin") {
      return { authorized: false, error: "Forbidden: Admin privileges required.", status: 403 };
    }

    return { authorized: true, user: payload };
  } catch (err) {
    return { authorized: false, error: "Session expired or invalid token.", status: 401 };
  }
}