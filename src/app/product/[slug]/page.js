import Link from "next/link";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductActions from "@/components/product/ProductActions";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";

// 1. Dynamic OpenGraph & Meta Tags for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) return { title: "Garment Not Found | Radha Outfit Collection" };

  await connectToDatabase();
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    return {
      title: "Garment Not Found | Radha Outfit Collection",
      description: "The requested piece is no longer active in our atelier catalog.",
    };
  }

  const primaryImage = product.images?.[0] || "/placeholder.jpg";
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

// 2. Server Component
export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) notFound();

  await connectToDatabase();
  const rawProduct = await Product.findOne({ slug }).lean();

  if (!rawProduct) {
    notFound();
  }

  const product = JSON.parse(JSON.stringify(rawProduct));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.description || `${product.name} by Radha Outfit Collection`,
    sku: product._id?.toString(),
    brand: {
      "@type": "Brand",
      name: "Radha Outfit Collection",
    },
    offers: {
      "@type": "Offer",
      url: `https://radha-outfit-collection.vercel.app/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.salePrice || product.price,
      availability: product.inStock
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

      <div className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-3 sm:pt-6 md:pt-8 pb-14 sm:pb-24 px-2.5 sm:px-6 md:px-12 overflow-x-hidden animate-luxury-fade">
        {/* Subtle Ambient Background Light */}
        <div className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-[280px] xs:w-[340px] sm:w-[600px] h-[240px] bg-gradient-to-b from-blue-100/30 via-rose-50/15 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="px-1 sm:px-0">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Return to Catalog</span>
            </Link>
          </div>

          {/* Interactive Garment Actions Stage */}
          <div className="w-full">
            <ProductActions product={product} />
          </div>

          {/* Atelier Guarantees Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 pt-6 sm:pt-10 border-t border-black/[0.06]">
            <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-3xl bg-white/85 backdrop-blur-md border border-black/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black/[0.03] text-[#0C0D11] flex items-center justify-center shrink-0 border border-black/[0.03]">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                  Complimentary Transit
                </p>
                <p className="text-[9px] sm:text-[11px] font-mono text-[#8E92A2] truncate">
                  Express Pan-India delivery
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-3xl bg-white/85 backdrop-blur-md border border-black/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black/[0.03] text-[#0C0D11] flex items-center justify-center shrink-0 border border-black/[0.03]">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                  Artisan Provenance
                </p>
                <p className="text-[9px] sm:text-[11px] font-mono text-[#8E92A2] truncate">
                  100% verified authentic runs
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-3xl bg-white/85 backdrop-blur-md border border-black/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black/[0.03] text-[#0C0D11] flex items-center justify-center shrink-0 border border-black/[0.03]">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B7BF6]" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                  Bespoke Consultation
                </p>
                <p className="text-[9px] sm:text-[11px] font-mono text-[#8E92A2] truncate">
                  Made-to-measure assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}