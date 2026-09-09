import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
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

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({
      _id: orderId,
      $or: [{ user: payload.userId }, { "shippingAddress.email": payload.email }],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.orderStatus !== "received") {
      return NextResponse.json(
        { error: "Orders already in processing or transit cannot be cancelled." },
        { status: 400 }
      );
    }

    order.orderStatus = "cancelled";
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel order." }, { status: 500 });
  }
}