"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  Sparkles,
} from "lucide-react";

export default function ProductGallery({ images = [], productName = "Garment" }) {
  const galleryImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);

  // Desktop Hover Zoom State
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const containerRef = useRef(null);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const activeImage = galleryImages[activeIndex];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3.5 w-full">
      {/* ── 1. THUMBNAIL TRACK (Shows only when > 1 image) ── */}
      {galleryImages.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 max-h-[600px] py-1">
          {galleryImages.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-26 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white shrink-0 ${
                  isSelected
                    ? "border-[#0C0D11] shadow-sm scale-102"
                    : "border-black/[0.06] hover:border-black/20 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── 2. PRIMARY DISPLAY SLIDER STAGE ── */}
      <div className="relative flex-1">
        <div
          ref={containerRef}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          className="relative aspect-[3/4] w-full rounded-[28px] sm:rounded-[36px] overflow-hidden bg-white border border-black/[0.06] shadow-xs cursor-crosshair group"
        >
          {/* Main Visual Asset */}
          <Image
            src={activeImage}
            alt={`${productName} view ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-opacity duration-300"
          />

          {/* ── DESKTOP HOVER MAGNIFIER LENS ── */}
          {showZoom && (
            <div
              className="hidden lg:block pointer-events-none absolute inset-0 z-20 overflow-hidden bg-white transition-opacity duration-200"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: "250%",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Micro crosshair indicator in corner */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#0C0D11]/80 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-amber-400" />
                <span>2.5x Artisan Zoom</span>
              </div>
            </div>
          )}

          {/* ── SLIDER CONTROLS (Only visible when > 1 image) ── */}
          {galleryImages.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0C0D11] backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-90 cursor-pointer"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0C0D11] backdrop-blur-md border border-black/[0.08] shadow-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-90 cursor-pointer"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Slide Counter Indicator Pill */}
              <div className="absolute bottom-4 left-4 z-30 px-3 py-1 rounded-full bg-[#0C0D11]/70 backdrop-blur-md border border-white/10 text-white font-mono text-[10px] font-bold tracking-wider">
                {activeIndex + 1} / {galleryImages.length}
              </div>
            </>
          )}

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#0C0D11] backdrop-blur-md border border-black/[0.08] shadow-sm flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Open Fullscreen Lightbox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 3. FULLSCREEN ULTRA-HD LIGHTBOX MODAL ── */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[100000] bg-[#0C0D11]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-serif font-black uppercase tracking-wider text-xs sm:text-sm">
                {productName}
              </span>
              <span className="font-mono text-xs text-neutral-400">
                ({activeIndex + 1} of {galleryImages.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Center Active Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[75vh] mx-auto rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src={activeImage}
              alt={productName}
              fill
              className="object-contain"
              priority
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all active:scale-90"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Strip */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex justify-center gap-2 overflow-x-auto py-2 z-10"
          >
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeIndex === idx
                    ? "border-white scale-105"
                    : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}