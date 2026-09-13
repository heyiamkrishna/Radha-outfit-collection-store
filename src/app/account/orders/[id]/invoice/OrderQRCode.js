"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";

const ROC_LOGO_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'><rect width='24' height='24' rx='6' fill='%230C0D11'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23FFFFFF' font-size='8.5' font-weight='900' font-family='sans-serif'>ROC</text></svg>";

export default function OrderQRCode({ orderNumber, orderId, baseUrl }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine origin safely without SSR/client branch conflicts
  const origin =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://radhaoutfitcollection.com");

  const targetUrl = `${origin}/account/orders/${orderId || orderNumber}/invoice`;

  return (
    <div className="flex flex-col items-center select-none shrink-0 print:m-0">
      {/* Target Scanner Card with Precision Corner Brackets */}
      <div className="relative p-3.5 bg-white rounded-2xl border border-[#E8EBF2] shadow-[0_8px_24px_-8px_rgba(12,13,17,0.06)] print:shadow-none print:border-[#CBD5E1]">
        <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#0C0D11] rounded-tl-[5px] pointer-events-none" />
        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#0C0D11] rounded-tr-[5px] pointer-events-none" />
        <span className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#0C0D11] rounded-bl-[5px] pointer-events-none" />
        <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#0C0D11] rounded-br-[5px] pointer-events-none" />

        {/* Fixed aspect-ratio container prevents CLS during mount */}
        <div className="relative w-[88px] h-[88px] p-1 bg-white rounded-lg flex items-center justify-center">
          {mounted ? (
            <QRCodeSVG
              value={targetUrl}
              size={88}
              level="H"
              includeMargin={false}
              fgColor="#0C0D11"
              bgColor="#FFFFFF"
              imageSettings={{
                src: ROC_LOGO_DATA_URI,
                height: 22,
                width: 22,
                excavate: true,
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#F4F5F9] animate-pulse rounded" />
          )}
        </div>
      </div>

      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F5F9] border border-[#E8EBF2] text-[8px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] whitespace-nowrap">
        <Smartphone className="w-2.5 h-2.5 text-[#3B7BF6] shrink-0" />
        <span>Scan with camera</span>
      </div>
    </div>
  );
}