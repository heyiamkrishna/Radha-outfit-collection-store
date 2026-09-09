"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ArrowUpRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart, getSubtotal, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0C0D11] border-t-transparent animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const shippingThreshold = 5000;
  const freeShippingEligible = subtotal >= shippingThreshold;
  const shippingFee = subtotal === 0 || freeShippingEligible ? 0 : 250;
  const orderTotal = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EBF1FD] text-[#3B7BF6] mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C0D11] tracking-tight">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#8E92A2] mt-2 max-w-md mx-auto">
          Explore the Radha Outfit Collection to discover timeless, responsibly tailored pieces.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full bg-[#0C0D11] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors shadow-xs"
        >
          Explore Catalog <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-[#E8EBF2] gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B7BF6]">
            Order Review
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0C0D11] mt-0.5">
            Shopping Bag
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#8E92A2] font-medium">{totalItems} Pieces</span>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Left: Product List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Shipping Tracker Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8EBF2] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0C0D11]">
              <Truck className="w-4 h-4 text-[#3B7BF6]" />
              {freeShippingEligible ? (
                <span>You unlocked <span className="text-[#10B981]">Free Express Delivery</span>!</span>
              ) : (
                <span>
                  Add <span className="text-[#3B7BF6]">₹{(shippingThreshold - subtotal).toLocaleString("en-IN")}</span> more for Free Express Delivery
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-[#F4F5F9] rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-[#3B7BF6] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-[24px] bg-white border border-[#E8EBF2] shadow-xs gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-[#F4F5F9] shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-bold text-[#0C0D11] hover:text-[#3B7BF6] transition-colors truncate block"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#8E92A2]">
                      <span className="px-2 py-0.5 rounded-full bg-[#F4F5F9] font-medium text-[#4A4D59]">
                        Size: {item.size}
                      </span>
                      <span>Unit: ₹{item.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F4F5F9]">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-[#F4F5F9] rounded-full px-2.5 py-1 border border-[#E8EBF2]">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="p-0.5 text-[#4A4D59] hover:text-[#0C0D11] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold px-1 text-[#0C0D11]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="p-0.5 text-[#4A4D59] hover:text-[#0C0D11] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-extrabold text-[#0C0D11] min-w-[70px] text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="p-1 text-[#8E92A2] hover:text-red-500 transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-[#E8EBF2] shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-[#0C0D11] tracking-tight">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#4A4D59]">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-[#0C0D11]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[#4A4D59]">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[#0C0D11]">
                  {shippingFee === 0 ? (
                    <span className="text-[#10B981]">Free</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#4A4D59]">
                <span>Applicable GST (Included)</span>
                <span className="font-semibold text-[#0C0D11]">₹0.00</span>
              </div>

              <div className="pt-3 border-t border-[#E8EBF2] flex justify-between items-baseline text-sm">
                <span className="font-bold text-[#0C0D11]">Total Amount</span>
                <span className="text-lg font-extrabold text-[#0C0D11]">
                  ₹{orderTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              Proceed to Checkout <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#8E92A2]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Encrypted Checkout & Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}