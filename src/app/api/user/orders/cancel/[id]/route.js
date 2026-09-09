import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    // Next.js 15+ async params unwrap
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);

    await connectToDatabase();

    // Query either by MongoDB ObjectId or orderNumber
    const queryConditions = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const order = await Order.findOne({
      $and: [
        { $or: queryConditions },
        {
          $or: [
            { user: payload.userId },
            { "shippingAddress.email": payload.email },
          ],
        },
      ],
    }).lean();

    if (!order) {
      return NextResponse.json(
        { error: "Invoice not found or unauthorized to view." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error) {
    console.error("Invoice API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load invoice." },
      { status: 500 }
    );
  }
}