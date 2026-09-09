import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/adminAuth";
import { createOrUpdateQRCode } from "@/lib/qr";

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const { productId, variantId, sku, regenerate = false } = body;

    if (!productId || !variantId || !sku) {
      return NextResponse.json(
        { error: "productId, variantId, and sku are mandatory to generate a QR code." },
        { status: 400 }
      );
    }

    const qrRecord = await createOrUpdateQRCode({
      productId,
      variantId,
      sku,
      regenerate: Boolean(regenerate),
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const publicUrl = `${origin}/p/q/${qrRecord.token}`;

    return NextResponse.json({
      success: true,
      qr: qrRecord,
      publicUrl,
    });
  } catch (err) {
    console.error("QR Generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate QR code." }, { status: 500 });
  }
}