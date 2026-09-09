import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("roc_token")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedCustomerRoute =
    pathname.startsWith("/checkout") || pathname.startsWith("/account");

  // Allow unrestricted storefront pages to continue immediately
  if (!isAdminRoute && !isProtectedCustomerRoute) {
    return NextResponse.next();
  }

  // 1. Enforce authentication: No token -> redirect to login with callback URL
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);

    // 2. Strict Admin Role Gate
    if (isAdminRoute) {
      if (payload.role !== "admin") {
        // Authenticated customer trying to reach /admin -> reroute to customer account
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.next();
  } catch (_) {
    // Expired or forged token -> wipe cookie and force re-login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("roc_token");
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