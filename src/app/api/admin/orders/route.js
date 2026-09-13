import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User"; // Ensures User schema is registered for population
import { verifyAdmin } from "@/lib/autAdmin";

export async function GET(req) {
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Forbidden. Admin access required." },
      { status: 403 }
    );
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
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
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

    return NextResponse.json({
      success: true,
      order: JSON.parse(JSON.stringify(updatedOrder)),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}