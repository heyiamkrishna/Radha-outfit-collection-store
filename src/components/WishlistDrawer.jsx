"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistDrawer() {
  const [mounted, setMounted] = useState(false);

  // Stable, non-referential Zustand selectors
  const isOpen = useWishlistStore((state) => state.isWishlistOpen);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);
  const items = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict scroll lock on viewport
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (typeof closeWishlist === "function") {
      closeWishlist();
    } else {
      useWishlistStore.setState({ isWishlistOpen: false });
    }
  };

  const handleMoveToBag = (product) => {
    if (!product) return;
    addToCart(product, "M", 1);
    toggleWishlist(product);
  };

  if (!mounted || !isOpen) return null;

  const wishlistItems = items || [];
  const totalValuation = wishlistItems.reduce(
    (acc, curr) => acc + Number(curr.salePrice || curr.price || 0),
    0
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex justify-end overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
      }}
    >
      {/* ── Ambient Dark Blur Backdrop ── */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* ── Sliding Canvas Vault ── */}
      <div className="relative z-10 w-full sm:max-w-md bg-[#FAFBFD] h-full shadow-[0_30px_80px_-15px_rgba(0,0,0,0.45)] flex flex-col justify-between overflow-hidden border-l border-black/[0.08] animate-in slide-in-from-right duration-300">
        
        {/* ── 1. VAULT HEADER ── */}
        <div className="bg-white px-5 sm:px-6 py-4 sm:py-5 border-b border-black/[0.06] flex items-center justify-between shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[8.5px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#8E92A2]">
                Personal Archive
              </span>
            </div>
            <h3 className="font-serif font-black uppercase text-base sm:text-lg tracking-tight text-[#0C0D11] truncate">
              Saved Silhouettes
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-[9.5px] sm:text-[10px] font-mono uppercase font-bold text-[#8E92A2] hover:text-rose-600 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50/70 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer active:scale-90"
              aria-label="Close Wishlist Drawer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. SCROLLABLE VAULT INTERIOR ── */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          style={{ overscrollBehavior: "contain" }}
        >
          {wishlistItems.length === 0 ? (
            /* ── A. EMPTY ATELIER VAULT STATE ── */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-500 shadow-2xs">
                  <Heart className="w-8 h-8 stroke-[1.25]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#8E92A2]">
                  Vault Unpopulated
                </span>
                <h4 className="font-serif font-black uppercase text-base sm:text-lg tracking-tight text-[#0C0D11]">
                  Your Wishlist Is Empty
                </h4>
                <p className="text-[11px] font-mono text-[#8E92A2] leading-relaxed">
                  You haven&apos;t archived any bespoke garments yet. Explore the seasonal rails and tap the heart on any piece to curate your private wardrobe.
                </p>
              </div>

              <Link
                href="/shop"
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>Explore Catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* ── B. POPULATED PIECE STREAM ── */
            <div className="space-y-3.5">
              {/* Vault Metric Header */}
              <div className="flex items-center justify-between px-1 text-[10px] font-mono uppercase tracking-wider text-[#8E92A2]">
                <span className="font-bold text-[#0C0D11]">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "Curated Piece" : "Curated Pieces"}
                </span>
                <span>Atelier Certified</span>
              </div>

              {/* Garment Cards */}
              {wishlistItems.map((item) => {
                const itemId = item._id || item.id;
                const price = Number(item.salePrice || item.price || 0);
                const originalPrice = Number(item.price || item.salePrice || 0);

                return (
                  <div
                    key={itemId}
                    className="p-3.5 rounded-[24px] bg-white border border-black/[0.06] shadow-2xs space-y-3 hover:border-black/[0.15] transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Garment Thumbnail */}
                      <Link
                        href={`/product/${item.slug || itemId}`}
                        onClick={handleClose}
                        className="relative w-16 h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.05] shrink-0"
                      >
                        <Image
                          src={item.image || item.images?.[0] || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="64px"
                        />
                      </Link>

                      {/* Piece Information */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#3B7BF6] border border-blue-100/60">
                          {item.category || "Haute Couture"}
                        </span>
                        <h4 className="font-serif font-bold uppercase text-xs sm:text-sm text-[#0C0D11] truncate">
                          <Link
                            href={`/product/${item.slug || itemId}`}
                            onClick={handleClose}
                            className="hover:underline"
                          >
                            {item.name}
                          </Link>
                        </h4>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="font-black text-xs sm:text-sm text-[#0C0D11]">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                          {originalPrice > price && (
                            <span className="line-through text-[10px] text-[#8E92A2]">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dismiss from Wishlist */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        className="p-2 text-[#8E92A2] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer active:scale-90"
                        title="Remove from archive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Action Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/[0.04]">
                      <Link
                        href={`/product/${item.slug || itemId}`}
                        onClick={handleClose}
                        className="py-2.5 rounded-xl bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] border border-black/[0.06] text-[10px] font-mono font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3 text-[#8E92A2]" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleMoveToBag(item)}
                        className="py-2.5 rounded-xl bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. FOOTER VALUATION & STOREFRONT CTA ── */}
        {wishlistItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-white space-y-3 shrink-0">
            {/* Total Valuation Row */}
            <div className="flex items-center justify-between px-1 font-mono">
              <span className="text-[10px] text-[#8E92A2] uppercase tracking-wider">
                Vault Valuation
              </span>
              <span className="font-black text-sm text-[#0C0D11]">
                ₹{totalValuation.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/shop"
              onClick={handleClose}
              className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white font-mono font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer text-center"
            >
              <span>Explore Further Creations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <p className="text-[8.5px] font-mono text-center text-[#8E92A2] uppercase tracking-widest pt-0.5">
              Radha Outfit Collection • Bespoke Vault
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}