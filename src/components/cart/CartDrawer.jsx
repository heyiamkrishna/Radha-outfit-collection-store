"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);

  const cart = useCartStore((s) => s.cart || s.items || []);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen ?? s.isOpen ?? false);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent document body scrolling when the drawer is mounted and active
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const { totalItems, subtotal } = useMemo(() => {
    const count = cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    const amount = cart.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    return { totalItems: count, subtotal: amount };
  }, [cart]);

  if (!mounted || !isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0D11]/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-md bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E8EBF2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0C0D11] text-white text-xs font-extrabold flex items-center justify-center">
              R
            </span>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#0C0D11]">
              Shopping Bag ({totalItems})
            </h3>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-full bg-[#F4F5F9] text-[#4A4D59] hover:text-[#0C0D11] transition-colors cursor-pointer"
            aria-label="Close Bag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F4F5F9] flex items-center justify-center text-[#8E92A2]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#0C0D11]">Your bag is empty</p>
              <p className="text-xs text-[#8E92A2] max-w-xs">
                Explore our catalog to find timeless silhouettes tailored for modern living.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors cursor-pointer"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemId = item.id || item._id || item.productId;
              const key = `${itemId}-${item.size}`;

              return (
                <div
                  key={key}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2]/60"
                >
                  <div className="relative w-20 aspect-square rounded-xl overflow-hidden bg-white shrink-0">
                    <Image
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name || "Garment"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/product/${item.slug || itemId}`}
                        onClick={closeDrawer}
                        className="text-xs font-bold text-[#0C0D11] truncate hover:text-[#3B7BF6] transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemId, item.size)}
                        className="text-[#8E92A2] hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-[#8E92A2] uppercase tracking-wider">
                      Size: {item.size || "M"}
                    </span>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-extrabold text-[#0C0D11]">
                        ₹{(Number(item.price || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                      </span>

                      <div className="flex items-center gap-1.5 bg-white rounded-full px-2 py-0.5 border border-[#E8EBF2]">
                        <button
                          type="button"
                          onClick={() => {
                            if (updateQuantity) {
                              updateQuantity(itemId, item.size, -1);
                            } else if (item.quantity > 1) {
                              removeFromCart(itemId, item.size);
                            }
                          }}
                          className="p-0.5 text-[#4A4D59] hover:text-[#0C0D11] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (updateQuantity) {
                              updateQuantity(itemId, item.size, 1);
                            }
                          }}
                          className="p-0.5 text-[#4A4D59] hover:text-[#0C0D11] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#E8EBF2] bg-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8E92A2]">Subtotal</span>
              <span className="text-base font-extrabold text-[#0C0D11]">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-[#8E92A2]">
              Taxes and complimentary shipping calculated at checkout.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full py-3 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[#0C0D11] text-xs font-bold text-center transition-colors"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full py-3 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                Checkout <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}