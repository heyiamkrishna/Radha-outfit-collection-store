import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  process.env.AUTH_SECRET ||
  "atelier_super_secret_jwt_key_2026_must_be_32_chars";

const SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT using the standard Edge secret
    const token = await new SignJWT({
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role || "user",
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // SET COOKIE - Essential flags for Vercel deployment:
    response.cookies.set("roc_token", token, {
      httpOnly: true,
      secure: isProduction, // true on Vercel HTTPS, false on local HTTP
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}