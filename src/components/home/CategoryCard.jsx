import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({
  title = "Women's Wear",
  subtitle = "Fluid silhouettes & everyday wear.",
  href = "/shop?category=women",
  image = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
}) {
  return (
    <Link
      href={href}
      className="group relative w-full aspect-[16/9.5] sm:aspect-[16/10] rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#F4F5F9] border border-[#E8EBF2] shadow-[0_4px_16px_rgba(16,24,40,0.04)] hover:shadow-[0_10px_24px_rgba(16,24,40,0.08)] transition-all duration-300 flex flex-col justify-end p-2.5 sm:p-3"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Subtle Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

      {/* Top Department Badge */}
      <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/85 backdrop-blur-md text-[#0C0D11] shadow-xs">
        Line
      </span>

      {/* Anchored Frosted Bottom Panel */}
      <div className="relative z-10 w-full rounded-[14px] sm:rounded-[18px] px-3 py-2 backdrop-blur-xl bg-white/90 border border-white/80 shadow-xs flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0C0D11] tracking-tight truncate">
              {title}
            </h3>
            <span className="shrink-0 flex items-center justify-center w-3 h-3 rounded-full bg-[#10B981] text-white">
              <svg className="w-1.5 h-1.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <p className="text-[10px] text-[#8E92A2] truncate leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>

        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0C0D11] group-hover:bg-[#3B7BF6] text-white flex items-center justify-center transition-colors shrink-0 shadow-xs">
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}