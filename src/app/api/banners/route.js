import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectToDatabase from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Product from "@/models/Product";

// Public GET: Fetches active banners or falls back to latest products
export async function GET() {
  try {
    await connectToDatabase();

    const customBanners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (customBanners.length > 0) {
      return NextResponse.json({
        success: true,
        banners: JSON.parse(JSON.stringify(customBanners)),
      });
    }

    // Fallback: Generate dynamic promotional slides from latest products
    const latestProducts = await Product.find({ inStock: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const fallbackBanners = latestProducts.map((p, idx) => ({
      _id: p._id.toString(),
      title: p.name,
      subtitle: p.category || "Haute Couture Silhouette",
      badge: idx === 0 ? "Latest Arrival" : "Exclusive Run",
      tagline: `₹${(p.salePrice || p.price || 0).toLocaleString("en-IN")}`,
      ctaText: "Order Piece",
      ctaLink: `/shop/${p.slug || p._id}`,
      image: p.images?.[0] || "/placeholder.jpg",
      bgGradient:
        idx % 2 === 0
          ? "from-[#FFF5F5] via-[#FDF2F4] to-[#FDE8EC]"
          : "from-[#F0F4FF] via-[#F5F8FF] to-[#E8EFFF]",
      textColor: "#0C0D11",
      isActive: true,
    }));

    return NextResponse.json({
      success: true,
      banners: JSON.parse(JSON.stringify(fallbackBanners)),
    });
  } catch (error) {
    console.error("Banner fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load promotional carousel." },
      { status: 500 }
    );
  }
}

// Protected Admin POST: Adds a new banner
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("roc_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const banner = await Banner.create({
      title: body.title,
      subtitle: body.subtitle || "",
      badge: body.badge || "New Season",
      tagline: body.tagline || "",
      ctaText: body.ctaText || "Shop Now",
      ctaLink: body.ctaLink || "/shop",
      image: body.image,
      bgGradient: body.bgGradient || "from-[#F7F4EF] via-[#F4F5F9] to-[#E9EDF5]",
      order: body.order || 0,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error("Banner create error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}