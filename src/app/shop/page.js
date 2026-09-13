"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { Search, X, Sparkles } from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDept =
    searchParams.get("department") || searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (currentDept !== "all") {
      params.set("department", currentDept);
      params.set("category", currentDept);
    }
    if (search.trim()) params.set("search", search.trim());
    if (sort !== "newest") params.set("sort", sort);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        if (isMounted) setProducts(data.products || []);
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDept, search, sort]);

  const departments = [
    { label: "All Garments", value: "all" },
    { label: "Women", value: "women" },
    { label: "Men", value: "men" },
    { label: "Kids", value: "kids" },
    { label: "Unisex", value: "unisex" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-12 py-6 sm:py-12 space-y-6 sm:space-y-8 animate-luxury-fade">
      {/* Header & Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-5 sm:pb-6 border-b border-black/[0.06] gap-4 sm:gap-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#3B7BF6]">
            <Sparkles className="w-3 h-3" /> Radha Atelier
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
            Curated Wardrobe
          </h1>
          <p className="text-[11px] sm:text-xs text-[#8E92A2] font-medium">
            Discover bespoke tailoring, artisanal embroideries, and modern luxury essentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search garments..."
              className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-full bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11] focus:ring-1 focus:ring-[#0C0D11] transition-all shadow-2xs placeholder:text-[#8E92A2]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E92A2] hover:text-[#0C0D11] transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price & Date Sorting */}
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-[#0C0D11] outline-none cursor-pointer shadow-2xs hover:border-[#0C0D11] transition-all"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {departments.map((dept) => (
          <button
            key={dept.value}
            type="button"
            onClick={() =>
              router.push(dept.value === "all" ? "/shop" : `/shop?department=${dept.value}`)
            }
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap active:scale-95 cursor-pointer ${
              currentDept === dept.value
                ? "bg-[#0C0D11] text-white shadow-xs"
                : "bg-white text-[#4A4D59] hover:bg-neutral-100 border border-black/[0.06] shadow-2xs"
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Product Grid / Skeleton Shimmer */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-[22px] sm:rounded-[30px] p-3 sm:p-4 border border-black/[0.05] animate-pulse space-y-3"
            >
              <div className="aspect-square w-full rounded-[16px] sm:rounded-[22px] bg-neutral-200/70" />
              <div className="h-3 w-1/3 bg-neutral-200/70 rounded-full" />
              <div className="h-4 w-3/4 bg-neutral-200/70 rounded-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-1/2 bg-neutral-200/70 rounded-full" />
                <div className="w-7 h-7 bg-neutral-200/70 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.06] shadow-2xs space-y-2">
          <p className="text-sm font-serif font-black uppercase tracking-wider text-[#0C0D11]">
            No garments matched your criteria
          </p>
          <p className="text-xs text-[#8E92A2]">
            Try resetting your search query or department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((item, idx) => (
            <div
              key={item._id}
              style={{
                animationDelay: `${Math.min(idx * 40, 320)}ms`,
              }}
              className="animate-luxury-fade"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0C0D11] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}