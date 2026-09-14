"use client";

import { useState } from "react";
import {
  Sparkles,
  Scissors,
  Shirt,
  Palette,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Award,
  Package,
  Ruler,
  Info,
  ChevronDown,
  Sparkle,
  Compass,
} from "lucide-react";

export default function ProductSpecifications({ product }) {
  const [activeTab, setActiveTab] = useState("specifications");

  // Fallback defaults tailored for luxury couture
  const highlights = [
    {
      label: "Material & Weave",
      value: product?.fabric || "100% Pure Mulberry Cotton",
      icon: Sparkles,
      tag: "Pure Weave",
    },
    {
      label: "Sleeve Profile",
      value: product?.sleeve || "Full Tailored Sleeve",
      icon: Shirt,
      tag: "Couture Cut",
    },
    {
      label: "Pattern & Finish",
      value: product?.pattern || "Solid Pure Tone",
      icon: Layers,
      tag: "Minimalist",
    },
    {
      label: "Color Palette",
      value: product?.color || "Imperial Plum / Purple",
      icon: Palette,
      tag: "Vat-Dyed",
    },
    {
      label: "Tailored Fit",
      value: product?.fit || "Slim Atelier Fit",
      icon: Scissors,
      tag: "Bespoke Contour",
    },
    {
      label: "Unit Assembly",
      value: product?.packOf ? `Pack of ${product.packOf}` : "Single Edition Piece (1)",
      icon: Package,
      tag: "Verified",
    },
  ];

  const generalSpecs = [
    { label: "Design House / Brand", value: product?.brand || "Louis Philippe Sport / Radha Atelier" },
    { label: "Edition Size", value: product?.size || "39 Standard (M)" },
    { label: "Archival Style Code", value: product?.styleCode || (product?.slug || "LYSFCSLBW73895").toUpperCase() },
    { label: "Silhouette & Fit", value: product?.fit || "Slim Sartorial Silhouette" },
    { label: "Base Composition", value: product?.fabric || "Pure Combed Cotton (Zero Synthetic)" },
    { label: "Sleeve Architecture", value: product?.sleeve || "Full Sleeve with Buttoned Cuff" },
    { label: "Surface Texture", value: product?.pattern || "Subtle Micro-Structured Solid" },
    { label: "Closure Type", value: product?.closure || "Mother-of-Pearl Button Placket" },
    { label: "Collar Structure", value: product?.collar || "Spread Classic Atelier Collar" },
  ];

  const careGuidelines = [
    "Professional dry clean recommended for primary wears to preserve dye luster.",
    "Machine wash lukewarm at 30°C on delicate cycle with mild organic detergent.",
    "Do not wring or tumble dry; dry in natural shade to prevent fiber stress.",
    "Steam iron on medium setting with protective press cloth.",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 my-10 font-mono text-[#0C0D11]">
      
      {/* ── 1. PRODUCT HIGHLIGHTS (LUXURY ICON GRID) ── */}
      <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0C0D11] animate-pulse" />
              <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-[0.25em] text-[#3B7BF6]">
                Garment Anatomy
              </span>
            </div>
            <h3 className="font-serif font-black uppercase tracking-tight text-base sm:text-xl text-[#0C0D11]">
              Product Highlights
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFC] border border-black/[0.06] text-[10px] text-[#8E92A2]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Master Tailor Verified</span>
          </div>
        </div>

        {/* Highlights Micro-Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-4 sm:p-4.5 rounded-[22px] bg-[#FAFAFC] border border-black/[0.05] hover:border-[#0C0D11] hover:bg-white transition-all duration-300 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#0C0D11] group-hover:bg-[#0C0D11] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#8E92A2] border border-black/[0.04] group-hover:border-black/10">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#8E92A2] block font-bold">
                    {item.label}
                  </span>
                  <p className="font-serif font-black text-xs sm:text-sm uppercase tracking-tight text-[#0C0D11] pt-0.5 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. TABBED DOSSIER: SPECIFICATIONS & CARE ── */}
      <section className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.06] shadow-xs space-y-6">
        
        {/* Editorial Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] pb-4">
          <div>
            <h3 className="font-serif font-black uppercase tracking-tight text-base sm:text-xl text-[#0C0D11]">
              Technical Dossier
            </h3>
            <p className="text-[10px] text-[#8E92A2] tracking-wider">
              Comprehensive garment engineering & provenance
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFAFC] p-1 rounded-full border border-black/[0.05]">
            {[
              { id: "specifications", label: "Specifications" },
              { id: "description", label: "Editorial Note" },
              { id: "care", label: "Care & Origin" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0C0D11] text-white shadow-2xs"
                    : "text-[#4A4D59] hover:text-[#0C0D11]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT 1: SPECIFICATIONS ── */}
        {activeTab === "specifications" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-[#8E92A2] px-1">
              <span>General Nomenclature</span>
              <span>Atelier Verified Specs</span>
            </div>

            <div className="rounded-[24px] border border-black/[0.05] overflow-hidden bg-[#FAFAFC]/60">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/[0.05]">
                
                {/* Column Left */}
                <div className="divide-y divide-black/[0.04]">
                  {generalSpecs.slice(0, 5).map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-white transition-colors"
                    >
                      <span className="text-[10px] text-[#8E92A2] uppercase tracking-wider">
                        {spec.label}
                      </span>
                      <span className="font-serif font-bold text-xs uppercase text-[#0C0D11] text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column Right */}
                <div className="divide-y divide-black/[0.04]">
                  {generalSpecs.slice(5).map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-white transition-colors"
                    >
                      <span className="text-[10px] text-[#8E92A2] uppercase tracking-wider">
                        {spec.label}
                      </span>
                      <span className="font-serif font-bold text-xs uppercase text-[#0C0D11] text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 2: EDITORIAL DESCRIPTION ── */}
        {activeTab === "description" && (
          <div className="p-5 sm:p-6 rounded-[24px] bg-[#FAFAFC] border border-black/[0.05] space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 text-[#3B7BF6]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Atelier Silhouette Narrative
              </span>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#4A4D59] leading-relaxed whitespace-pre-line">
              {product?.description ||
                "Crafted from premium long-staple combed cotton, this silhouette harmonizes classical formal tailoring with relaxed, contemporary ease. The fabric offers exceptional air permeability, resilient fiber retention, and a hand-feel that softens gracefully with wear. Styled with clean tonal stitchlines and discreet internal neck taping for uncompromised longevity."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-[9.5px]">
              <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] text-[#0C0D11] font-bold uppercase">
                Ethically Sourced
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] text-[#0C0D11] font-bold uppercase">
                Non-Synthetic Base
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-black/[0.06] text-[#0C0D11] font-bold uppercase">
                Zero Shrinkage Guard
              </span>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 3: CARE & PROVENANCE ── */}
        {activeTab === "care" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-200">
            {/* Garment Care Rules */}
            <div className="p-5 rounded-[24px] bg-[#FAFAFC] border border-black/[0.05] space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0C0D11] flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#3B7BF6]" />
                Longevity & Fabric Maintenance
              </span>
              <ul className="space-y-2 text-xs font-sans text-[#4A4D59]">
                {careGuidelines.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0C0D11] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Manufacturer & Provenance */}
            <div className="p-5 rounded-[24px] bg-[#FAFAFC] border border-black/[0.05] space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0C0D11] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Origin & Quality Assurance
              </span>
              <div className="space-y-2 text-xs divide-y divide-black/[0.04]">
                <div className="flex justify-between pb-1.5">
                  <span className="text-[#8E92A2] uppercase text-[10px]">Manufacturer</span>
                  <span className="font-bold text-[#0C0D11]">Aditya Birla Fashion & Retail / Radha Atelier</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#8E92A2] uppercase text-[10px]">Country of Origin</span>
                  <span className="font-bold text-[#0C0D11]">India (Bharat)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#8E92A2] uppercase text-[10px]">Quality Inspection</span>
                  <span className="font-bold text-emerald-700">100% Manual QC Cleared</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-[#8E92A2] uppercase text-[10px]">Consumer Care</span>
                  <span className="font-bold text-[#0C0D11]">concierge@radhaoutfit.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}