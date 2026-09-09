"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";// Connects to your existing cart store

export default function WishlistDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeWishlist, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart); // Fallback-safe cart action

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when drawer is open
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

  if (!mounted || !isOpen) return null;

  const handleMoveToCart = (item) => {
    if (addToCart) {
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.salePrice || item.price,
        image: item.images?.[0] || "",
        size: item.sizes?.[0] || "M",
        quantity: 1,
        slug: item.slug,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Sheet Body */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#F0F2F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0C0D11] tracking-tight">
                Saved Atelier Pieces
              </h2>
              <p className="text-[11px] text-[#8E92A2]">
                {items.length} {items.length === 1 ? "garment" : "garments"} bookmarked
              </p>
            </div>
          </div>

          <button
            onClick={closeWishlist}
            className="p-2 rounded-full hover:bg-[#F4F5F9] text-[#0C0D11] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Garments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F4F5F9] text-[#8E92A2] flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0C0D11]">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#8E92A2] max-w-xs leading-relaxed">
                Bookmark garments you love by tapping the heart icon while browsing our couture collections.
              </p>
              <button
                onClick={closeWishlist}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors"
              >
                Explore Wardrobe
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-3xl bg-[#FAFAFC] border border-[#F0F2F6] flex gap-4 items-center justify-between group hover:border-[#CBD5E1] transition-all"
              >
                {/* Image & Title */}
                <Link
                  href={`/product/${item.slug || item._id}`}
                  onClick={closeWishlist}
                  className="flex items-center gap-3.5 min-w-0"
                >
                  <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-white border border-[#E8EBF2] shrink-0">
                    <Image
                      src={item.images?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase bg-[#EBF1FD] text-[#3B7BF6]">
                      {item.department}
                    </span>
                    <p className="text-xs font-extrabold text-[#0C0D11] truncate">{item.name}</p>
                    <p className="text-xs font-black font-mono text-[#0C0D11]">
                      ₹{((item.salePrice || item.price) || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="p-2 rounded-xl text-[#8E92A2] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0C0D11] text-white hover:bg-[#3B7BF6] text-[10px] font-bold uppercase tracking-wider transition-colors shadow-xs active:scale-95"
                  >
                    <ShoppingBag className="w-3 h-3" /> Move to Bag
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#F0F2F6] bg-white space-y-3">
            <Link
              href="/wishlist"
              onClick={closeWishlist}
              className="w-full py-3.5 rounded-full border border-[#0C0D11] text-[#0C0D11] hover:bg-[#0C0D11] hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              View Full Wishlist Gallery <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}