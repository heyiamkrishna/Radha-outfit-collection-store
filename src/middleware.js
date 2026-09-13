import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  "atelier_super_secret_jwt_key_2026_must_be_32_chars";

const SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_CANDIDATES = ["roc_token", "atelier_session", "token", "auth_token"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedCustomerRoute =
    pathname.startsWith("/checkout") || pathname.startsWith("/account");

  // 1. Unrestricted routes
  if (!isAdminRoute && !isProtectedCustomerRoute) {
    return NextResponse.next();
  }

  // 2. Locate active session cookie
  let token = null;
  let activeCookieName = "roc_token";
  for (const name of COOKIE_CANDIDATES) {
    const val = req.cookies.get(name)?.value;
    if (val) {
      token = val;
      activeCookieName = name;
      break;
    }
  }

  // 3. Enforce authentication on protected paths
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // 4. Enforce Admin Access
    if (isAdminRoute) {
      const role = (payload.role || "").toLowerCase();
      if (role !== "admin" && role !== "superadmin") {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Expired or invalid token -> clear cookie and redirect
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(activeCookieName);
    return response;
  }
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};