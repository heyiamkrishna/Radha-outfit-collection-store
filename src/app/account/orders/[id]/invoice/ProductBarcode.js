"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { ScanBarcode } from "lucide-react";

export default function ProductBarcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, String(value), {
          format: "CODE128",
          lineColor: "#0C0D11",
          width: 1.15,
          height: 26,
          displayValue: false, // Clean vector bars without default raw font
          margin: 0,
          background: "transparent",
        });
      } catch (err) {
        console.error("Barcode rendering error:", err);
      }
    }
  }, [value]);

  if (!value) return null;

  // Format string into clean atelier chunks (e.g. 6AA0 · 3557 · 308F)
  const cleanStr = String(value).toUpperCase();
  const chunked =
    cleanStr.length >= 12
      ? `${cleanStr.slice(0, 4)} · ${cleanStr.slice(4, 8)} · ${cleanStr.slice(-4)}`
      : cleanStr;

  return (
    <div className="relative mt-2.5 inline-block group print:mt-1.5">
      {/* Luxury Hangtag Container */}
      <div className="relative flex flex-col items-center bg-[#FAFAFC] border border-[#E8EBF2] rounded-xl px-3 py-2 shadow-[0_2px_8px_-4px_rgba(12,13,17,0.06)] print:bg-white print:border-[#D1D5DB] print:shadow-none">
        
        {/* Subtle Crosshair Top Bar */}
        <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-[#F0F2F6] text-[8px] font-mono tracking-widest text-[#8E92A2] uppercase">
          <span className="flex items-center gap-1 font-bold text-[#0C0D11]">
            <ScanBarcode className="w-2.5 h-2.5 text-[#3B7BF6]" />
            ROC ARCHIVE
          </span>
          <span className="text-[7px] text-[#A0A4B4]">CODE-128</span>
        </div>

        {/* The Barcode SVG */}
        <div className="py-0.5 px-1 bg-white rounded-md border border-[#F0F2F6]/60 print:border-none flex justify-center">
          <svg
            ref={svgRef}
            className="w-[120px] sm:w-[130px] h-[24px] print:h-[22px] overflow-visible"
          />
        </div>

        {/* Segmented Serial Code */}
        <div className="pt-1 w-full text-center">
          <span className="font-mono text-[8.5px] font-black text-[#0C0D11] tracking-wider selection:bg-[#0C0D11] selection:text-white">
            {chunked}
          </span>
        </div>
      </div>
    </div>
  );
}