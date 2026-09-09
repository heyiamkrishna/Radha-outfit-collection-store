import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, Package } from "lucide-react";

// Curated atelier fallback items if no database products exist yet
const DEFAULT_FALLBACK_PRODUCTS = {
  men: [
    {
      _id: "preview-men-1",
      name: "Structured Bandhgala Sherwani",
      subcategory: "Heritage Couture",
      price: 18500,
      salePrice: 15999,
      images: [
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "structured-bandhgala-sherwani",
    },
    {
      _id: "preview-men-2",
      name: "Raw Silk Embroidered Kurta",
      subcategory: "Festive Occasion",
      price: 8999,
      salePrice: 6999,
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "raw-silk-embroidered-kurta",
    },
    {
      _id: "preview-men-3",
      name: "Obsidian Tailored Tuxedo Jacket",
      subcategory: "Atelier Evening",
      price: 24500,
      salePrice: 21999,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "obsidian-tailored-tuxedo-jacket",
    },
    {
      _id: "preview-men-4",
      name: "Ivory Silk Linen Nehru Vest",
      subcategory: "Modern Classic",
      price: 6500,
      salePrice: 5200,
      images: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "ivory-silk-linen-nehru-vest",
    },
  ],
  women: [
    {
      _id: "preview-women-1",
      name: "Zardozi Embroidered Crimson Lehenga",
      subcategory: "Bridal Couture",
      price: 48000,
      salePrice: 42500,
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "zardozi-embroidered-crimson-lehenga",
    },
    {
      _id: "preview-women-2",
      name: "Handwoven Tissue Silk Saree",
      subcategory: "Banarasi Archive",
      price: 19500,
      salePrice: 16800,
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "handwoven-tissue-silk-saree",
    },
    {
      _id: "preview-women-3",
      name: "Fluted Georgette Anarkali Gown",
      subcategory: "Evening Atelier",
      price: 15500,
      salePrice: 13200,
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "fluted-georgette-anarkali-gown",
    },
    {
      _id: "preview-women-4",
      name: "Pearl-Draped Velvet Corset Peplum",
      subcategory: "Haute Release",
      price: 12800,
      salePrice: 10999,
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "pearl-draped-velvet-corset-peplum",
    },
  ],
  kids: [
    {
      _id: "preview-kids-1",
      name: "Brocade Royal Sherwani Set",
      subcategory: "Junior Ceremonial",
      price: 6800,
      salePrice: 5400,
      images: [
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "brocade-royal-sherwani-set",
    },
    {
      _id: "preview-kids-2",
      name: "Pastel Silk Twirl Lehenga",
      subcategory: "Festive Junior",
      price: 7200,
      salePrice: 5900,
      images: [
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "pastel-silk-twirl-lehenga",
    },
    {
      _id: "preview-kids-3",
      name: "Embroidered Kurta & Dhoti Pair",
      subcategory: "Traditional Wear",
      price: 4500,
      salePrice: 3800,
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "embroidered-kurta-dhoti-pair",
    },
    {
      _id: "preview-kids-4",
      name: "Hand-Smocked Organza Party Frock",
      subcategory: "Couture Petite",
      price: 5200,
      salePrice: 4200,
      images: [
        "https://images.unsplash.com/photo-1471286174890-9c112ffca564?q=80&w=800&auto=format&fit=crop",
      ],
      slug: "hand-smocked-organza-party-frock",
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
  const normalizedCategory = (categorySlug || title || "all")
    .toString()
    .toLowerCase();
  
  const targetLink =
    viewAllLink || `/shop?category=${encodeURIComponent(normalizedCategory)}`;

  // Automatically detect if live products exist, otherwise use matching fallback collection
  const hasLiveProducts = Array.isArray(products) && products.length > 0;
  const fallbackKey = normalizedCategory.includes("men") && !normalizedCategory.includes("women")
    ? "men"
    : normalizedCategory.includes("women")
    ? "women"
    : normalizedCategory.includes("kid")
    ? "kids"
    : "men";

  const displayProducts = hasLiveProducts
    ? products.slice(0, 4)
    : (DEFAULT_FALLBACK_PRODUCTS[fallbackKey] || DEFAULT_FALLBACK_PRODUCTS.men);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 space-y-7">
      {/* Category Section Header */}
      <div className="flex items-end justify-between border-b border-[#E8EBF2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
              <Sparkles className="w-3 h-3" /> {badge}
            </span>
            {!hasLiveProducts && (
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Preview Curations
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-[#0C0D11]">
            {title}
          </h2>
          <p className="text-xs text-[#8E92A2] font-medium hidden sm:block">
            {subtitle}
          </p>
        </div>

        <Link
          href={targetLink}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors"
        >
          <span>View Collection</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Products Grid (Live or Fallback) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.map((item) => {
          const itemImage =
            item.images?.[0] || item.image || "/placeholder.jpg";
          const itemHref = hasLiveProducts
            ? `/shop/${item.slug || item._id}`
            : targetLink;

          return (
            <Link
              key={item._id}
              href={itemHref}
              className="group relative bg-white/80 backdrop-blur-xl rounded-[28px] p-3.5 border border-white/90 shadow-[0_8px_30px_rgba(12,13,17,0.03)] hover:shadow-[0_16px_40px_rgba(12,13,17,0.08)] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F4F5F9] mb-3">
                {itemImage ? (
                  <Image
                    src={itemImage}
                    alt={item.name || "Garment"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F4F5F9]">
                    <Package className="w-8 h-8 text-[#8E92A2]" />
                  </div>
                )}

                {item.subcategory && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-[9px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] shadow-2xs">
                    {item.subcategory}
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
          );
        })}
      </div>
    </section>
  );
}