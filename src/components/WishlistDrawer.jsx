"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistDrawer({ isOpen: propIsOpen, onClose: propOnClose }) {
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const items = useWishlistStore((s) => s.items || s.wishlist || []);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const storeIsOpen = useWishlistStore((s) => s.isOpen);
  const storeClose = useWishlistStore((s) => s.closeWishlist || s.closeDrawer);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose || storeClose || (() => {});

  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleMoveToCart = (item) => {
    if (addToCart) {
      addToCart({
        _id: item._id || item.id,
        id: item._id || item.id,
        name: item.name,
        price: item.salePrice || item.price,
        image: item.image || item.images?.[0] || "/placeholder.jpg",
        size: item.sizes?.[0] || "M",
        quantity: 1,
        slug: item.slug,
      });
    }
  };

  const handleRemove = (item) => {
    const itemId = item._id || item.id;
    setRemovingId(itemId);
    setTimeout(() => {
      if (toggleWishlist) toggleWishlist(item);
      setRemovingId(null);
    }, 280);
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-400 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-[#0C0D11]/45 backdrop-blur-xs transition-opacity duration-400 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Container */}
      <aside
        aria-label="Wishlist Drawer"
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-[#FAFAFC] text-[#0C0D11] h-full shadow-[0_0_50px_rgba(0,0,0,0.16)] flex flex-col z-10 border-l border-black/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-black/[0.06] bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0C0D11]">
                Saved Atelier Pieces
              </h2>
              <p className="text-[10px] font-mono text-[#8E92A2]">
                {items.length} {items.length === 1 ? "Silhouette" : "Silhouettes"} Bookmarked
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-[#4A4D59] hover:text-[#0C0D11] hover:bg-black/[0.04] transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label="Close Wishlist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Garments List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 divide-y divide-black/[0.04]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-serif font-black uppercase tracking-wider text-[#0C0D11]">
                  Your Wishlist is Empty
                </p>
                <p className="text-[11px] text-[#8E92A2] max-w-[220px]">
                  Bookmark garments you love by tapping the heart icon across our atelier collections.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#1E2028] transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Explore Wardrobe</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const itemId = item._id || item.id || `wishlist-${idx}`;
              const isBeingRemoved = removingId === itemId;
              const garmentPrice = Number(item.salePrice || item.price || 0);

              return (
                <div
                  key={itemId}
                  className={`pt-3.5 first:pt-0 flex gap-3 sm:gap-4 items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isBeingRemoved
                      ? "opacity-0 scale-95 -translate-x-4 max-h-0 overflow-hidden pt-0"
                      : "opacity-100 scale-100 translate-x-0"
                  }`}
                >
                  <Link
                    href={`/product/${item.slug || itemId}`}
                    onClick={handleClose}
                    className="flex items-center gap-3 sm:gap-3.5 min-w-0 group flex-1"
                  >
                    <div className="relative aspect-[3/4] w-16 sm:w-20 rounded-2xl overflow-hidden bg-white border border-black/[0.05] shrink-0">
                      <Image
                        src={item.image || item.images?.[0] || "/placeholder.jpg"}
                        alt={item.name || "Garment"}
                        fill
                        sizes="80px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-mono font-bold uppercase bg-[#EBF1FD] text-[#3B7BF6]">
                        {item.category || item.department || "Haute Piece"}
                      </span>
                      <p className="text-xs font-extrabold text-[#0C0D11] truncate tracking-tight uppercase group-hover:text-[#3B7BF6] transition-colors">
                        {item.name}
                      </p>
                      <p className="text-xs font-black font-mono text-[#0C0D11]">
                        ₹{garmentPrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="p-1.5 rounded-xl text-[#8E92A2] hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer active:scale-90"
                      title="Remove piece"
                      aria-label="Remove piece"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0C0D11] text-white hover:bg-[#1E2028] text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-black/[0.06] shadow-[0_-8px_25px_rgba(0,0,0,0.03)]">
            <Link
              href="/wishlist"
              onClick={handleClose}
              className="w-full py-3.5 px-5 rounded-full border border-[#0C0D11] text-[#0C0D11] hover:bg-[#0C0D11] hover:text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}