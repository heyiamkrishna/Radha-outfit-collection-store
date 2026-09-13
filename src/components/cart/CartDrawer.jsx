"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const cart = useCartStore((state) => state.cart || state.items || []);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState(null);

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

  if (!mounted) return null;

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = Number(item.salePrice || item.price || 0);
    const itemQty = Number(item.quantity || 1);
    return acc + itemPrice * itemQty;
  }, 0);

  const handleRemove = (itemKey) => {
    setRemovingId(itemKey);
    setTimeout(() => {
      if (removeFromCart) removeFromCart(itemKey);
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
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-[#0C0D11]/45 backdrop-blur-xs transition-opacity duration-400 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Container */}
      <aside
        aria-label="Shopping Bag Drawer"
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-[#FAFAFC] text-[#0C0D11] h-full shadow-[0_0_50px_rgba(0,0,0,0.16)] flex flex-col z-10 border-l border-black/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-black/[0.06] bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0C0D11] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0C0D11]">
                Atelier Bag
              </h2>
              <p className="text-[10px] font-mono text-[#8E92A2]">
                {cart.length} {cart.length === 1 ? "Piece" : "Pieces"} Curated
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-full text-[#4A4D59] hover:text-[#0C0D11] hover:bg-black/[0.04] transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label="Close Bag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 divide-y divide-black/[0.04]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-[#8E92A2]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-serif font-black uppercase tracking-wider text-[#0C0D11]">
                  Your Bag Is Empty
                </p>
                <p className="text-[11px] text-[#8E92A2] max-w-[200px]">
                  Explore our silhouettes to discover your next couture piece.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#1E2028] transition-all active:scale-95 shadow-xs"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const itemKey = item._id || item.id || `cart-${idx}`;
              const isBeingRemoved = removingId === itemKey;

              return (
                <div
                  key={itemKey}
                  style={{
                    transitionDelay: `${Math.min(idx * 30, 200)}ms`,
                  }}
                  className={`pt-3.5 first:pt-0 flex gap-3 sm:gap-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isBeingRemoved
                      ? "opacity-0 scale-95 -translate-x-4 max-h-0 overflow-hidden pt-0"
                      : "opacity-100 scale-100 translate-x-0"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] w-20 sm:w-22 rounded-2xl overflow-hidden bg-[#F4F5F9] shrink-0 border border-black/[0.04]">
                    <Image
                      src={item.image || item.images?.[0] || "/placeholder.jpg"}
                      alt={item.name || "Couture Garment"}
                      fill
                      sizes="90px"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-tight text-[#0C0D11] line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleRemove(itemKey)}
                          className="text-[#8E92A2] hover:text-rose-600 transition-colors p-1 -mr-1 cursor-pointer active:scale-90"
                          title="Remove piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant tags */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {item.selectedSize && (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-black/[0.04] text-[#4A4D59]">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-black/[0.04] text-[#4A4D59]">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 p-1 rounded-full bg-black/[0.035] border border-black/[0.04]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity &&
                            updateQuantity(itemKey, Math.max(1, (item.quantity || 1) - 1))
                          }
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0C0D11] hover:bg-neutral-100 transition-transform active:scale-90 shadow-2xs cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>

                        <span className="font-mono text-[11px] font-bold px-1 min-w-[14px] text-center text-[#0C0D11]">
                          {item.quantity || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity &&
                            updateQuantity(itemKey, (item.quantity || 1) + 1)
                          }
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0C0D11] hover:bg-neutral-100 transition-transform active:scale-90 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="font-mono text-xs sm:text-sm font-black text-[#0C0D11]">
                        ₹{(
                          Number(item.salePrice || item.price || 0) *
                          Number(item.quantity || 1)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-black/[0.06] space-y-3.5 shadow-[0_-8px_25px_rgba(0,0,0,0.03)]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#585C6D]">
                <span>Estimated Subtotal</span>
                <span className="font-mono font-black text-sm text-[#0C0D11]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#8E92A2] font-mono">
                <span>Pan-India Shipping</span>
                <span className="text-emerald-600 font-bold uppercase">Complimentary</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="group w-full py-3.5 px-5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-98 cursor-pointer ring-1 ring-white/10"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E92A2]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted Checkout & Direct Atelier Guarantee</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}