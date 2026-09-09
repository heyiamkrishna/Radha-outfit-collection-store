"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useState, useEffect } from "react";

export default function WishlistHeartButton({ product, className = "" }) {
  const [mounted, setMounted] = useState(false);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !product) return null;

  const isSaved = isInWishlist(product._id || product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
      }}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 ${
        isSaved
          ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-xs"
          : "bg-white/80 hover:bg-white text-[#0C0D11] border border-[#E8EBF2]/80 hover:border-[#0C0D11] shadow-xs"
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-300 ${
          isSaved ? "fill-rose-600 scale-110" : "fill-transparent hover:scale-110"
        }`}
      />
    </button>
  );
}