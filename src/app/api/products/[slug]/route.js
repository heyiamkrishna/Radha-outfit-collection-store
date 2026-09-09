import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

// Curated demo catalog fallbacks so initial links never break
const DEMO_FALLBACKS = {
  "pleated-linen-trouser": {
    _id: "demo-linen-1",
    name: "Pleated Linen Trouser",
    slug: "pleated-linen-trouser",
    category: "men",
    subcategory: "Tailored Classics",
    price: 6999,
    salePrice: 5499,
    description:
      "Sculpted from high-twist European linen with double reverse pleats, natural horn buttons, and relaxed drape through the leg.",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=1200&auto=format&fit=crop",
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
};

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || slug === "undefined") {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Find by slug
    let product = await Product.findOne({ slug }).lean();

    // 2. Find by MongoDB ObjectId if slug happens to be an ID
    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
      product = await Product.findById(slug).lean();
    }

    // 3. Find by matching name conversion (e.g. "pleated-linen-trouser" -> "pleated linen trouser")
    if (!product) {
      const nameGuess = slug.replace(/-/g, " ");
      product = await Product.findOne({
        name: { $regex: new RegExp(`^${nameGuess}$`, "i") },
      }).lean();
    }

    // 4. If still not found, check demo fallbacks
    if (!product && DEMO_FALLBACKS[slug]) {
      product = DEMO_FALLBACKS[slug];
    }

    if (!product) {
      return NextResponse.json(
        { error: "Garment not found in catalog" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: JSON.parse(JSON.stringify(product)),
    });
  } catch (err) {
    console.error("API /api/products/[slug] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load garment." },
      { status: 500 }
    );
  }
}