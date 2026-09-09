import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import QRCode from "@/models/QRCode";
import Product from "@/models/Product";
import QRScanLog from "@/models/QRScanLog";
import { verifyAdminSession } from "@/lib/adminAuth";
import { adjustVariantStock } from "@/lib/inventory";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { token, action = "ADMIN_SCAN", stockAdjustment = 0, reason } = body;

    if (!token?.trim()) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    // 1. Resolve token in DB
    const qr = await QRCode.findOne({ token: token.trim() });
    if (!qr) {
      return NextResponse.json({ error: "QR code not recognized in system." }, { status: 404 });
    }

    if (qr.status === "DISABLED") {
      return NextResponse.json({ error: "This QR code has been disabled by administration." }, { status: 410 });
    }

    // 2. Fetch corresponding Product & Variant
    const product = await Product.findById(qr.productId).lean();
    if (!product) {
      return NextResponse.json({ error: "Associated garment silhouette has been removed." }, { status: 404 });
    }

    const variant = product.variants?.find((v) => v.variantId === qr.variantId || v.sku === qr.sku) || {
      sku: qr.sku,
      size: "M",
      colorName: "Classic",
      stock: product.stockCount ?? 0,
      price: product.price,
      salePrice: product.salePrice,
    };

    // 3. Increment scan counts
    await QRCode.updateOne(
      { _id: qr._id },
      { $inc: { scansCount: 1 }, $set: { lastScannedAt: new Date() } }
    );

    // 4. Log Scan event
    await QRScanLog.create({
      qrId: qr.qrId,
      productId: product._id,
      variantId: qr.variantId,
      sku: qr.sku,
      action,
      scannedBy: "admin",
      metadata: { stockAdjustment },
    });

    // 5. Handle direct stock adjustment if sent with scan
    let updatedStock = variant.stock;
    if (stockAdjustment !== 0) {
      const auth = await verifyAdminSession();
      if (!auth.authorized) {
        return NextResponse.json({ error: "Admin privilege required to update stock." }, { status: 403 });
      }

      const adjResult = await adjustVariantStock({
        productId: product._id,
        variantId: qr.variantId,
        sku: qr.sku,
        quantityChange: Number(stockAdjustment),
        type: stockAdjustment > 0 ? "STOCK_IN" : "STOCK_OUT",
        reason: reason || "QR Scanner Stock Adjustment",
        performedBy: `admin:${auth.user?.email || "desk"}`,
      });
      updatedStock = adjResult.newStock;
    }

    return NextResponse.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        image: variant.images?.[0] || product.images?.[0] || "/placeholder.jpg",
      },
      variant: {
        ...variant,
        stock: updatedStock,
      },
      qr: {
        qrId: qr.qrId,
        token: qr.token,
        status: qr.status,
        scansCount: qr.scansCount + 1,
      },
    });
  } catch (err) {
    console.error("QR Scan execution error:", err);
    return NextResponse.json({ error: err.message || "Scan validation failed." }, { status: 500 });
  }
}