"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ArrowUpRight, Sparkles, Package } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

export default function HeroSlider({ banners = [] }) {
  // Ensure enough slides for Swiper loop without triggering extra renders
  const displaySlides = useMemo(() => {
    if (!banners || banners.length === 0) return [];
    if (banners.length === 1) return banners;
    if (banners.length < 5) {
      return [...banners, ...banners, ...banners];
    }
    return banners;
  }, [banners]);

  if (!displaySlides || displaySlides.length === 0) {
    return null;
  }

  const canLoop = displaySlides.length >= 3;

  return (
    <section className="w-full max-w-[1440px] mx-auto pt-2 pb-8 sm:pb-12 overflow-hidden select-none">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={14}
        slidesPerView={1.08}
        centeredSlides={true}
        loop={canLoop}
        loopAdditionalSlides={2}
        autoplay={
          canLoop
            ? {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{
          clickable: true,
          bulletActiveClass: "swiper-pagination-bullet-active !w-8 !bg-[#0C0D11] !rounded-full",
          bulletClass:
            "swiper-pagination-bullet !w-2 !h-2 !bg-[#8E92A2]/50 !opacity-100 !transition-all !duration-300",
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.15,
            spaceBetween: 18,
          },
          1024: {
            slidesPerView: 1.25,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 1.32,
            spaceBetween: 28,
          },
        }}
        className="hero-swiper !pb-10 !px-3 sm:!px-6"
      >
        {displaySlides.map((item, index) => (
          <SwiperSlide key={`${item._id || "banner"}-${index}`} className="transition-transform duration-500">
            {({ isActive }) => (
              <div
                className={`relative w-full aspect-[2.3/1] min-h-[210px] sm:min-h-[290px] md:min-h-[350px] lg:min-h-[380px] rounded-[26px] sm:rounded-[36px] overflow-hidden border transition-all duration-500 ${
                  isActive
                    ? "scale-100 shadow-[0_16px_45px_rgba(12,13,17,0.08)] border-white/90"
                    : "scale-[0.96] opacity-75 border-transparent"
                } bg-gradient-to-r ${item.bgGradient || "from-[#F7F4EF] via-[#F4F5F9] to-[#E9EDF5]"}`}
              >
                {/* Content Left Column */}
                <div className="relative z-10 h-full w-[62%] sm:w-[55%] md:w-[50%] p-5 sm:p-9 md:p-14 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-mono font-black uppercase tracking-wider bg-white/90 text-[#0C0D11] backdrop-blur-md shadow-xs border border-white/80">
                      <Sparkles className="w-3 h-3 text-[#3B7BF6]" />
                      <span>{item.badge || "Radha Exclusive"}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 my-auto py-2">
                    <h2 className="text-base sm:text-2xl md:text-4xl lg:text-[38px] font-black font-serif uppercase tracking-tight text-[#0C0D11] line-clamp-2 leading-[1.1]">
                      {item.title}
                    </h2>
                    {item.subtitle && (
                      <p className="text-[11px] sm:text-sm md:text-base font-medium text-[#4A4D59] line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                    {item.tagline && (
                      <p className="font-mono text-xs sm:text-base md:text-lg font-black text-[#0C0D11]">
                        {item.tagline}
                      </p>
                    )}
                  </div>

                  <div>
                    <Link
                      href={item.ctaLink || "/shop"}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn cursor-pointer"
                    >
                      <span>{item.ctaText || "Explore"}</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Imagery Right Column */}
                <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:w-[50%] md:w-[55%] h-full overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "Collection Item"}
                      fill
                      priority={index === 0}
                      className="object-cover object-center sm:object-right-center transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 60vw, 700px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F4F5F9]">
                      <Package className="w-10 h-10 text-[#8E92A2]" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}