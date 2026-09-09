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

// 2. Server Component (Direct DB query = fast, no JSON/HTML parse errors)
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

      <div className="min-h-screen bg-[#F7F8FA] py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
            </Link>
          </div>

          {/* Using your existing component in src/components/product/ProductActions.jsx */}
          <ProductActions product={product} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-10 border-t border-[#E8EBF2]">
            <div className="p-6 rounded-3xl bg-white border border-[#E8EBF2] shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F9] text-[#0C0D11] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0C0D11]">
                  Complimentary Transit
                </p>
                <p className="text-[11px] text-[#8E92A2]">Express door-to-door delivery</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8EBF2] shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F9] text-[#0C0D11] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0C0D11]">
                  Artisan Quality
                </p>
                <p className="text-[11px] text-[#8E92A2]">100% verified material provenance</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8EBF2] shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F9] text-[#0C0D11] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0C0D11]">
                  Custom Adjustment
                </p>
                <p className="text-[11px] text-[#8E92A2]">Consultative fitting support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}