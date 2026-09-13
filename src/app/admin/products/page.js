"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  ArrowLeft,
  RefreshCw,
  Tag,
  QrCode,
  Scan,
  Sparkles,
} from "lucide-react";
import AddProductModal from "@/components/admin/AddProductModal";
import BannerManagerModal from "@/components/admin/BannerManagerModal";
import QRPreviewModal from "@/components/admin/qr/QRPreviewModal";
import QRScannerModal from "@/components/admin/qr/QRScannerModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // QR Modal States
  const [qrModalData, setQrModalData] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const loadProducts = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const url = new URL("/api/admin/products", window.location.origin);
      if (selectedCategory !== "all") {
        url.searchParams.set("category", selectedCategory);
      }
      if (search.trim()) {
        url.searchParams.set("q", search.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin garments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleStock = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !currentStatus }),
      });
      if (res.ok) loadProducts(true);
    } catch (err) {
      console.error("Error updating stock status:", err);
    }
  };

  const deleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) loadProducts(true);
    } catch (err) {
      console.error("Error deleting garment:", err);
    }
  };

  const handleOpenQR = async (product) => {
    try {
      const variant = product.variants?.[0] || {
        variantId: "var-default",
        sku: `${product.slug?.toUpperCase() || "ATELIER"}-M`,
        size: product.sizes?.[0] || "M",
        colorName: "Standard",
        stock: product.stockCount ?? 10,
        price: product.price,
        salePrice: product.salePrice,
      };

      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          variantId: variant.variantId,
          sku: variant.sku,
        }),
      });

      const data = await res.json();
      if (res.ok && data.qr) {
        setQrModalData({
          product,
          variant,
          token: data.qr.token,
          qrId: data.qr.qrId,
        });
      } else {
        alert(data.error || "Failed to generate QR tag.");
      }
    } catch (err) {
      console.error("QR trigger error:", err);
    }
  };

  const categories = [
    { id: "all", label: "All Curations" },
    { id: "men", label: "Men's Wardrobe" },
    { id: "women", label: "Women's Collection" },
    { id: "kids", label: "Kids' Curations" },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-6 sm:pt-10 pb-24 px-3.5 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 selection:bg-[#0C0D11] selection:text-white animate-luxury-fade overflow-x-hidden">
      {/* Ambient Radial Blobs */}
      <div className="pointer-events-none absolute top-4 left-1/4 w-[480px] h-[480px] bg-gradient-to-br from-blue-100/35 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-1/3 right-8 w-[420px] h-[420px] bg-gradient-to-tl from-rose-100/25 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10" />

      {/* 1. Header & Action Controls */}
      <header className="border-b border-black/[0.05] pb-5 sm:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="group inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <Sparkles className="w-2.5 h-2.5" /> Garments Registry
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#0C0D11] leading-tight">
              Garment Catalog & Rails
            </h1>
          </div>

          {/* Mobile Refresh Icon */}
          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            className="sm:hidden p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] active:scale-95 text-[#0C0D11] shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Refresh Garments"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Adaptive Action Bar */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5">
          {/* Desktop Refresh Button */}
          <button
            type="button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            className="hidden sm:inline-flex p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
            title="Refresh List"
            aria-label="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Scan QR Modal Trigger */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Scan className="w-4 h-4 text-[#3B7BF6]" />
            <span>Scan QR</span>
          </button>

          {/* Banner Manager Modal Trigger */}
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
            <BannerManagerModal onCreated={() => loadProducts(true)} />
          </div>

          {/* Add Product Modal Trigger */}
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
            <AddProductModal onCreated={() => loadProducts(true)} />
          </div>
        </div>
      </header>

      {/* 2. Category Rails Pills & Live Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-[#0C0D11] text-white shadow-xs"
                  : "bg-white/85 backdrop-blur-md text-[#8E92A2] border border-black/[0.06] hover:border-[#0C0D11] hover:text-[#0C0D11]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E92A2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search silhouette name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] focus:border-[#0C0D11] focus:bg-white outline-none text-xs font-medium placeholder:text-[#8E92A2] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* 3. Catalog Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C0D11]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#8E92A2]">
            Cataloging garments...
          </span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white/80 backdrop-blur-xl rounded-[32px] border border-dashed border-black/[0.12] space-y-3 px-4 shadow-2xs">
          <Package className="w-10 h-10 text-[#8E92A2] mx-auto opacity-70" />
          <h3 className="font-serif font-black uppercase text-sm text-[#0C0D11]">No Garments Found</h3>
          <p className="text-xs text-[#8E92A2] max-w-sm mx-auto font-mono">
            Click &ldquo;Add New Garment&rdquo; above to catalog a silhouette for this category rail.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((item) => {
            const hasDiscount = item.salePrice && item.price > item.salePrice;
            const displayCategory =
              typeof item.category === "string" && !/^[0-9a-fA-F]{24}$/.test(item.category)
                ? item.category
                : "Atelier Piece";

            return (
              <div
                key={item._id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] p-3 sm:p-3.5 border border-white/90 ring-1 ring-black/[0.03] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                {/* Image Showcase & Top Actions */}
                <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAFAFC] border border-black/[0.03]">
                  <Image
                    src={item.images?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Clean Category Label */}
                  <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/80 text-[8px] sm:text-[8.5px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] shadow-2xs">
                    {displayCategory}
                  </span>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => deleteProduct(item._id, item.name)}
                    className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-md text-rose-500 flex items-center justify-center hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer active:scale-90"
                    title="Delete Garment"
                    aria-label="Delete Garment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-1 px-1">
                  <div className="text-[9px] sm:text-[9.5px] font-mono text-[#8E92A2] uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{item.subcategory || "Haute Couture"}</span>
                  </div>
                  <h3 className="text-xs font-serif font-black uppercase tracking-tight text-[#0C0D11] truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1 font-mono">
                    <span className="text-xs font-black text-[#0C0D11]">
                      ₹{(item.salePrice || item.price || 0).toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="text-[9px] sm:text-[10px] text-[#8E92A2] line-through">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Toggle, QR Generator Trigger & Sizing */}
                <div className="border-t border-black/[0.04] pt-2 px-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleStock(item._id, item.inStock)}
                    className="inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-mono font-bold uppercase cursor-pointer active:scale-95 transition-transform"
                  >
                    {item.inStock ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                        <span className="text-emerald-800">In Stock</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                        <span className="text-rose-600">Sold Out</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenQR(item)}
                      className="p-1 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-neutral-100 transition-colors cursor-pointer active:scale-90"
                      title="Generate / Print QR Tag"
                      aria-label="Generate / Print QR Tag"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[8px] sm:text-[8.5px] font-mono text-[#8E92A2] uppercase">
                      {item.sizes?.length ? item.sizes.slice(0, 3).join("/") : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modals */}
      <QRPreviewModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
      />

      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}