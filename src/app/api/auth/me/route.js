import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const CANDIDATE_SECRETS = [
  process.env.JWT_SECRET,
  process.env.AUTH_SECRET,
  "local_development_secret_key_atelier_2026",
  "atelier_super_secret_jwt_key_2026_must_be_32_chars",
  "atelier_super_secret_jwt_key_2026",
].filter(Boolean);

const COOKIE_NAMES = ["roc_token", "token", "admin_token", "auth_token", "atelier_session"];

export async function GET(req) {
  try {
    let token = null;

    // 1. Check Bearer Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Check Request Cookies directly
    if (!token && req.cookies) {
      for (const name of COOKIE_NAMES) {
        const val = req.cookies.get(name)?.value;
        if (val) {
          token = val;
          break;
        }
      }
    }

    // 3. Fallback to Next.js cookies() helper
    if (!token) {
      const cookieStore = await cookies();
      for (const name of COOKIE_NAMES) {
        const val = cookieStore.get(name)?.value;
        if (val) {
          token = val;
          break;
        }
      }
    }

    if (!token) {
      return NextResponse.json({ user: null, error: "No session found" }, { status: 401 });
    }

    // 4. Verify against candidate secrets to avoid deployment mismatches
    let payload = null;
    for (const secretStr of CANDIDATE_SECRETS) {
      try {
        const secret = new TextEncoder().encode(secretStr);
        const res = await jwtVerify(token, secret);
        payload = res.payload;
        break;
      } catch {
        // Continue to test candidate secrets
      }
    }

    if (!payload) {
      return NextResponse.json(
        { user: null, error: "Signature verification failed" },
        { status: 401 }
      );
    }

    const userId = payload.userId || payload.id || payload.sub;
    if (!userId) {
      return NextResponse.json({ user: null, error: "Invalid token payload" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return NextResponse.json({ user: null, error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: JSON.parse(JSON.stringify(user)),
    });
  } catch (err) {
    return NextResponse.json({ user: null, error: err.message }, { status: 401 });
  }
}