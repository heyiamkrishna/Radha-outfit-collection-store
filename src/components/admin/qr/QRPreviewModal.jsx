"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, Download, Sparkles } from "lucide-react";

export default function QRPreviewModal({ isOpen, onClose, data }) {
  const printRef = useRef(null);

  if (!isOpen || !data) return null;

  const { product, variant, token, qrId } = data;
  const targetUrl = `${window.location.origin}/p/q/${token}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgElement = printRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${variant.sku || "GARMENT"}-QR.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8EBF2] shadow-2xl space-y-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#F4F5F9] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#3B7BF6]" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11]">
              Atelier Tag Spec
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Tag Layout */}
        <div
          ref={printRef}
          id="printable-single-tag"
          className="bg-[#FDFEFE] border border-[#CBD5E1] p-6 rounded-2xl space-y-4 mx-auto max-w-[260px] shadow-xs text-center"
        >
          <div className="space-y-0.5">
            <p className="text-[8px] font-mono tracking-[0.25em] uppercase font-black text-[#0C0D11]">
              RADHA ATELIER
            </p>
            <h4 className="text-xs font-serif font-black uppercase text-[#0C0D11] truncate">
              {product.name}
            </h4>
            <p className="text-[10px] font-mono text-[#4A4D59]">
              {variant.colorName} • Size {variant.size}
            </p>
          </div>

          <div className="flex items-center justify-center p-3 bg-white border border-dashed border-[#CBD5E1] rounded-xl">
            <QRCodeSVG
              value={targetUrl}
              size={140}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="space-y-0.5 font-mono">
            <p className="text-[9px] font-black tracking-widest text-[#0C0D11]">
              {variant.sku}
            </p>
            <p className="text-xs font-black text-[#0C0D11]">
              ₹{(variant.salePrice || variant.price || product.price || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[7px] text-[#8E92A2] uppercase">Scan to authenticate</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="w-full py-2.5 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[#0C0D11] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> SVG
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Tag
          </button>
        </div>
      </div>

      {/* Embedded Clean Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-single-tag,
          #printable-single-tag * {
            visibility: visible;
          }
          #printable-single-tag {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100% !important;
            max-width: 320px !important;
            border: 1px solid #000 !important;
            padding: 24px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}