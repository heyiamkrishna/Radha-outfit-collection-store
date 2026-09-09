import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.street) {
      return NextResponse.json({ error: "Incomplete shipping information" }, { status: 400 });
    }

    // Verify authenticated user (if token cookie exists)
    let userId = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026");
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId;
      } catch (_) {}
    }

    // Recalculate and verify prices against the database
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();

    let calculatedSubtotal = 0;
    const verifiedItems = items.map((cartItem) => {
      const product = dbProducts.find((p) => p._id.toString() === cartItem.productId);
      if (!product) {
        throw new Error(`Product not found: ${cartItem.name}`);
      }
      const verifiedPrice = product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

      calculatedSubtotal += verifiedPrice * cartItem.quantity;

      return {
        product: product._id,
        name: product.name,
        slug: product.slug,
        price: verifiedPrice,
        quantity: cartItem.quantity,
        size: cartItem.size,
        image: product.images?.[0] || "",
      };
    });

    const shippingFee = calculatedSubtotal >= 5000 ? 0 : 250;
    const totalAmount = calculatedSubtotal + shippingFee;

    // Generate unique order reference (e.g., ROC-84920)
    const orderNumber = `ROC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await Order.create({
      user: userId,
      orderNumber,
      items: verifiedItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "ONLINE" ? "paid" : "pending",
      orderStatus: "received",
      subtotal: calculatedSubtotal,
      shippingFee,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
  }
}