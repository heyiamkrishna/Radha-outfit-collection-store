import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, Package } from "lucide-react";

const DEFAULT_FALLBACK_PRODUCTS = {
  men: [
    {
      _id: "preview-men-1",
      name: "Structured Bandhgala Sherwani",
      subcategory: "Heritage Couture",
      price: 18500,
      salePrice: 15999,
      images: ["https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop"],
      slug: "structured-bandhgala-sherwani",
    },
    {
      _id: "preview-men-2",
      name: "Raw Silk Kurta",
      subcategory: "Festive Occasion",
      price: 8999,
      salePrice: 6999,
      images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"],
      slug: "raw-silk-kurta",
    },
    {
      _id: "preview-men-3",
      name: "Obsidian Tuxedo Jacket",
      subcategory: "Atelier Evening",
      price: 24500,
      salePrice: 21999,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop"],
      slug: "obsidian-tuxedo-jacket",
    },
    {
      _id: "preview-men-4",
      name: "Ivory Silk Linen Nehru Vest",
      subcategory: "Modern Classic",
      price: 6500,
      salePrice: 5200,
      images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop"],
      slug: "ivory-silk-linen-nehru-vest",
    },
  ],
  women: [
    {
      _id: "preview-women-1",
      name: "Crimson Zardozi Lehenga",
      subcategory: "Bridal Couture",
      price: 48000,
      salePrice: 42500,
      images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop"],
      slug: "crimson-zardozi-lehenga",
    },
    {
      _id: "preview-women-2",
      name: "Handwoven Tissue Silk Saree",
      subcategory: "Banarasi Archive",
      price: 19500,
      salePrice: 16800,
      images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"],
      slug: "handwoven-tissue-silk-saree",
    },
    {
      _id: "preview-women-3",
      name: "Fluted Georgette Anarkali Gown",
      subcategory: "Evening Atelier",
      price: 15500,
      salePrice: 13200,
      images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop"],
      slug: "fluted-georgette-anarkali-gown",
    },
    {
      _id: "preview-women-4",
      name: "Pearl-Draped Velvet Peplum",
      subcategory: "Haute Release",
      price: 12800,
      salePrice: 10999,
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"],
      slug: "pearl-draped-velvet-peplum",
    },
  ],
  kids: [
    {
      _id: "preview-kids-1",
      name: "Brocade Royal Sherwani Set",
      subcategory: "Junior Ceremonial",
      price: 6800,
      salePrice: 5400,
      images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop"],
      slug: "brocade-royal-sherwani-set",
    },
    {
      _id: "preview-kids-2",
      name: "Pastel Silk Twirl Lehenga",
      subcategory: "Festive Junior",
      price: 7200,
      salePrice: 5900,
      images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop"],
      slug: "pastel-silk-twirl-lehenga",
    },
    {
      _id: "preview-kids-3",
      name: "Embroidered Kurta & Dhoti Pair",
      subcategory: "Traditional Wear",
      price: 4500,
      salePrice: 3800,
      images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop"],
      slug: "embroidered-kurta-dhoti-pair",
    },
    {
      _id: "preview-kids-4",
      name: "Hand-Smocked Organza Frock",
      subcategory: "Couture Petite",
      price: 5200,
      salePrice: 4200,
      images: ["https://images.unsplash.com/photo-1471286174890-9c112ffca564?q=80&w=800&auto=format&fit=crop"],
      slug: "hand-smocked-organza-frock",
    },
  ],
};

export default function CategoryShowcase({
  title = "Collection",
  subtitle = "Curated Silhouettes",
  badge = "Atelier Collection",
  categorySlug = "",
  products = [],
  viewAllLink,
}) {
  const normalizedCategory = (categorySlug || title || "all").toString().toLowerCase();
  const targetLink = viewAllLink || `/shop?category=${encodeURIComponent(normalizedCategory)}`;

  const hasLiveProducts = Array.isArray(products) && products.length > 0;
  const fallbackKey =
    normalizedCategory.includes("men") && !normalizedCategory.includes("women")
      ? "men"
      : normalizedCategory.includes("women")
      ? "women"
      : normalizedCategory.includes("kid")
      ? "kids"
      : "men";

  const displayProducts = hasLiveProducts
    ? products.slice(0, 4)
    : DEFAULT_FALLBACK_PRODUCTS[fallbackKey] || DEFAULT_FALLBACK_PRODUCTS.men;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 py-5 sm:py-10 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-black/[0.06] pb-3 sm:pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-[#3B7BF6]">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {badge}
            </span>
            {!hasLiveProducts && (
              <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Preview
              </span>
            )}
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black font-serif uppercase tracking-tight text-[#0C0D11]">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#8E92A2] font-medium hidden sm:block">
            {subtitle}
          </p>
        </div>

        <Link
          href={targetLink}
          className="group inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors pb-0.5"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-5 md:gap-6">
        {displayProducts.map((item) => {
          const itemImage = item.images?.[0] || item.image || "/placeholder.jpg";
          const itemHref = hasLiveProducts ? `/product/${item.slug || item._id}` : targetLink;

          return (
            <Link
              key={item._id}
              href={itemHref}
              className="group relative bg-white/90 backdrop-blur-md rounded-[18px] xs:rounded-[22px] sm:rounded-[26px] p-2.5 xs:p-3 sm:p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full rounded-[14px] xs:rounded-[18px] sm:rounded-[20px] overflow-hidden bg-[#F4F5F9] mb-2 sm:mb-3">
                {itemImage ? (
                  <Image
                    src={itemImage}
                    alt={item.name || "Garment"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F4F5F9]">
                    <Package className="w-6 h-6 text-[#8E92A2]" />
                  </div>
                )}

                {item.subcategory && (
                  <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider text-[#0C0D11]">
                    {item.subcategory}
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
          );
        })}
      </div>
    </section>
  );
}