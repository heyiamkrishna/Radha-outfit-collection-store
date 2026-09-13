import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Banner from "@/models/Banner";
import Product from "@/models/Product";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryShowcase from "@/components/home/CategoryShowcase";

async function getBanners() {
  try {
    await connectToDatabase();
    const customBanners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (customBanners.length > 0) {
      return JSON.parse(JSON.stringify(customBanners));
    }

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
    <main className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-16 sm:pt-24 pb-20 sm:pb-28 selection:bg-[#0C0D11] selection:text-white overflow-x-hidden">
      
      {/* Ambient background bloom */}
      <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 w-[320px] sm:w-[700px] h-[250px] bg-gradient-to-b from-blue-100/30 via-rose-50/15 to-transparent blur-3xl -z-10" />

      {/* 1. Hero Swiper */}
      <div className="relative">
        <HeroSlider banners={banners} />
      </div>

      {/* 2. Latest Releases Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 pt-6 sm:pt-10 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-black/[0.06] pb-3 sm:pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-[#3B7BF6]">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Selected Curations
            </span>
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black font-serif uppercase tracking-tight text-[#0C0D11]">
              Latest Releases
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors pb-0.5"
          >
            <span>Explore All</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {latestProducts.length === 0 ? (
          <div className="py-14 text-center rounded-[24px] bg-white/60 border border-dashed border-[#CBD5E1]">
            <p className="text-xs font-mono uppercase tracking-wider text-[#8E92A2]">
              No garments cataloged yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5 md:gap-6">
            {latestProducts.map((item) => (
              <Link
                key={item._id}
                href={`/product/${item.slug || item._id}`}
                className="group relative bg-white/90 backdrop-blur-md rounded-[18px] xs:rounded-[22px] sm:rounded-[26px] p-2.5 xs:p-3 sm:p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] w-full rounded-[14px] xs:rounded-[18px] sm:rounded-[20px] overflow-hidden bg-[#F4F5F9] mb-2 sm:mb-3">
                  <Image
                    src={item.images?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.category && (
                    <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider text-[#0C0D11]">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 sm:space-y-1 px-1 pb-0.5">
                  <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-[#0C0D11] truncate group-hover:text-[#3B7BF6] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-0.5 font-mono">
                    <span className="text-[11px] sm:text-xs font-black text-[#0C0D11]">
                      ₹{(item.salePrice || item.price || 0).toLocaleString("en-IN")}
                    </span>
                    {item.salePrice && item.price > item.salePrice && (
                      <span className="text-[9px] sm:text-[10px] text-[#8E92A2] line-through">
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

      {/* 3. Category Showcases */}
      <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10">
        <CategoryShowcase
          title="Men's Wardrobe"
          subtitle="Modern tailoring and structured silhouettes"
          badge="Masculine Atelier"
          categorySlug="men"
          products={menProducts}
        />

        <CategoryShowcase
          title="Women's Collection"
          subtitle="Fluid silks and contemporary artisanal drapes"
          badge="Feminine Couture"
          categorySlug="women"
          products={womenProducts}
        />

        <CategoryShowcase
          title="Kids' Curations"
          subtitle="Playful ceremonial wear and festive charm"
          badge="Junior Atelier"
          categorySlug="kids"
          products={kidsProducts}
        />
      </div>
    </main>
  );
}