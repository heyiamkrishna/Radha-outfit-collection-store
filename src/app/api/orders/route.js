import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { sendEmail } from "@/lib/sendEmail";
import { generateOrderEmailHtml } from "@/lib/emailTemplates";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();

    // 1. Strict Authentication Check: Purchasing requires a valid session
    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to confirm your order." },
        { status: 401 }
      );
    }

    let authenticatedUserId = null;
    let authenticatedUserEmail = null;

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
      );
      const { payload } = await jwtVerify(token, secret);
      authenticatedUserId = payload.userId || payload.id;
      authenticatedUserEmail = payload.email;
    } catch (_) {
      return NextResponse.json(
        { error: "Session expired or invalid. Please sign in again." },
        { status: 401 }
      );
    }

    if (!authenticatedUserId || !mongoose.Types.ObjectId.isValid(authenticatedUserId)) {
      return NextResponse.json(
        { error: "Invalid user credentials. Please sign in again." },
        { status: 401 }
      );
    }

    // 2. Validate Incoming Request Body
    const body = await req.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Please select garments to complete checkout." },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.postalCode ||
      !shippingAddress?.phone
    ) {
      return NextResponse.json(
        { error: "Incomplete shipping destination provided. All address fields are required." },
        { status: 400 }
      );
    }

    // Normalize payment method to strictly match Mongoose Enum ("cod" | "online")
    const rawMethod = (body.paymentMethod || "cod").toString().toLowerCase().trim();
    const paymentMethod = rawMethod === "online" || rawMethod === "upi" ? "online" : "cod";

    // 3. Query Real Garment Records from MongoDB
    const productIds = items
      .map((item) => item.product || item._id || item.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const dbProducts = await Product.find({
      _id: { $in: productIds },
    }).lean();

    const productMap = new Map(
      dbProducts.map((p) => [p._id.toString(), p])
    );

    // 4. Server-Authoritative Price Calculation
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const rawId = String(item.product || item._id || item.id);
      const dbProduct = productMap.get(rawId);

      if (!dbProduct) {
        return NextResponse.json(
          { error: `The garment "${item.name || 'Selected item'}" is no longer active in our catalog.` },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Enforce the price strictly from the database
      const unitPrice = Number(dbProduct.salePrice || dbProduct.price) || 0;
      calculatedSubtotal += unitPrice * quantity;

      verifiedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: unitPrice,
        quantity,
        size: item.size || "M",
        image: dbProduct.images?.[0] || item.image || "",
        slug: dbProduct.slug || "",
      });
    }

    // Standard Complimentary Luxury Courier Dispatch
    const shippingCost = 0;
    const totalAmount = calculatedSubtotal + shippingCost;

    // 5. Generate Order Reference
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `ROC-${timestamp}-${randomSuffix}`;

    // 6. Persist Verified Order
    const newOrder = await Order.create({
      orderNumber,
      user: authenticatedUserId,
      items: verifiedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: (shippingAddress.email || authenticatedUserEmail).toLowerCase().trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state?.trim() || "Delhi",
        postalCode: shippingAddress.postalCode.trim(),
      },
      subtotal: calculatedSubtotal,
      shippingCost,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      orderStatus: "received",
    });

    // 7. Trigger Background Confirmation Email (Non-blocking)
    try {
      const customerEmail = newOrder.shippingAddress.email || authenticatedUserEmail;
      if (customerEmail) {
        const emailHtml = generateOrderEmailHtml({
          order: newOrder,
          customerName: newOrder.shippingAddress.fullName,
        });

        sendEmail({
          to: customerEmail,
          subject: `Order Confirmation #${newOrder.orderNumber} - Radha Outfit Collection`,
          html: emailHtml,
        }).catch((emailErr) => console.error("Async email dispatch failed:", emailErr));
      }
    } catch (err) {
      console.error("Email generation error:", err);
    }

    // 8. Return Final Order Success Response
    return NextResponse.json(
      {
        success: true,
        orderNumber: newOrder.orderNumber,
        orderId: newOrder._id.toString(),
        totalAmount: newOrder.totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order Placement Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm order. Please verify your details and try again." },
      { status: 500 }
    );
  }
}