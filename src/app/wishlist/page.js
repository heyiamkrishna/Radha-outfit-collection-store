"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0C0D11] border-t-transparent animate-spin" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-16 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E8EBF2] gap-4">
          <div className="space-y-1.5">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0C0D11] tracking-tight">
              My Saved Atelier Pieces
            </h1>
            <p className="text-xs text-[#8E92A2]">
              Personal wardrobe curation saved directly to this device.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your saved items?")) {
                  clearWishlist();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider transition-colors self-start sm:self-end"
            >
              Clear All ({items.length})
            </button>
          )}
        </div>

        {/* Grid Content */}
        {items.length === 0 ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border border-[#E8EBF2] text-[#8E92A2] flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0C0D11]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#8E92A2] leading-relaxed">
              Explore our couture & ready-to-wear releases and bookmark the designs that speak to your style.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-xs"
            >
              Discover The Collection <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="group bg-white rounded-3xl border border-[#E8EBF2] overflow-hidden shadow-xs hover:border-[#0C0D11] transition-all flex flex-col justify-between"
              >
                {/* Photo & Badge */}
                <div className="relative aspect-[3/4] bg-[#F4F5F9] overflow-hidden">
                  <Image
                    src={item.images?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-[#0C0D11] shadow-xs">
                    {item.department}
                  </span>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-[#8E92A2] hover:text-rose-600 transition-colors shadow-xs"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Garment Details & Move to Bag */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Link
                      href={`/product/${item.slug || item._id}`}
                      className="font-extrabold text-sm text-[#0C0D11] hover:underline line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="font-mono font-black text-sm text-[#0C0D11]">
                      ₹{((item.salePrice || item.price) || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full py-3 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}