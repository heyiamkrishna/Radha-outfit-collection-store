"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function ProductCard({ product }) {
  const isSale = Boolean(product?.salePrice && product.salePrice < product.price);
  const imageUrl =
    product?.images?.[0] ||
    product?.image ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop";

  const brandName = product?.brand || product?.category || "RADHA OUTFIT";
  const formattedPrice = Number(product?.salePrice || product?.price || 1499).toLocaleString("en-IN");
  const defaultSize = product?.sizes?.[0] || "M";

  // Wishlist store integration
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist || state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items || []);
  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item.id) === (product?._id || product?.id)
  );

  const [heartAnim, setHeartAnim] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnim(true);
    if (toggleWishlist) toggleWishlist(product);
    setTimeout(() => setHeartAnim(false), 400);
  };

  return (
    <Link
      href={`/product/${product?.slug || product?._id || ""}`}
      className="group relative block w-full bg-white/90 backdrop-blur-md rounded-[22px] sm:rounded-[30px] p-3 sm:p-4 shadow-[0_4px_20px_-4px_rgba(12,13,17,0.03)] border border-black/[0.05] hover:shadow-[0_16px_36px_-6px_rgba(12,13,17,0.08)] ring-1 ring-black/[0.02] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col justify-between"
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-square rounded-[16px] sm:rounded-[22px] overflow-hidden bg-[#F4F5F9]">
        <Image
          src={imageUrl}
          alt={product?.name || "Garment Silhouette"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
        />

        {/* Wishlist Floating Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-80 shadow-2xs cursor-pointer ${
            heartAnim ? "scale-125" : "scale-100"
          } ${
            isWishlisted
              ? "text-rose-600"
              : "text-[#4A4D59] hover:text-rose-600 hover:bg-white"
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isWishlisted ? "fill-current" : ""
            }`}
          />
        </button>

        {isSale && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-bold tracking-wider uppercase bg-[#0C0D11] text-white shadow-2xs">
            Sale
          </span>
        )}

        {/* Ambient subtle image lighting shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Details Area */}
      <div className="pt-3 sm:pt-3.5 flex flex-col space-y-1">
        <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E92A2] truncate">
          {brandName}
        </span>

        <h3 className="text-xs sm:text-sm font-extrabold uppercase text-[#0C0D11] tracking-tight leading-snug truncate group-hover:text-[#3B7BF6] transition-colors duration-200">
          {product?.name || "Garment Silhouette"}
        </h3>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#8E92A2] pt-0.5">
          <span className="font-mono text-[9px] sm:text-[10px]">Size: {defaultSize}</span>
          <span className="text-emerald-600 font-bold text-[9px] sm:text-[10px] font-mono uppercase tracking-wider">
            In Stock
          </span>
        </div>

        {/* Price & Action */}
        <div className="pt-2 sm:pt-2.5 border-t border-black/[0.04] flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1 min-w-0 font-mono">
            <span className="text-xs sm:text-sm font-black text-[#0C0D11] truncate">
              ₹{formattedPrice}
            </span>
            {isSale && (
              <span className="hidden xs:inline text-[10px] line-through text-[#8E92A2]">
                ₹{Number(product?.price || 0).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0C0D11] group-hover:bg-[#3B7BF6] text-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 shadow-2xs">
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}