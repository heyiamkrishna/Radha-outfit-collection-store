"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Printer, QrCode, Sparkles } from "lucide-react";

export default function QRPreviewModal({ isOpen, onClose, data }) {
  const [mounted, setMounted] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict viewport scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted || !isOpen || !data) return null;

  const { product, variant, token, qrId } = data;
  const qrPayload = JSON.stringify({
    productId: product?._id,
    sku: variant?.sku || product?.slug,
    token: token || qrId,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrPayload
  )}&margin=1`;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
      }}
    >
      {/* Clickable Backdrop Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        className="relative z-10 w-full max-w-[360px] xs:max-w-sm sm:max-w-md bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/[0.06] bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0">
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-xs sm:text-sm truncate">
                Garment QR Certificate
              </h3>
              <p className="text-[9.5px] sm:text-[10px] text-[#8E92A2] font-mono truncate">
                Atelier tag #{qrId || "ARCHIVE"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer active:scale-90 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Center Tag Area */}
        <div
          ref={printRef}
          className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-[#FAFAFC] border border-black/[0.06] text-center space-y-3 shadow-2xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0C0D11] text-white text-[8px] sm:text-[8.5px] font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>ROC Certified Atelier</span>
            </div>

            <h4 className="font-serif font-black uppercase text-xs sm:text-sm text-[#0C0D11] truncate px-1">
              {product?.name}
            </h4>

            {/* QR Code Graphic Frame */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-black/[0.06] inline-block shadow-2xs">
              <img
                src={qrImageUrl}
                alt="Product QR Tag"
                width={160}
                height={160}
                className="w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] object-contain rounded-lg mx-auto"
                loading="eager"
              />
            </div>

            <div className="space-y-0.5 font-mono text-[10px] sm:text-[11px]">
              <p className="font-black text-[#0C0D11] truncate">
                SKU: {(variant?.sku || product?.slug || "GARMENT").toUpperCase()}
              </p>
              <p className="text-[#8E92A2] text-[9.5px] sm:text-[10px]">
                Fit: <strong className="text-[#0C0D11]">{variant?.size || "M"}</strong> • Rate: ₹
                {Number(variant?.salePrice || variant?.price || product?.price || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 sm:py-3 rounded-full bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] border border-black/[0.07] text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 sm:py-3 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tag</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}