import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Please provide both email and password." },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or credentials." },
                { status: 401 }
            );
        }

        if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
            return NextResponse.json(
                { error: "Access is restricted strictly to @gmail.com addresses." },
                { status: 400 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid email or credentials." },
                { status: 401 }
            );
        }

        // Sign JWT Token
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
        );
        const token = await new SignJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        // Set HTTP-Only Cookie
        response.cookies.set("roc_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { error: "An unexpected server error occurred." },
            { status: 500 }
        );
    }
}