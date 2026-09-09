import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { adjustVariantStock } from "@/lib/inventory";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { items, shippingAddress, paymentMethod = "COD" } = body;

    // 1. Basic payload validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.street ||
      !shippingAddress?.city
    ) {
      return NextResponse.json(
        { error: "Full name, mobile number, street address, and city are mandatory." },
        { status: 400 }
      );
    }

    // 2. Safe authentication check (guest checkout friendly)
    let authenticatedUserId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("roc_token")?.value;

      if (token && process.env.JWT_SECRET) {
        const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, encodedSecret);
        const candidateId = payload.userId || payload.id || payload._id;

        // Verify it is a valid MongoDB ObjectId format
        if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
          authenticatedUserId = candidateId;
        }
      }
    } catch {
      // Token missing or expired -> proceed gracefully as guest
      authenticatedUserId = null;
    }

    // 3. Server-authoritative catalog price verification & stock validation
    let verifiedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const clientItem of items) {
      const productId = clientItem._id || clientItem.id || clientItem.productId;
      const requestedQty = Math.max(1, parseInt(clientItem.quantity || 1, 10));
      const requestedSize = clientItem.size || "M";

      if (!productId) {
        return NextResponse.json(
          { error: "Invalid product identified in cart." },
          { status: 400 }
        );
      }

      const dbProduct = await Product.findById(productId).lean();
      if (!dbProduct) {
        return NextResponse.json(
          {
            error: `Garment "${clientItem.name || productId}" is no longer available in the atelier.`,
          },
          { status: 404 }
        );
      }

      // Identify variant by SKU or size match
      let matchedVariant = null;
      if (dbProduct.variants && dbProduct.variants.length > 0) {
        matchedVariant =
          dbProduct.variants.find((v) => clientItem.sku && v.sku === clientItem.sku) ||
          dbProduct.variants.find((v) => v.size === requestedSize);
      }

      // Check real-time stock
      const availableStock = matchedVariant
        ? matchedVariant.stock
        : dbProduct.stockCount ?? 10;

      if (availableStock < requestedQty) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${dbProduct.name}" (${requestedSize}). In stock: ${availableStock}, requested: ${requestedQty}.`,
          },
          { status: 400 }
        );
      }

      // Extract server-verified unit price (ignore any price payload sent by client)
      const unitPrice =
        matchedVariant?.salePrice ||
        matchedVariant?.price ||
        dbProduct.salePrice ||
        dbProduct.price ||
        0;

      verifiedSubtotal += unitPrice * requestedQty;

      verifiedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: unitPrice,
        quantity: requestedQty,
        size: requestedSize,
        color: matchedVariant?.colorName || clientItem.color || "Standard",
        sku:
          matchedVariant?.sku ||
          `${dbProduct.slug?.toUpperCase() || "ATELIER"}-${requestedSize}`,
        image:
          matchedVariant?.images?.[0] ||
          dbProduct.images?.[0] ||
          "/placeholder.jpg",
      });
    }

    // 4. Server-side calculations (GST & Delivery fees)
    const shippingFee = verifiedSubtotal >= 10000 || verifiedSubtotal === 0 ? 0 : 499;
    const taxAmount = Math.round(verifiedSubtotal * 0.12);
    const verifiedTotalAmount = verifiedSubtotal + shippingFee;

    // 5. Generate human-readable order number: ROC-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ROC-${dateStr}-${randomSuffix}`;

    // 6. Build Order document payload
    const orderPayload = {
      orderNumber,
      items: verifiedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: shippingAddress.email?.trim() || "guest@radhaoutfit.com",
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state?.trim() || "State",
        postalCode: shippingAddress.postalCode?.trim() || "000000",
        country: shippingAddress.country?.trim() || "India",
      },
      subtotal: verifiedSubtotal,
      shippingFee,
      taxAmount,
      totalAmount: verifiedTotalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
      orderStatus: "received",
    };

    // Attach user field ONLY when a valid user ID was authenticated (prevents schema validation crashes)
    if (authenticatedUserId) {
      orderPayload.user = authenticatedUserId;
    }

    const newOrder = await Order.create(orderPayload);

    // 7. Atomically deduct inventory & record audit transaction logs
    for (const item of verifiedOrderItems) {
      try {
        await adjustVariantStock({
          productId: item.product,
          sku: item.sku,
          quantityChange: -item.quantity,
          type: "SALE",
          reason: `Customer Purchase Order ${newOrder.orderNumber}`,
          performedBy: authenticatedUserId ? `user:${authenticatedUserId}` : "guest_checkout",
        });
      } catch (stockErr) {
        console.error(`Inventory deduction log warning for SKU ${item.sku}:`, stockErr.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: {
          _id: newOrder._id,
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount,
          paymentStatus: newOrder.paymentStatus,
          orderStatus: newOrder.orderStatus,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Checkout execution error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process order." },
      { status: 500 }
    );
  }
}