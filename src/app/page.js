import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Product from "@/models/Product";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryShowcase from "@/components/home/CategoryShowcase";

// 1. Server-side Promotional Banners Query
async function getBanners() {
  try {
    await connectToDatabase();
    const customBanners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (customBanners.length > 0) {
      return JSON.parse(JSON.stringify(customBanners));
    }

    // Dynamic fallback to latest products if no custom banners are published
    const latestProducts = await Product.find({ inStock: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const fallbackBanners = latestProducts.map((p, idx) => ({
      _id: p._id.toString(),
      title: p.name,
      subtitle: p.category || "Haute Couture Silhouette",
      badge: idx === 0 ? "Latest Arrival" : "Exclusive Run",
      tagline: `₹${(p.salePrice || p.price || 0).toLocaleString("en-IN")}`,
      ctaText: "Order Piece",
      ctaLink: `/product/${p.slug || p._id}`,
      image: p.images?.[0] || "/placeholder.jpg",
      bgGradient:
        idx % 2 === 0
          ? "from-[#FFF5F5] via-[#FDF2F4] to-[#FDE8EC]"
          : "from-[#F0F4FF] via-[#F5F8FF] to-[#E8EFFF]",
    }));

    return JSON.parse(JSON.stringify(fallbackBanners));
  } catch (error) {
    console.error("Server getBanners Error:", error);
    return [];
  }
}

// 2. Server-side Latest Releases Query
async function getFeaturedProducts() {
  try {
    await connectToDatabase();
    const products = await Product.find({ inStock: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Server getFeaturedProducts Error:", error);
    return [];
  }
}

// 3. Server-side Query by Category (Men, Women, Kids)
async function getProductsByCategory(categoryName) {
  try {
    await connectToDatabase();

    let pattern = categoryName;
    if (categoryName.toLowerCase() === "men") {
      pattern = "^(men|mens|men's|male)";
    } else if (categoryName.toLowerCase() === "women") {
      pattern = "^(women|womens|women's|female|ladies)";
    } else if (categoryName.toLowerCase() === "kids") {
      pattern = "^(kid|kids|boy|girl|children|child)";
    }

    const query = {
      $or: [
        { category: { $regex: new RegExp(pattern, "i") } },
        { subcategory: { $regex: new RegExp(pattern, "i") } },
        { tags: { $in: [new RegExp(categoryName, "i")] } },
      ],
      inStock: { $ne: false },
    };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error(`Error loading ${categoryName} products:`, error);
    return [];
  }
}

export default async function HomePage() {
  const [banners, latestProducts, menProducts, womenProducts, kidsProducts] =
    await Promise.all([
      getBanners(),
      getFeaturedProducts(),
      getProductsByCategory("men"),
      getProductsByCategory("women"),
      getProductsByCategory("kids"),
    ]);

  return (
    <main className="min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-24 sm:pt-28 pb-24 selection:bg-[#0C0D11] selection:text-white">
      {/* 1. Flipkart-Style Swiper Peek Slider */}
      <HeroSlider banners={banners} />

      {/* 2. Latest Releases Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 sm:pt-10 space-y-8">
        <div className="flex items-end justify-between border-b border-[#E8EBF2] pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
              <Sparkles className="w-3 h-3" /> Selected Curations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-[#0C0D11]">
              Latest Releases
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors"
          >
            <span>Explore All</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {latestProducts.length === 0 ? (
          <div className="py-16 text-center rounded-[32px] bg-white/60 border border-dashed border-[#CBD5E1]">
            <p className="text-xs font-mono uppercase tracking-wider text-[#8E92A2]">
              No garments cataloged yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latestProducts.map((item) => (
              <Link
                key={item._id}
                href={`/product/${item.slug || item._id}`}
                className="group relative bg-white/80 backdrop-blur-xl rounded-[28px] p-3.5 border border-white/90 shadow-[0_8px_30px_rgba(12,13,17,0.03)] hover:shadow-[0_16px_40px_rgba(12,13,17,0.08)] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F4F5F9] mb-3">
                  <Image
                    src={item.images?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.category && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-[9px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] shadow-2xs">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="space-y-1 px-1 pb-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-1 font-mono">
                    <span className="text-xs font-black text-[#0C0D11]">
                      ₹{(item.salePrice || item.price || 0).toLocaleString("en-IN")}
                    </span>
                    {item.salePrice && item.price > item.salePrice && (
                      <span className="text-[10px] text-[#8E92A2] line-through">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Reusable Category Sections: Men, Women & Kids */}
      <div className="space-y-4 pt-6">
        <CategoryShowcase
          title="Men's Wardrobe"
          subtitle="Modern tailoring, structured silhouettes, and luxury essentials"
          badge="Masculine Atelier"
          categorySlug="men"
          products={menProducts}
        />

        <CategoryShowcase
          title="Women's Collection"
          subtitle="Fluid silks, artisanal embellishments, and contemporary drapes"
          badge="Feminine Couture"
          categorySlug="women"
          products={womenProducts}
        />

        <CategoryShowcase
          title="Kids' Curations"
          subtitle="Playful ceremonial wear, lightweight fabrics, and festive charm"
          badge="Junior Atelier"
          categorySlug="kids"
          products={kidsProducts}
        />
      </div>
    </main>
  );
}