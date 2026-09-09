"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, Search, Loader2, CheckCircle2, AlertCircle, Plus, Minus } from "lucide-react";
import Image from "next/image";

export default function QRScannerModal({ isOpen, onClose }) {
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const scannerRef = useRef(null);
  const readerElementId = "atelier-qr-reader";

  const handleResolveToken = useCallback(async (tokenString, stockAdjustment = 0) => {
    try {
      setLoading(true);
      setError("");

      // Clean token if a full URL was scanned
      const cleanToken = tokenString.includes("/p/q/")
        ? tokenString.split("/p/q/")[1].split("?")[0]
        : tokenString.trim();

      const res = await fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cleanToken, stockAdjustment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decode QR tag.");

      setScanResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
    setCameraActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError("");
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 220, height: 220 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          stopScanner();
          handleResolveToken(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err) {
      setError("Camera permission denied or camera not found on device.");
      setCameraActive(false);
    }
  }, [handleResolveToken, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
      setScanResult(null);
      setError("");
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-[32px] p-5 sm:p-8 border border-[#E8EBF2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#0C0D11] text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-black text-sm uppercase text-[#0C0D11]">
                Atelier QR Scanner
              </h3>
              <p className="text-[10px] font-mono text-[#8E92A2]">Camera & Token Lookup</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0C0D11] aspect-square flex items-center justify-center">
          <div id={readerElementId} className="w-full h-full" />
          {!cameraActive && !loading && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white/70 space-y-2 bg-[#0C0D11]">
              <Camera className="w-8 h-8 opacity-40" />
              <p className="text-xs">Camera paused or inactive</p>
              <button
                type="button"
                onClick={startScanner}
                className="px-4 py-1.5 rounded-full bg-white text-[#0C0D11] text-[11px] font-black uppercase"
              >
                Restart Camera
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scan Result Card */}
        {scanResult && (
          <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E8EBF2] space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E8EBF2] shrink-0">
                <Image
                  src={scanResult.product.image}
                  alt={scanResult.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[9px] font-mono font-bold uppercase text-[#3B7BF6] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Authenticated Spec
                </span>
                <h4 className="text-xs font-black uppercase truncate text-[#0C0D11]">
                  {scanResult.product.name}
                </h4>
                <p className="text-[10px] font-mono text-[#4A4D59]">
                  {scanResult.variant.colorName} • Size {scanResult.variant.size} • SKU: {scanResult.variant.sku}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8EBF2] pt-3 text-xs font-mono">
              <span className="font-bold">Inventory Level:</span>
              <span className="font-black text-sm text-[#0C0D11]">
                {scanResult.variant.stock} units
              </span>
            </div>

            {/* Direct Inventory Adjustment Triggers */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleResolveToken(scanResult.qr.token, 1)}
                className="py-2 rounded-xl bg-white border border-[#E8EBF2] hover:border-[#0C0D11] text-xs font-bold flex items-center justify-center gap-1 text-emerald-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Stock In (+1)
              </button>
              <button
                type="button"
                disabled={loading || scanResult.variant.stock <= 0}
                onClick={() => handleResolveToken(scanResult.qr.token, -1)}
                className="py-2 rounded-xl bg-white border border-[#E8EBF2] hover:border-[#0C0D11] text-xs font-bold flex items-center justify-center gap-1 text-rose-600 transition-colors disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" /> Stock Out (-1)
              </button>
            </div>
          </div>
        )}

        {/* Manual Fallback Input */}
        <div className="space-y-1.5 pt-2 border-t border-[#F0F2F6]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E92A2]">
            Manual Token Fallback
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste 32-char hex token..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
            />
            <button
              type="button"
              disabled={loading || !manualToken.trim()}
              onClick={() => handleResolveToken(manualToken)}
              className="px-4 py-2 rounded-xl bg-[#0C0D11] text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Find</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}