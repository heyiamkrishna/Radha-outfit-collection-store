import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        shippingFee: 0,
        taxAmount: 0,
        totalAmount: 0,
        itemCount: 0,
      });
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      const productId = item._id || item.id || item.productId;
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));

      const product = await Product.findById(productId).select("price salePrice variants").lean();
      if (!product) continue;

      let price = product.salePrice || product.price;

      if (product.variants && item.sku) {
        const variant = product.variants.find((v) => v.sku === item.sku);
        if (variant && (variant.salePrice || variant.price)) {
          price = variant.salePrice || variant.price;
        }
      }

      subtotal += price * qty;
      itemCount += qty;
    }

    const shippingFee = subtotal >= 10000 || subtotal === 0 ? 0 : 499;
    const taxAmount = Math.round(subtotal * 0.12);
    const totalAmount = subtotal + shippingFee;

    return NextResponse.json({
      success: true,
      subtotal,
      shippingFee,
      taxAmount,
      totalAmount,
      itemCount,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}