"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { Search, X } from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDept = searchParams.get("department") || "all";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (currentDept !== "all") params.set("department", currentDept);
    if (search.trim()) params.set("search", search.trim());
    if (sort !== "newest") params.set("sort", sort);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [currentDept, search, sort]);

  const departments = [
    { label: "All Garments", value: "all" },
    { label: "Women", value: "women" },
    { label: "Men", value: "men" },
    { label: "Kids", value: "kids" },
    { label: "Unisex", value: "unisex" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 space-y-8">
      {/* Header & Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#E8EBF2] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B7BF6]">
            Radha Outfit Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C0D11] tracking-tight mt-0.5">
            Curated Wardrobe
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search garments..."
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-white border border-[#E8EBF2] text-xs outline-none focus:border-[#0C0D11] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E92A2] hover:text-[#0C0D11]"
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white border border-[#E8EBF2] text-xs font-bold text-[#0C0D11] outline-none cursor-pointer"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {departments.map((dept) => (
          <button
            key={dept.value}
            onClick={() =>
              router.push(dept.value === "all" ? "/shop" : `/shop?department=${dept.value}`)
            }
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              currentDept === dept.value
                ? "bg-[#0C0D11] text-white shadow-xs"
                : "bg-white text-[#4A4D59] hover:bg-[#F4F5F9] border border-[#E8EBF2]"
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0C0D11] border-t-transparent animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-[32px] border border-[#E8EBF2] space-y-2">
          <p className="text-sm font-bold text-[#0C0D11]">No garments matched your criteria</p>
          <p className="text-xs text-[#8E92A2]">Try resetting your search query or department filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((item) => (
            <ProductCard key={item._id} product={item} />
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