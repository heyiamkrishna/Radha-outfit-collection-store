import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "An atelier account with this email address already exists." },
        { status: 409 }
      );
    }

    // 3. Hash password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create User (Strictly force role to 'customer')
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer", // FORCED: Cannot be overridden by request payload
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please sign in.",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User Registration Error:", error);

    // Handle MongoDB duplicate key error if race conditions occur
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}