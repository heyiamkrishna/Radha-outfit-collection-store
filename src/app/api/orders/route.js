import { NextResponse } from "next/server";
import { POST as checkoutHandler } from "@/app/api/checkout/route";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";

// Forwarding wrapper over checkout POST
export async function POST(req) {
  return checkoutHandler(req);
}

// Support GET: Return orders for the authenticated customer or administrative desk
export async function GET(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    let query = {};
    if (user.role !== "admin" && user.role !== "superadmin") {
      query = {
        $or: [
          { user: user.userId || user.id },
          { "shippingAddress.email": user.email },
        ],
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}