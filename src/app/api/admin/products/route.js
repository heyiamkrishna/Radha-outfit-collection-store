import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(req) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    let filter = {};
    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(`^${category}`, "i") };
    }
    if (query?.trim()) {
      filter.$or = [
        { name: { $regex: query.trim(), $options: "i" } },
        { "variants.sku": { $regex: query.trim(), $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.price || !body.category || !body.images?.[0]) {
      return NextResponse.json(
        { error: "Garment name, category, price, and at least one image are mandatory." },
        { status: 400 }
      );
    }

    const cleanSlug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    // Build default initial variants if none supplied from simple UI
    const defaultSizes = body.sizes?.length ? body.sizes : ["S", "M", "L", "XL"];
    const baseStockPerSize = Math.max(1, Math.floor((Number(body.stockCount) || 12) / defaultSizes.length));
    
    const variants = body.variants?.length
      ? body.variants
      : defaultSizes.map((sz, idx) => ({
          variantId: `var-${Date.now().toString(36)}-${idx}`,
          colorName: body.colorName || "Standard",
          colorHex: body.colorHex || "#0C0D11",
          size: sz,
          sku: `${cleanSlug.substring(0, 8).toUpperCase()}-${sz}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          price: Number(body.price),
          salePrice: body.salePrice ? Number(body.salePrice) : Number(body.price),
          stock: baseStockPerSize,
          images: Array.isArray(body.images) ? body.images : [body.images],
        }));

    const product = await Product.create({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || "Handcrafted with luxury fabrics and bespoke master tailoring.",
      category: body.category.toLowerCase().trim(),
      subcategory: body.subcategory?.trim() || "Haute Couture",
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : Number(body.price),
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [body.images],
      variants,
      sizes: defaultSizes,
      inStock: body.inStock ?? true,
      stockCount: variants.reduce((acc, v) => acc + (v.stock || 0), 0),
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}