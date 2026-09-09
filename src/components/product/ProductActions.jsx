"use client";

// import { useState } from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import {
  ShoppingBag,
  Zap,
  Check,
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function ProductActions({ product }) {
  const router = useRouter();


  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Selected state
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || "/placeholder.jpg"
  );
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0] || "M"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // Accordions

  // Cart & Wishlist stores
  const addToCart = useCartStore((s) => s.addToCart || s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const { isInWishlist, toggleWishlist, addToWishlist, removeFromWishlist } =
    useWishlistStore();

 const isWishlisted = mounted && isInWishlist
    ? isInWishlist(product?._id)
    : false;

  const activePrice = product?.salePrice || product?.price || 0;
  const originalPrice = product?.price || 0;
  const isDiscounted = Boolean(
    product?.salePrice && product?.salePrice < product?.price
  );
  const discountPercent = isDiscounted
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  // Handle Quantity
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrement = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  // Add to Bag
  const handleAddToCart = () => {
  if (addToCart) {
    addToCart({
      product: product._id, // Explicitly pass product ObjectId
      _id: product._id,
      id: product._id,
      name: product.name,
      price: activePrice,
      image: selectedImage || product?.images?.[0] || "/placeholder.jpg",
      size: selectedSize,
      quantity: quantity,
      slug: product.slug,
    });

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);

      if (typeof window !== "undefined" && window.innerWidth >= 640 && openDrawer) {
        openDrawer();
      }
    }
  };

  // Buy Now (Instant Checkout)
  const handleBuyNow = () => {
    if (addToCart) {
      addToCart({
        _id: product._id,
        id: product._id,
        name: product.name,
        price: activePrice,
        image: selectedImage,
        size: selectedSize,
        quantity: quantity,
        slug: product.slug,
      });
    }
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    if (toggleWishlist) {
      toggleWishlist(product);
    } else if (isWishlisted && removeFromWishlist) {
      removeFromWishlist(product._id);
    } else if (addToWishlist) {
      addToWishlist(product);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
      
      {/* ── LEFT COLUMN: High-Fashion Gallery Stage ── */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main Stage Viewport */}
        <div className="relative aspect-[3/4] w-full rounded-[32px] overflow-hidden bg-white border border-[#E8EBF2] shadow-sm group">
          <Image
            src={selectedImage}
            alt={product?.name || "Garment Silhouette"}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Department & Stock Pill */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#0C0D11]/90 backdrop-blur-md text-white shadow-sm">
              {product?.department || "Ready-to-Wear"}
            </span>
            {isDiscounted && (
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Heart Action */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#E8EBF2] flex items-center justify-center text-[#0C0D11] hover:text-rose-600 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Save to Wishlist"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? "fill-rose-600 text-rose-600" : "text-[#0C0D11]"
              }`}
            />
          </button>
        </div>

        {/* Thumbnail Selector Strip */}
        {product?.images && product.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  selectedImage === img
                    ? "border-[#0C0D11] scale-95 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-[#CBD5E1]"
                }`}
              >
                <Image
                  src={img}
                  alt={`Garment Angle ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: Atelier Spec Dossier & Buying Actions ── */}
      <div className="lg:col-span-5 bg-white rounded-[36px] p-6 sm:p-10 border border-[#E8EBF2] shadow-sm space-y-7">
        
        {/* Header, Name & Pricing Block */}
        <div className="space-y-3 pb-6 border-b border-[#F0F2F6]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#3B7BF6]">
              <Sparkles className="w-3 h-3" /> Haute Couture Piece
            </span>
            <span className="text-[10px] font-mono text-[#8E92A2] uppercase tracking-wider">
              SKU: {product?._id?.toString().slice(-6) || "ROC-001"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C0D11] tracking-tight font-serif uppercase">
            {product?.name}
          </h1>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl font-black font-mono text-[#0C0D11]">
              ₹{activePrice.toLocaleString("en-IN")}
            </span>
            {isDiscounted && (
              <span className="text-base font-mono text-[#8E92A2] line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider ml-auto">
              Inclusive of all taxes
            </span>
          </div>
        </div>

        {/* Size Selection */}
        {product?.sizes && product.sizes.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#0C0D11]">
                Select Atelier Size
              </span>
              <button
                type="button"
                onClick={() => alert("Standard Indian / International fitting. For tailored bespoke sizing, consult your atelier assistant.")}
                className="text-[11px] text-[#3B7BF6] hover:underline font-bold"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-11 min-w-[48px] px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSize === size
                      ? "bg-[#0C0D11] text-white shadow-md scale-95"
                      : "bg-[#F4F5F9] text-[#4A4D59] hover:bg-[#E8EBF2]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Counter */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0C0D11] block">
            Quantity
          </span>
          <div className="inline-flex items-center rounded-2xl border border-[#E8EBF2] bg-[#FAFAFC] p-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0C0D11] hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono font-black text-xs text-[#0C0D11]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= 10}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0C0D11] hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0C0D11] block">
            Garment Dossier
          </span>
          <p className="text-xs text-[#4A4D59] leading-relaxed">
            {product?.description ||
              "Bespoke silhouette crafted with refined textile balance, premium structural integrity, and hand-finished seam accents."}
          </p>
        </div>

        {/* ── ACTION BUTTONS: Add To Bag & Buy Now ── */}
        <div className="space-y-3 pt-2">
          {/* 1. Add to Shopping Bag */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-white text-[#0C0D11] border-2 border-[#0C0D11] hover:bg-[#F4F5F9]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> Added to Shopping Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
              </>
            )}
          </button>

          {/* 2. Buy Now (Instant Checkout) */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-4 rounded-full text-xs font-black uppercase tracking-widest bg-[#0C0D11] hover:bg-[#3B7BF6] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" /> Buy Now
          </button>
        </div>

        {/* Atelier Accordion Info Drawers */}
        <div className="border-t border-[#F0F2F6] pt-4 divide-y divide-[#F0F2F6] text-xs">
          
          {/* Shipping & Delivery Drawer */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "shipping" ? null : "shipping")}
              className="w-full flex items-center justify-between text-[#0C0D11] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#3B7BF6]" /> Complimentary Delivery
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeTab === "shipping" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeTab === "shipping" && (
              <p className="pt-2.5 text-[#8E92A2] leading-relaxed text-[11px]">
                Dispatched in bespoke packaging. Express courier delivery across India within 3-5 business days. Free shipping on all prepaid & COD orders.
              </p>
            )}
          </div>

          {/* Authenticity Drawer */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "provenance" ? null : "provenance")}
              className="w-full flex items-center justify-between text-[#0C0D11] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3B7BF6]" /> Provenance & Guarantee
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeTab === "provenance" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeTab === "provenance" && (
              <p className="pt-2.5 text-[#8E92A2] leading-relaxed text-[11px]">
                Every piece is authenticated with its distinct atelier run serial code and tailored under strict master artisan supervision.
              </p>
            )}
          </div>

          {/* Exchanges Drawer */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "returns" ? null : "returns")}
              className="w-full flex items-center justify-between text-[#0C0D11] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#3B7BF6]" /> 7-Day Doorstep Exchange
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeTab === "returns" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeTab === "returns" && (
              <p className="pt-2.5 text-[#8E92A2] leading-relaxed text-[11px]">
                Complimentary reverse pickup arranged at your doorstep for size alterations or exchanges within 7 days of delivery.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}