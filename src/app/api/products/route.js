import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query = {};

    // 1. Match both 'category' and 'department' case-insensitively
    if (department && department.toLowerCase() !== "all") {
      const reg = new RegExp(`^${department.trim()}$`, "i");
      query.$or = [
        { category: reg },
        { department: reg },
        { subcategory: reg },
      ];
    }

    // 2. Keyword search
    if (search && search.trim()) {
      const searchReg = new RegExp(search.trim(), "i");
      const searchConditions = [
        { name: searchReg },
        { description: searchReg },
        { brand: searchReg },
        { category: searchReg },
        { "variants.sku": searchReg },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // 3. Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1, salePrice: 1 };
    if (sort === "price-high") sortOption = { price: -1, salePrice: -1 };

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map((p) => ({
        ...p,
        _id: p._id.toString(),
        images:
          Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : [p.image || "/placeholder.jpg"],
        price: Number(p.price || 0),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
    });
  } catch (err) {
    console.error("Products List API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load products" },
      { status: 500 }
    );
  }
}