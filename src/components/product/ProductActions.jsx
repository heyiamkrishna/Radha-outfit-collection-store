"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  X,
  ZoomIn,
} from "lucide-react";

export default function ProductActions({ product }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Visual Assets & Gallery Slider State
  const images = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return ["/placeholder.jpg"];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Desktop Magnifier Lens State
  const [showZoom, setShowZoom] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const imageFrameRef = useRef(null);

  // Fullscreen Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Body Scroll Lock for Lightbox
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Purchasing & Accordion State
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0] || "39 (M)"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  // Global Stores
  const addToCart = useCartStore((s) => s.addToCart);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const isWishlisted = Boolean(mounted && isInWishlist && isInWishlist(product?._id));

  const activePrice = Number(product?.salePrice || product?.price || 0);
  const originalPrice = Number(product?.price || 0);
  const isDiscounted = Boolean(product?.salePrice && product?.salePrice < product?.price);

  const discountPercent = useMemo(() => {
    return isDiscounted && originalPrice > 0
      ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
      : 0;
  }, [isDiscounted, originalPrice, activePrice]);

  // Gallery Navigation Handlers
  const handleSelectImage = (index) => {
    if (index === activeImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  const handleNextImage = () => {
    handleSelectImage((activeImageIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    handleSelectImage((activeImageIndex - 1 + images.length) % images.length);
  };

  // Magnifier Mouse Position Handler
  const handleMouseMove = (e) => {
    if (!imageFrameRef.current) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Quantity Stepper
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrement = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  // Add to Bag
  const handleAddToCart = () => {
    if (addToCart && product) {
      addToCart(
        {
          _id: product._id,
          id: product._id,
          name: product.name,
          price: activePrice,
          salePrice: product.salePrice,
          images: images,
          image: images[activeImageIndex] || "/placeholder.jpg",
          slug: product.slug,
        },
        selectedSize,
        quantity
      );

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);

      if (typeof window !== "undefined" && window.innerWidth >= 640 && openDrawer) {
        openDrawer();
      }
    }
  };

  // Buy Now
  const handleBuyNow = () => {
    if (addToCart && product) {
      addToCart(
        {
          _id: product._id,
          id: product._id,
          name: product.name,
          price: activePrice,
          salePrice: product.salePrice,
          images: images,
          image: images[activeImageIndex] || "/placeholder.jpg",
          slug: product.slug,
        },
        selectedSize,
        quantity
      );
    }
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    if (toggleWishlist && product) {
      toggleWishlist(product);
    }
  };

  const currentImage = images[activeImageIndex];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        
        {/* ── LEFT COLUMN: SLIDER & ZOOM GALLERY ── */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3.5 sm:gap-4">
          
          {/* Thumbnails Strip (Only when > 1 image exists) */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 max-h-[580px] py-1">
              {images.map((img, idx) => {
                const isSelected = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectImage(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-26 rounded-[18px] overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-white ${
                      isSelected
                        ? "border-[#0C0D11] scale-[1.02] shadow-sm"
                        : "border-black/[0.06] opacity-60 hover:opacity-100 hover:border-black/20"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      fill
                      sizes="90px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Hero Active Display Stage */}
          <div className="relative flex-1">
            <div
              ref={imageFrameRef}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-[3/4] w-full rounded-[28px] sm:rounded-[36px] overflow-hidden bg-white border border-black/[0.06] shadow-xs cursor-crosshair group"
            >
              {/* Primary Visual Image */}
              <Image
                src={currentImage}
                alt={product?.name || "Garment Silhouette"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover transition-all duration-300 ease-out group-hover:scale-[1.02] ${
                  isTransitioning ? "opacity-40 scale-95" : "opacity-100 scale-100"
                }`}
              />

              {/* Desktop 2.5x Magnifier Lens */}
              {showZoom && (
                <div
                  className="hidden lg:block pointer-events-none absolute inset-0 z-20 overflow-hidden bg-white transition-opacity duration-150"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                    backgroundSize: "260%",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-[#0C0D11]/85 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <ZoomIn className="w-3 h-3 text-amber-400" />
                    <span>2.5x Weave Inspection</span>
                  </div>
                </div>
              )}

              {/* Department & Discount Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-10">
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-widest bg-[#0C0D11]/90 backdrop-blur-md text-white shadow-xs">
                  {product?.category || product?.department || "Ready-to-Wear"}
                </span>
                {isDiscounted && (
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {/* Top Controls: Lightbox Expand & Floating Wishlist */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] flex items-center justify-center text-[#0C0D11] hover:bg-white active:scale-90 transition-all shadow-xs cursor-pointer"
                  title="Expand Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] flex items-center justify-center text-[#0C0D11] hover:text-rose-600 active:scale-90 transition-all shadow-xs cursor-pointer"
                  aria-label="Save to Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      isWishlisted ? "fill-rose-600 text-rose-600" : "text-[#0C0D11]"
                    }`}
                  />
                </button>
              </div>

              {/* Carousel Arrows (Rendered when > 1 image exists) */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0C0D11] backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-90 cursor-pointer"
                    aria-label="Previous photograph"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0C0D11] backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-90 cursor-pointer"
                    aria-label="Next photograph"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Frame Counter Badge */}
                  <div className="absolute bottom-4 left-4 z-30 px-3 py-1 rounded-full bg-[#0C0D11]/75 backdrop-blur-md border border-white/10 text-white font-mono text-[9.5px] font-bold tracking-wider">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: SPEC & ACTIONS ── */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-[26px] sm:rounded-[36px] p-5 sm:p-8 md:p-10 border border-black/[0.06] shadow-xs space-y-5 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3 pb-5 border-b border-black/[0.06]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
                <Sparkles className="w-3 h-3" /> Haute Couture Piece
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-mono text-[#8E92A2] uppercase tracking-wider">
                SKU: {product?.styleCode || product?._id?.toString().slice(-6) || "ROC-001"}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0C0D11] tracking-tight font-serif uppercase leading-tight">
              {product?.name}
            </h1>

            <div className="flex items-baseline gap-2.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0C0D11]">
                ₹{activePrice.toLocaleString("en-IN")}
              </span>
              {isDiscounted && (
                <span className="text-sm sm:text-base font-mono text-[#8E92A2] line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider ml-auto font-mono">
                Inclusive of all taxes
              </span>
            </div>
          </div>

          {/* Size Selection */}
          {product?.sizes && product.sizes.length > 0 && (
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] text-[11px] sm:text-xs">
                  Select Atelier Size
                </span>
                <span className="text-[10px] text-[#3B7BF6] font-bold font-mono">
                  Standard Fit
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 sm:h-10 min-w-[44px] px-3.5 sm:px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-90 ${
                      selectedSize === size
                        ? "bg-[#0C0D11] text-white shadow-xs scale-95"
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
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] block">
              Quantity
            </span>
            <div className="inline-flex items-center rounded-xl border border-black/[0.08] bg-[#FAFAFC] p-0.5 sm:p-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0C0D11] hover:bg-white disabled:opacity-30 transition-all active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-10 text-center font-mono font-black text-xs text-[#0C0D11]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= 10}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0C0D11] hover:bg-white disabled:opacity-30 transition-all active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Description Snippet */}
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] block">
              Garment Dossier
            </span>
            <p className="text-[11px] sm:text-xs text-[#4A4D59] leading-relaxed">
              {product?.description ||
                "Bespoke silhouette crafted with refined textile balance, structural integrity, and hand-finished seam accents."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3.5 sm:py-4 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                isAdded
                  ? "bg-emerald-600 text-white scale-[0.98]"
                  : "bg-white text-[#0C0D11] border-2 border-[#0C0D11] hover:bg-[#F4F5F9]"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" /> Added to Shopping Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 sm:py-4 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-[#0C0D11] hover:bg-[#1E2028] text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" /> Buy Now
            </button>
          </div>

          {/* Accordion Panels */}
          <div className="border-t border-black/[0.06] pt-3 divide-y divide-black/[0.06] text-xs font-mono">
            {/* Shipping */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "shipping" ? null : "shipping")}
                className="w-full flex items-center justify-between text-[#0C0D11] font-bold uppercase tracking-wider text-[11px] sm:text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#3B7BF6]" /> Complimentary Delivery
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeTab === "shipping" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeTab === "shipping" ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[#8E92A2] leading-relaxed text-[11px]">
                    Dispatched in bespoke packaging. Express courier delivery across India within 3-5 business days. Complimentary delivery on all atelier orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Provenance */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "provenance" ? null : "provenance")}
                className="w-full flex items-center justify-between text-[#0C0D11] font-bold uppercase tracking-wider text-[11px] sm:text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Provenance & Guarantee
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeTab === "provenance" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeTab === "provenance" ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[#8E92A2] leading-relaxed text-[11px]">
                    Every piece is authenticated with its distinct atelier run serial code and tailored under strict master artisan supervision.
                  </p>
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="py-2.5">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "returns" ? null : "returns")}
                className="w-full flex items-center justify-between text-[#0C0D11] font-bold uppercase tracking-wider text-[11px] sm:text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-[#3B7BF6]" /> 7-Day Doorstep Exchange
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeTab === "returns" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeTab === "returns" ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[#8E92A2] leading-relaxed text-[11px]">
                    Complimentary reverse pickup arranged at your doorstep for size alterations or exchanges within 7 days of delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN ULTRA-HD LIGHTBOX MODAL (PORTALED) ── */}
      {mounted &&
        lightboxOpen &&
        createPortal(
          <div
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[999999] bg-[#0C0D11]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100dvh" }}
          >
            {/* Lightbox Top Header Bar */}
            <div
              className="flex items-center justify-between z-20 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-serif font-black uppercase tracking-wider text-xs sm:text-sm">
                  {product?.name}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  ({activeImageIndex + 1} of {images.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Center Image Stage */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex-1 w-full max-w-4xl mx-auto my-auto flex items-center justify-center min-h-[50vh] max-h-[75vh]"
            >
              <div className="relative w-full h-full min-h-[350px]">
                <Image
                  src={currentImage}
                  alt={product?.name || "Garment"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer z-30"
                    aria-label="Previous photograph"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer z-30"
                    aria-label="Next photograph"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Bottom Thumbnails Strip */}
            {images.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex justify-center gap-2 overflow-x-auto py-2 z-20 shrink-0 no-scrollbar"
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectImage(idx)}
                    className={`relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-white scale-105"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="70px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}