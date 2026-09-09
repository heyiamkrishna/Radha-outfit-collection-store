import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import InventoryTransaction from "@/models/InventoryTransaction";
import { verifyAdminSession } from "@/lib/adminAuth";
import { adjustVariantStock } from "@/lib/inventory";

// GET: Retrieve inventory transaction audit log
export async function GET(req) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (sku) filter.sku = sku.toUpperCase();

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(filter)
        .populate("productId", "name slug images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryTransaction.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      transactions: JSON.parse(JSON.stringify(transactions)),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Execute manual Stock In / Stock Out / Adjustment
export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const { productId, variantId, sku, type, quantity, reason } = body;

    if (!productId || !quantity || !type) {
      return NextResponse.json(
        { error: "productId, quantity, and transaction type are mandatory." },
        { status: 400 }
      );
    }

    const qtyNumber = parseInt(quantity, 10);
    const delta = type === "STOCK_OUT" ? -Math.abs(qtyNumber) : Math.abs(qtyNumber);

    const result = await adjustVariantStock({
      productId,
      variantId,
      sku,
      quantityChange: delta,
      type,
      reason: reason || "Admin Manual Inventory Adjustment",
      performedBy: `admin:${auth.user.email || auth.user.userId}`,
    });

    return NextResponse.json({
      success: true,
      message: "Inventory updated and transaction logged.",
      newStock: result.newStock,
      transaction: result.transaction,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}