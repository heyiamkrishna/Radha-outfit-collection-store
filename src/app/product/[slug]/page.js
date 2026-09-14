import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductActions from "@/components/product/ProductActions";
import ProductSpecifications from "@/components/product/ProductSpecifications";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Truck,
  ChevronRight,
  BadgePercent,
  Scissors,
  ArrowUpRight,
} from "lucide-react";

// Force real-time queries from MongoDB (bypasses stale ISR build cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 1. Fetch Related Curations
async function getRelatedProducts(currentProductId, category) {
  try {
    await connectToDatabase();
    const related = await Product.find({
      _id: { $ne: currentProductId },
      category: category,
      inStock: { $ne: false },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // Fallback fill if current category has fewer than 4 garments
    if (related.length < 4) {
      const backfill = await Product.find({
        _id: { $nin: [currentProductId, ...related.map((r) => r._id)] },
        inStock: { $ne: false },
      })
        .sort({ createdAt: -1 })
        .limit(4 - related.length)
        .lean();

      return JSON.parse(JSON.stringify([...related, ...backfill]));
    }

    return JSON.parse(JSON.stringify(related));
  } catch (error) {
    console.error("Failed to load suggested products:", error);
    return [];
  }
}

// 2. Dynamic OpenGraph & Meta Tags for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) return { title: "Garment Not Found | Radha Outfit Collection" };

  await connectToDatabase();
  let product = await Product.findOne({ slug }).lean();

  if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(slug).lean();
  }

  if (!product) {
    return {
      title: "Garment Not Found | Radha Outfit Collection",
      description: "The requested piece is no longer active in our atelier catalog.",
    };
  }

  const primaryImage = product.images?.[0] || product.image || "/placeholder.jpg";
  const displayPrice = product.salePrice || product.price;

  return {
    title: `${product.name} | Radha Outfit Collection`,
    description:
      product.description?.slice(0, 160) ||
      `Discover ${product.name}, crafted with bespoke tailoring at Radha Outfit Collection.`,
    openGraph: {
      title: `${product.name} — Radha Outfit Collection`,
      description: `Explore ${product.name} for ₹${displayPrice?.toLocaleString("en-IN")}. Luxury silhouette craftsmanship.`,
      url: `https://radha-outfit-collection.vercel.app/product/${product.slug}`,
      siteName: "Radha Outfit Collection",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: `Bespoke tailoring piece: ₹${displayPrice?.toLocaleString("en-IN")}`,
      images: [primaryImage],
    },
  };
}

// 3. Server Component Architecture
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) notFound();

  await connectToDatabase();

  let rawProduct = await Product.findOne({ slug }).lean();
  if (!rawProduct && slug.match(/^[0-9a-fA-F]{24}$/)) {
    rawProduct = await Product.findById(slug).lean();
  }

  if (!rawProduct) notFound();

  const product = JSON.parse(JSON.stringify(rawProduct));
  const suggestedProducts = await getRelatedProducts(product._id, product.category);

  // Discount & Valuation Calculations
  const originalPrice = Number(product.price || 0);
  const currentPrice = Number(product.salePrice || product.price || 0);
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;
  const amountSaved = originalPrice > currentPrice ? originalPrice - currentPrice : 0;

  // Google JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images || [product.image || "/placeholder.jpg"],
    description: product.description || `${product.name} by Radha Outfit Collection`,
    sku: product.styleCode || product._id?.toString(),
    brand: {
      "@type": "Brand",
      name: product.brand || "Radha Outfit Collection",
    },
    offers: {
      "@type": "Offer",
      url: `https://radha-outfit-collection.vercel.app/product/${product.slug}`,
      priceCurrency: "INR",
      price: currentPrice,
      priceValidUntil: "2027-12-31",
      availability:
        (product.stockCount ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen bg-[#FAFBFD] text-[#0C0D11] pt-3 sm:pt-6 md:pt-8 pb-24 sm:pb-32 px-3 sm:px-6 md:px-10 lg:px-12 overflow-x-hidden selection:bg-[#0C0D11] selection:text-white">
        
        {/* Responsive Ambient Atmospheric Glows */}
        <div className="pointer-events-none fixed top-[-5%] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-1/3 w-[300px] sm:w-[500px] lg:w-[650px] h-[300px] sm:h-[500px] lg:h-[650px] bg-gradient-to-br from-indigo-100/25 via-rose-50/15 to-transparent rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
          
          {/* ── 1. RESPONSIVE BREADCRUMBS & LIVE DISCOUNT CALLOUT ── */}
          <nav className="flex flex-wrap items-center justify-between gap-2.5 px-0.5 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono tracking-wider min-w-0">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-1.5 font-bold uppercase text-[#8E92A2] hover:text-[#0C0D11] transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Catalog</span>
              </Link>

              <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />

              <span className="uppercase text-[#8E92A2] font-semibold truncate hidden xs:inline">
                {product.category || "Atelier"}
              </span>

              <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0 hidden xs:inline" />

              <span className="uppercase text-[#0C0D11] font-bold truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">
                {product.name}
              </span>
            </div>

            {/* Discount Callout & Season Tag */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {discountPercent > 0 && (
                <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                  <BadgePercent className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>
                    Save {discountPercent}% <span className="hidden xs:inline">(₹{amountSaved.toLocaleString("en-IN")})</span>
                  </span>
                </div>
              )}

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/[0.06] text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#0C0D11] shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Edition 2026</span>
              </div>
            </div>
          </nav>

          {/* ── 2. PRIMARY BUY BOX & GALLERY (Self-Responsive) ── */}
          <section className="w-full">
            <ProductActions product={product} />
          </section>

          {/* ── 3. RESPONSIVE ASSURANCE MICRO-BAR ── */}
          <section className="pt-2 sm:pt-4">
            <div className="rounded-[20px] sm:rounded-2xl bg-white/80 backdrop-blur-md border border-black/[0.06] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] gap-2.5 sm:gap-0">
                {/* Transit */}
                <div className="flex items-center gap-3 sm:justify-center sm:px-3 lg:px-4 py-1.5 sm:py-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] truncate">
                      Complimentary Transit
                    </p>
                    <p className="text-[9px] sm:text-[9.5px] font-mono text-[#8E92A2] truncate">
                      Pan-India express courier dispatch
                    </p>
                  </div>
                </div>

                {/* Provenance */}
                <div className="flex items-center gap-3 sm:justify-center sm:px-3 lg:px-4 py-2 sm:py-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] truncate">
                      Artisan Provenance
                    </p>
                    <p className="text-[9px] sm:text-[9.5px] font-mono text-[#8E92A2] truncate">
                      100% verified handloom weave
                    </p>
                  </div>
                </div>

                {/* Alterations */}
                <div className="flex items-center gap-3 sm:justify-center sm:px-3 lg:px-4 py-2 sm:py-0">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] truncate">
                      Bespoke Alterations
                    </p>
                    <p className="text-[9px] sm:text-[9.5px] font-mono text-[#8E92A2] truncate">
                      Complimentary tailor concierge
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. TECHNICAL SPECIFICATIONS & HIGHLIGHTS DOSSIER ── */}
          <section className="pt-2 sm:pt-4">
            <ProductSpecifications product={product} />
          </section>

          {/* ── 5. CURATED PAIRINGS / RECOMMENDATIONS ── */}
          {suggestedProducts.length > 0 && (
            <section className="pt-6 sm:pt-10 md:pt-12 border-t border-black/[0.06] space-y-4 sm:space-y-6">
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-0.5 sm:space-y-1">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#3B7BF6]">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Curated Pairings
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                    Complete The Ensemble
                  </h3>
                </div>

                <Link
                  href={`/shop?category=${product.category || "all"}`}
                  className="group inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors pb-0.5 shrink-0"
                >
                  <span>Explore All</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* 2 Cols on Mobile, 3 on Tablet, 4 on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5">
                {suggestedProducts.map((item) => {
                  const itemOrigPrice = Number(item.price || 0);
                  const itemCurPrice = Number(item.salePrice || item.price || 0);
                  const itemDiscount =
                    itemOrigPrice > itemCurPrice
                      ? Math.round(((itemOrigPrice - itemCurPrice) / itemOrigPrice) * 100)
                      : 0;

                  return (
                    <Link
                      key={item._id}
                      href={`/product/${item.slug || item._id}`}
                      className="group relative bg-white rounded-[20px] sm:rounded-[24px] p-2 sm:p-3 border border-black/[0.06] shadow-2xs hover:shadow-md hover:border-black/[0.14] transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[3/4] w-full rounded-[14px] sm:rounded-[18px] overflow-hidden bg-[#F4F5F9] mb-2 sm:mb-3">
                        <Image
                          src={item.images?.[0] || item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          {item.category && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[7px] sm:text-[7.5px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] shadow-2xs border border-black/[0.04]">
                              {item.category}
                            </span>
                          )}
                          {itemDiscount > 0 && (
                            <span className="px-1 sm:px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[7px] sm:text-[7.5px] font-bold shadow-xs">
                              -{itemDiscount}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info & Valuation */}
                      <div className="space-y-0.5 sm:space-y-1 px-1 pb-1">
                        <span className="text-[7.5px] sm:text-[8px] font-mono uppercase text-[#8E92A2] block truncate">
                          {item.brand || "Radha Outfit Collection"}
                        </span>
                        <h4 className="text-[11px] sm:text-xs font-serif font-bold uppercase tracking-tight text-[#0C0D11] truncate group-hover:text-[#3B7BF6] transition-colors">
                          {item.name}
                        </h4>

                        <div className="flex items-baseline gap-1.5 pt-0.5 font-mono">
                          <span className="text-xs sm:text-sm font-black text-[#0C0D11]">
                            ₹{itemCurPrice.toLocaleString("en-IN")}
                          </span>
                          {itemDiscount > 0 && (
                            <span className="text-[9px] sm:text-[10px] text-[#8E92A2] line-through">
                              ₹{itemOrigPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}