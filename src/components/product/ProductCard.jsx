import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product }) {
  const isSale = product?.salePrice && product.salePrice < product.price;
  const imageUrl =
    product?.images?.[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop";

  const brandName = product?.brand || product?.category?.name || "RADHA OUTFIT";
  const formattedPrice = (product?.salePrice || product?.price || 1499).toLocaleString("en-IN");
  const defaultSize = product?.sizes?.[0] || "M";

  return (
    <Link
      href={`/product/${product?.slug || ""}`}
      className="group block w-full bg-white rounded-[22px] sm:rounded-[30px] p-3 sm:p-4 shadow-[0_6px_20px_-4px_rgba(16,24,40,0.04)] border border-[#E8EBF2] hover:shadow-[0_16px_32px_-6px_rgba(16,24,40,0.08)] transition-all duration-300 select-none"
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-square rounded-[16px] sm:rounded-[22px] overflow-hidden bg-[#F4F5F9]">
        <Image
          src={imageUrl}
          alt={product?.name || "Garment"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {isSale && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide bg-[#EBF1FD] text-[#3B7BF6]">
            Sale
          </span>
        )}
      </div>

      {/* Details Area */}
      <div className="pt-3 sm:pt-3.5 flex flex-col space-y-1">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8E92A2] truncate">
          {brandName}
        </span>

        <h3 className="text-[13px] sm:text-[15px] font-bold text-[#0C0D11] tracking-tight leading-snug truncate group-hover:text-[#3B7BF6] transition-colors">
          {product?.name || "Garment Silhouette"}
        </h3>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#8E92A2] pt-0.5">
          <span>Size: {defaultSize}</span>
          <span className="text-[#10B981] font-semibold text-[9px] sm:text-[10px]">In Stock</span>
        </div>

        {/* Footer: Price + Button */}
        <div className="pt-2 sm:pt-2.5 border-t border-[#F4F5F9] flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-[14px] sm:text-[16px] font-extrabold text-[#0C0D11] truncate">
              ₹{formattedPrice}
            </span>
            {isSale && (
              <span className="hidden xs:inline text-[10px] line-through text-[#8E92A2]">
                ₹{(product?.price || 0).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0C0D11] group-hover:bg-[#3B7BF6] text-white flex items-center justify-center transition-colors shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}