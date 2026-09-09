import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Banner from "@/models/Banner";

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

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const [orderCount, productCount, bannerCount, recentOrders, banners] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Banner.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      Banner.find().sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        orderCount,
        productCount,
        bannerCount,
      },
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      banners: JSON.parse(JSON.stringify(banners)),
    });
  } catch (err) {
    console.error("Admin Overview API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}