"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  RotateCcw,
  Truck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("heritage");

  const tabs = [
    { id: "heritage", label: "Our Heritage" },
    { id: "sizing", label: "Sizing & Fit" },
    { id: "care", label: "Textile Care" },
    { id: "contact", label: "Concierge" },
  ];

  const sizeChart = [
    { size: "XS", chest: '34" - 36"', waist: '28" - 30"', hip: '35" - 37"' },
    { size: "S", chest: '36" - 38"', waist: '30" - 32"', hip: '37" - 39"' },
    { size: "M", chest: '38" - 40"', waist: '32" - 34"', hip: '39" - 41"' },
    { size: "L", chest: '40" - 42"', waist: '34" - 36"', hip: '41" - 43"' },
    { size: "XL", chest: '42" - 44"', waist: '36" - 38"', hip: '43" - 45"' },
    { size: "XXL", chest: '44" - 46"', waist: '38" - 40"', hip: '45" - 47"' },
  ];

  return (
    <div className="relative min-h-screen bg-[#FBFBFC] text-[#0C0D11] pt-4 sm:pt-8 pb-16 sm:pb-24 px-3.5 sm:px-6 md:px-12 overflow-x-hidden selection:bg-[#0C0D11] selection:text-white">
      {/* Background Lighting Blobs */}
      <div className="pointer-events-none absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-5 w-[450px] h-[450px] bg-gradient-to-tl from-rose-100/25 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
        {/* Header Hero Section */}
        <section className="text-center space-y-3 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.25em] bg-white border border-black/[0.06] text-[#3B7BF6] shadow-2xs">
            <Sparkles className="w-3 h-3" /> Radha Outfit Collection
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
            The Central Atelier
          </h1>
          <p className="text-xs sm:text-sm text-[#8E92A2] max-w-xl mx-auto font-medium leading-relaxed">
            Where traditional Indian artisanship meets structured contemporary silhouettes. Handcrafted runs, double-faced natural weaves, and made-to-measure tailoring.
          </p>
        </section>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 ${
                activeTab === tab.id
                  ? "bg-[#0C0D11] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#585C6D] border border-black/[0.05]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Editorial Content Panel */}
        <main className="bg-white/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 md:p-12 border border-white/90 shadow-[0_20px_50px_-15px_rgba(12,13,17,0.04)] ring-1 ring-black/[0.03]">
          {/* 1. Heritage Tab */}
          {activeTab === "heritage" && (
            <div className="space-y-8 animate-luxury-fade">
              <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
                  Manifesto & Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#0C0D11]">
                  Artisanship With Structural Balance
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-xs sm:text-sm text-[#4A4D59] leading-relaxed">
                <p>
                  Radha Outfit Collection was established on the foundation of elevating traditional Indian occasion wear with minimal, clean architectural lines. We dismiss mass-produced fast couture in favor of limited, verified releases.
                </p>
                <p>
                  Every garment is developed in collaboration with master weavers and embroiderers across Varanasi, Delhi, and Jaipur. By preserving handcrafted zardozi and raw silk textures, each design maintains durability and tactile grace.
                </p>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1">
                  <Scissors className="w-5 h-5 text-[#0C0D11]" />
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11] pt-1">
                    Bespoke Alterations
                  </h4>
                  <p className="text-[11px] text-[#8E92A2] leading-relaxed">
                    Customized bust, waist, and sleeve tailoring on request prior to shipping.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11] pt-1">
                    Pure Textiles
                  </h4>
                  <p className="text-[11px] text-[#8E92A2] leading-relaxed">
                    100% natural silks, organzas, linens, and pure cotton linings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1">
                  <Truck className="w-5 h-5 text-[#3B7BF6]" />
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11] pt-1">
                    Sealed Delivery
                  </h4>
                  <p className="text-[11px] text-[#8E92A2] leading-relaxed">
                    Dispatched in archival, breathable garment covers via express logistics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Sizing Tab */}
          {activeTab === "sizing" && (
            <div className="space-y-6 animate-luxury-fade">
              <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
                  Standard Proportions
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#0C0D11]">
                  Atelier Measurement Guide
                </h2>
                <p className="text-xs text-[#8E92A2]">
                  Measurements refer to bodily dimensions in inches. For custom made-to-measure fitting, select your closest size and reach out via Concierge.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFBFD] border-b border-black/[0.06] font-mono text-[9px] uppercase tracking-wider text-[#8E92A2]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Standard Size</th>
                      <th className="py-3 px-4 font-bold">Chest / Bust</th>
                      <th className="py-3 px-4 font-bold">Waist</th>
                      <th className="py-3 px-4 font-bold">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] font-mono">
                    {sizeChart.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FAFBFD]">
                        <td className="py-3 px-4 font-bold text-[#0C0D11]">{row.size}</td>
                        <td className="py-3 px-4 text-[#4A4D59]">{row.chest}</td>
                        <td className="py-3 px-4 text-[#4A4D59]">{row.waist}</td>
                        <td className="py-3 px-4 text-[#4A4D59]">{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Care Guidelines Tab */}
          {activeTab === "care" && (
            <div className="space-y-6 animate-luxury-fade">
              <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
                  Garment Longevity
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#0C0D11]">
                  Textile Preservation
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed text-[#4A4D59]">
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1.5">
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11]">
                    Silk & Zardozi Drapes
                  </h4>
                  <p className="text-[11px] text-[#8E92A2]">
                    Dry clean only with reputable specialists. Avoid spraying perfume or moisture directly onto metallic zari embroidery.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1.5">
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11]">
                    Storage Protocol
                  </h4>
                  <p className="text-[11px] text-[#8E92A2]">
                    Store in our complimentary breathable muslin covers. Never preserve luxury silks in non-breathable plastic bags over prolonged seasons.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1.5">
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11]">
                    Pressing & Steaming
                  </h4>
                  <p className="text-[11px] text-[#8E92A2]">
                    Always iron garments inside out on the lowest silk setting with a thin protective muslin cloth layer, or rely on vertical steaming.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-1.5">
                  <h4 className="font-serif font-black text-xs uppercase text-[#0C0D11]">
                    Doorstep Alterations
                  </h4>
                  <p className="text-[11px] text-[#8E92A2]">
                    Eligible for 7-day doorstep size adjustment if the original security tags and barcode cert remain untampered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Concierge & Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6 animate-luxury-fade">
              <div className="space-y-2 pb-6 border-b border-black/[0.05]">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6]">
                  Personal Attention
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#0C0D11]">
                  Atelier Concierge
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-2 text-xs">
                  <Mail className="w-4 h-4 text-[#3B7BF6]" />
                  <h4 className="font-mono font-bold uppercase text-[#0C0D11]">Digital Desk</h4>
                  <p className="text-[#8E92A2] text-[11px]">Direct client inquiry</p>
                  <a
                    href="mailto:client@radhaoutfit.com"
                    className="font-mono font-bold text-[#0C0D11] hover:underline block pt-1"
                  >
                    client@radhaoutfit.com
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-2 text-xs">
                  <Phone className="w-4 h-4 text-[#3B7BF6]" />
                  <h4 className="font-mono font-bold uppercase text-[#0C0D11]">Direct Line</h4>
                  <p className="text-[#8E92A2] text-[11px]">Mon - Sat (10 AM - 7 PM)</p>
                  <span className="font-mono font-bold text-[#0C0D11] block pt-1">
                    +91 98765 43210
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-2 text-xs">
                  <MapPin className="w-4 h-4 text-[#3B7BF6]" />
                  <h4 className="font-mono font-bold uppercase text-[#0C0D11]">Studio</h4>
                  <p className="text-[#8E92A2] text-[11px]">By appointment</p>
                  <span className="font-serif font-bold text-[#0C0D11] block pt-1 text-[11px]">
                    Connaught Place, New Delhi 110001
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}