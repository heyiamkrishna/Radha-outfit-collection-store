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
  const displaySlides = useMemo(() => {
    if (!banners || banners.length === 0) return [];
    if (banners.length === 1) return banners;
    if (banners.length === 2) return [...banners, ...banners, ...banners];
    if (banners.length < 6) return [...banners, ...banners];
    return banners;
  }, [banners]);

  const hasMultipleBanners = (banners?.length || 0) > 1;

  if (!displaySlides || displaySlides.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[1440px] mx-auto pt-1 sm:pt-2 pb-6 sm:pb-12 overflow-hidden select-none">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={10}
        slidesPerView={1.03}
        centeredSlides={hasMultipleBanners}
        loop={hasMultipleBanners}
        autoplay={
          hasMultipleBanners
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{
          clickable: true,
          bulletActiveClass:
            "swiper-pagination-bullet-active !w-6 sm:!w-8 !bg-[#0C0D11] !rounded-full shadow-xs",
          bulletClass:
            "swiper-pagination-bullet !w-1.5 sm:!w-2 !h-1.5 sm:!h-2 !bg-[#8E92A2]/40 !opacity-100 !transition-all !duration-300",
        }}
        breakpoints={{
          480: {
            slidesPerView: 1.08,
            spaceBetween: 14,
          },
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
        className="hero-swiper !pb-8 sm:!pb-10 !px-2 sm:!px-6"
      >
        {displaySlides.map((item, index) => (
          <SwiperSlide
            key={`${item._id || "banner"}-${index}`}
            className="transition-transform duration-500"
          >
            {({ isActive }) => (
              <div
                className={`relative w-full aspect-[1.7/1] sm:aspect-[2.2/1] md:aspect-[2.4/1] min-h-[190px] xs:min-h-[220px] sm:min-h-[290px] md:min-h-[350px] lg:min-h-[380px] rounded-[22px] sm:rounded-[36px] overflow-hidden border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? "scale-100 shadow-[0_12px_40px_-10px_rgba(12,13,17,0.1)] border-white/95"
                    : "scale-[0.97] opacity-75 border-black/[0.04]"
                } bg-gradient-to-r ${
                  item.bgGradient || "from-[#F7F4EF] via-[#F4F5F9] to-[#E9EDF5]"
                }`}
              >
                {/* Content Left Column */}
                <div className="relative z-10 h-full w-[65%] xs:w-[60%] sm:w-[54%] md:w-[50%] p-3.5 xs:p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between">
                  <div
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-mono font-black uppercase tracking-wider bg-white/90 text-[#0C0D11] backdrop-blur-md shadow-2xs border border-white/80">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#3B7BF6]" />
                      <span>{item.badge || "Radha Exclusive"}</span>
                    </span>
                  </div>

                  <div
                    className={`space-y-1 sm:space-y-2 my-auto py-1 sm:py-2 transition-all duration-500 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <h2 className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[38px] font-black font-serif uppercase tracking-tight text-[#0C0D11] line-clamp-2 leading-[1.1]">
                      {item.title}
                    </h2>
                    {item.subtitle && (
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[#4A4D59] line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                    {item.tagline && (
                      <p className="font-mono text-[11px] sm:text-sm md:text-base font-black text-[#0C0D11]">
                        {item.tagline}
                      </p>
                    )}
                  </div>

                  <div
                    className={`transition-all duration-500 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <Link
                      href={item.ctaLink || "/shop"}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-3 rounded-full bg-[#0C0D11] text-white text-[9px] sm:text-xs font-black uppercase tracking-wider hover:bg-[#1E2028] transition-all shadow-xs active:scale-95"
                    >
                      <span>{item.ctaText || "Explore"}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Imagery Right Column */}
                <div className="absolute right-0 top-0 bottom-0 w-[42%] xs:w-[46%] sm:w-[50%] md:w-[54%] h-full overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "Banner Item"}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 650px"
                      className={`object-cover object-center sm:object-right-center transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? "scale-[1.03]" : "scale-100"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F4F5F9]">
                      <Package className="w-8 h-8 text-[#8E92A2]" />
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