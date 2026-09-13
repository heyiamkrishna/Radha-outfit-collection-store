"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, Scan, Sparkles } from "lucide-react";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [mounted, setMounted] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll on open
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

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      try {
        const qrScanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          false
        );

        qrScanner.render(
          (decodedText) => {
            qrScanner.clear().catch(() => {});
            if (onScanSuccess) onScanSuccess(decodedText);
            onClose();
          },
          () => {
            // Frame scan attempts ignored
          }
        );

        scannerRef.current = qrScanner;
      } catch (err) {
        console.error("Scanner initialization error:", err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col justify-end sm:justify-center items-center overflow-hidden"
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[32px] border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-200"
        style={{ maxHeight: "88dvh" }}
      >
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-sm sm:text-base">
                Scan Garment Tag
              </h3>
              <p className="text-[10px] text-[#8E92A2] font-mono">
                Optical camera tag verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3" style={{ overscrollBehavior: "contain" }}>
          <div
            id="reader"
            className="overflow-hidden rounded-2xl border border-black/[0.08] bg-black/5 [&_video]:rounded-2xl"
          />
          <p className="text-[11px] font-mono text-[#8E92A2] text-center pt-1">
            Align camera with garment physical barcode or QR tag.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}