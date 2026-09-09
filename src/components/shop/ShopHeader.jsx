"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function ShopHeader({ activeCategory, totalCount }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="mb-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
            Catalog & Essentials
          </span>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[var(--text-primary)] mt-1">
            Shop Wardrobe
          </h1>
        </div>

        {/* Global Catalog Search Form */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items, fabrics, SKU..."
            className="w-full bg-transparent text-xs py-2.5 pl-3 pr-9 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--text-primary)] placeholder-[var(--text-muted)] text-[var(--text-primary)]"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Submit search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}