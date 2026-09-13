import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getSessionUser } from "@/lib/auth";

// 1. GET Handler: Prevents HTTP 405 if navigated to in a browser
export async function GET() {
  return NextResponse.json(
    {
      status: "online",
      endpoint: "/api/checkout",
      allowedMethods: ["POST"],
      message: "Atelier checkout endpoint is active. Submit orders via POST payload.",
    },
    { status: 200 }
  );
}

// 2. POST Handler: Processes the checkout order
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items = [], shippingAddress, paymentMethod = "cod", totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Shopping bag is empty." }, { status: 400 });
    }

    if (!shippingAddress?.phone || !shippingAddress?.fullName || !shippingAddress?.street) {
      return NextResponse.json({ error: "Please complete all delivery address fields." }, { status: 400 });
    }

    const validatedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const rawId = item.product || item._id || item.id;
      let matchedProduct = null;

      // Look up via valid ObjectId
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        matchedProduct = await Product.findById(rawId).lean();
      }

      // Fallback: Look up via slug or name
      if (!matchedProduct && (item.slug || typeof rawId === "string")) {
        const queryTerm = item.slug || rawId;
        matchedProduct = await Product.findOne({
          $or: [
            { slug: queryTerm },
            { name: new RegExp(`^${item.name}$`, "i") }
          ]
        }).lean();
      }

      const finalProductId =
        matchedProduct?._id ||
        (mongoose.Types.ObjectId.isValid(rawId) ? rawId : new mongoose.Types.ObjectId());
      const unitPrice = Number(item.price || matchedProduct?.salePrice || matchedProduct?.price || 0);
      const qty = Number(item.quantity) || 1;

      calculatedSubtotal += unitPrice * qty;

      validatedItems.push({
        product: finalProductId,
        name: item.name || matchedProduct?.name || "Garment Silhouette",
        price: unitPrice,
        size: item.size || "M",
        quantity: qty,
        image: item.image || matchedProduct?.images?.[0] || "/placeholder.jpg",
        slug: item.slug || matchedProduct?.slug || "",
      });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ROC-${dateStr}-${randomSuffix}`;

    const userSession = await getSessionUser().catch(() => null);

    const shippingFee = calculatedSubtotal > 4999 ? 0 : 250;
    const finalGrandTotal = totalAmount || (calculatedSubtotal + shippingFee);

    const newOrder = await Order.create({
      orderNumber,
      user: userSession?.userId || userSession?.id || null,
      items: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod.toLowerCase(),
      paymentStatus: paymentMethod.toLowerCase() === "cod" ? "pending" : "paid",
      orderStatus: "received",
      subtotal: calculatedSubtotal,
      shippingFee,
      totalAmount: finalGrandTotal,
    });

    return NextResponse.json(
      {
        success: true,
        orderNumber: newOrder.orderNumber,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order Checkout Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process order." },
      { status: 500 }
    );
  }
}