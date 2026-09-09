import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);

    await connectToDatabase();

    const [user, orders] = await Promise.all([
      User.findById(payload.userId).select("-password").lean(),
      Order.find({
        $or: [{ user: payload.userId }, { "shippingAddress.email": payload.email }],
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      orders: JSON.parse(JSON.stringify(orders)),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load account details" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);

    const body = await req.json();
    const { name, phone, addressLine1, addressLine2, city, state, postalCode } = body;

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
        return NextResponse.json(
          { error: "Please provide a valid 10-digit Indian mobile number." },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      {
        ...(name && { name: name.trim() }),
        phone: phone ? phone.replace(/\D/g, "") : "",
        addressLine1: addressLine1 ? addressLine1.trim() : "",
        addressLine2: addressLine2 ? addressLine2.trim() : "",
        city: city ? city.trim() : "",
        state: state ? state.trim() : "",
        postalCode: postalCode ? postalCode.trim() : "",
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}