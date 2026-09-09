import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User"; // Ensure User model is loaded for population

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("roc_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const status = searchParams.get("status");

    let filter = {};
    if (status && status !== "all") {
      filter.orderStatus = status;
    }
    if (query) {
      filter.$or = [
        { orderNumber: { $regex: query, $options: "i" } },
        { "shippingAddress.fullName": { $regex: query, $options: "i" } },
        { "shippingAddress.email": { $regex: query, $options: "i" } },
        { "shippingAddress.phone": { $regex: query, $options: "i" } },
      ];
    }

    // Populate the registered user document linked to the order
    const orders = await Order.find(filter)
      .populate("user", "name email phone createdAt role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
    });
  } catch (err) {
    console.error("Admin orders query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update order status & send tracking updates
export async function PATCH(req) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { orderId, orderStatus, paymentStatus } = await req.json();

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    })
      .populate("user", "name email phone")
      .lean();

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}