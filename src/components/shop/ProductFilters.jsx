"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Charcoal", "Bone", "Ecru", "Slate", "Chalk White", "Washed Black", "Alabaster", "Espresso"];
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Sellers", value: "bestseller" },
];

export default function ProductFilters({ categories, totalProducts }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const currentSizes = searchParams.getAll("size");
  const currentColors = searchParams.getAll("color");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset pagination on filter mutation

    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleArrayParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    const currentValues = params.getAll(key);

    if (currentValues.includes(value)) {
      const updated = currentValues.filter((v) => v !== value);
      params.delete(key);
      updated.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setMobileDrawerOpen(false);
  };

  const FilterPanel = () => (
    <div className="space-y-8 text-sm">
      {/* Categories */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--text-primary)] mb-4">
          Categories
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => updateParam("category", "")}
              className={`text-left w-full transition-colors ${
                currentCategory === ""
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              All Items
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => updateParam("category", cat.slug)}
                className={`text-left w-full transition-colors ${
                  currentCategory === cat.slug
                    ? "text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sizes */}
      <div className="pt-6 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--text-primary)] mb-4">
          Sizes
        </h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sz) => {
            const isSelected = currentSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => toggleArrayParam("size", sz)}
                className={`w-9 h-9 flex items-center justify-center text-xs border rounded-[var(--radius-sm)] transition-all ${
                  isSelected
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-white"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="pt-6 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--text-primary)] mb-4">
          Colors
        </h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((col) => {
            const isSelected = currentColors.includes(col);
            return (
              <button
                key={col}
                onClick={() => toggleArrayParam("color", col)}
                className={`px-3 py-1 text-xs border rounded-[var(--radius-sm)] transition-all ${
                  isSelected
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-white"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                }`}
              >
                {col}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Action */}
      {(currentCategory || currentSizes.length > 0 || currentColors.length > 0 || minPrice || maxPrice) && (
        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={clearAllFilters}
            className="text-xs tracking-wider uppercase underline underline-offset-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Top Controls Bar: Mobile filter toggle, Product counter, Sort selection */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-xs uppercase tracking-wider text-[var(--text-primary)]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-normal">
            {totalProducts} {totalProducts === 1 ? "Product" : "Products"} Found
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="shop-sort" className="hidden sm:inline-block text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Sort:
          </label>
          <select
            id="shop-sort"
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-transparent text-xs tracking-wide text-[var(--text-primary)] border border-[var(--border-subtle)] py-1.5 px-2.5 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--text-primary)] cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Sidebar Layout Wrapper */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <FilterPanel />
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[var(--bg-surface)] h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)] mb-6">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--text-primary)]">
                Filters
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[var(--text-primary)] hover:opacity-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </>
  );
}