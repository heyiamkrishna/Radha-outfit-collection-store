import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectToDatabase();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload received." },
        { status: 400 }
      );
    }

    const {
      productName,
      price,
      image,
      description,
      buyerName,
      buyerPhone,
      buyerCity,
      paymentMethod,
    } = body || {};

    if (!productName?.trim() || !price) {
      return NextResponse.json(
        { error: "Product name and price are required." },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid price amount." },
        { status: 400 }
      );
    }

    // Try finding any existing product to link to, otherwise generate a valid ObjectId
    let linkedProductId = new mongoose.Types.ObjectId();
    try {
      const anyProduct = await Product.findOne().select("_id").lean();
      if (anyProduct?._id) {
        linkedProductId = anyProduct._id;
      }
    } catch {
      // fallback to generated ObjectId
    }

    // Generate unique counter reference
    const count = await Order.countDocuments();
    const orderNumber = `ROC-POS-${Date.now().toString().slice(-4)}${count + 1}`;

    const newOrder = await Order.create({
      orderNumber,
      user: null, // Walk-in patron
      items: [
        {
          product: linkedProductId, // Satisfies Mongoose `items.0.product` required rule
          name: productName.trim(),
          price: parsedPrice,
          quantity: 1,
          image: image?.trim() || "/placeholder.jpg",
          size: "Free Size",
        },
      ],
      subtotal: parsedPrice,      // Satisfies Mongoose `subtotal` required rule
      tax: 0,
      shippingCost: 0,
      totalAmount: parsedPrice,
      shippingAddress: {
        fullName: buyerName?.trim() || "Counter Walk-in Patron",
        phone: buyerPhone?.trim() || "N/A",
        city: buyerCity?.trim() || "Atelier Boutique",
        street: description?.trim() || "Walk-in Counter Purchase",
        state: "Delhi",
        postalCode: "110001",
      },
      paymentMethod: paymentMethod || "cash",
      paymentStatus: "paid",
      orderStatus: "delivered", // Counter purchases are fulfilled immediately
      isManualEntry: true,
    });

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Manual order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Database failed to record order." },
      { status: 500 }
    );
  }
}