"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck, Truck, RotateCcw, Check, Sparkles } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="relative border-t border-black/[0.05] bg-[#F7F8FC]/60 backdrop-blur-3xl text-[#4A4D59] pt-14 sm:pt-20 pb-10 sm:pb-14 overflow-hidden selection:bg-[#0C0D11] selection:text-white">
      
      {/* ── Glass Atmospheric Glow Orbs ── */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[480px] bg-gradient-to-br from-blue-200/35 via-indigo-100/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[520px] h-[520px] bg-gradient-to-tl from-rose-200/25 via-amber-100/20 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Editorial Watermark Backdrop */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 select-none opacity-[0.025] text-[#0C0D11] whitespace-nowrap font-serif font-black text-[90px] sm:text-[160px] lg:text-[220px] tracking-tighter leading-none -z-10">
        RADHA ATELIER
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12 sm:space-y-16">
        
        {/* 1. Frosted Value Proposition Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 pb-8 sm:pb-12 border-b border-black/[0.06]">
          
          <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-[24px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] ring-1 ring-black/[0.03] hover:bg-white/85 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0C0D11] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#3B7BF6] transition-colors">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6] block">
                Pan-India Express
              </span>
              <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                Complimentary Transit
              </h4>
              <p className="text-[10px] sm:text-[11px] text-[#8E92A2] truncate">
                Dispatched within 24 hours in sealed runs
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-[24px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] ring-1 ring-black/[0.03] hover:bg-white/85 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0C0D11] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#3B7BF6] transition-colors">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6] block">
                Made-to-Measure
              </span>
              <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                7-Day Atelier Exchange
              </h4>
              <p className="text-[10px] sm:text-[11px] text-[#8E92A2] truncate">
                Doorstep reverse courier pickup
              </p>
            </div>
          </div>

          <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-[24px] bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] ring-1 ring-black/[0.03] hover:bg-white/85 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0C0D11] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-emerald-600 transition-colors">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-emerald-600 block">
                Ethical Provenance
              </span>
              <h4 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-tight text-[#0C0D11] truncate">
                Authentic Craftsmanship
              </h4>
              <p className="text-[10px] sm:text-[11px] text-[#8E92A2] truncate">
                100% verified material and weave provenance
              </p>
            </div>
          </div>

        </div>

        {/* 2. Directory Columns & Glass Newsletter Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Brand Manifesto Column */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 select-none active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-[#0C0D11] text-white flex items-center justify-center shadow-md">
                <span className="font-serif font-black text-sm">R</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-sm tracking-tight uppercase text-[#0C0D11] leading-none">
                  Radha Outfit Collection
                </span>
                <span className="text-[8.5px] font-mono uppercase tracking-[0.25em] text-[#8E92A2] mt-1">
                  Atelier & Ready-to-Wear
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-[#585C6D] leading-relaxed max-w-sm">
              Contemporary minimalist silhouettes, bespoke tailoring, and heritage artisanal drapes designed for celebratory occasions and everyday luxury.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/90 text-[#0C0D11] text-[10px] font-mono font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio Live // New Delhi, India</span>
            </div>
          </div>

          {/* Quick Links Navigation */}
          <div className="grid grid-cols-2 md:col-span-3 lg:col-span-4 gap-6">
            <div className="space-y-3.5">
              <h4 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#0C0D11]">
                Collections
              </h4>
              <ul className="space-y-2 text-xs text-[#585C6D]">
                <li>
                  <Link href="/shop" className="hover:text-[#0C0D11] transition-colors">
                    All Silhouettes
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=women" className="hover:text-[#0C0D11] transition-colors">
                    Women&apos;s Wardrobe
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=men" className="hover:text-[#0C0D11] transition-colors">
                    Men&apos;s Tailoring
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=kids" className="hover:text-[#0C0D11] transition-colors">
                    Junior Atelier
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#0C0D11]">
                Client Care
              </h4>
              <ul className="space-y-2 text-xs text-[#585C6D]">
                <li>
                  <Link href="/account" className="hover:text-[#0C0D11] transition-colors">
                    Track Dispatch
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
                    Made-to-Measure Guide
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
                    Textile & Fabric Care
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
                    Consultation & Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Frosted Newsletter Card */}
          <div className="md:col-span-4 lg:col-span-4 p-5 sm:p-6 rounded-[28px] bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_12px_40px_rgb(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] ring-1 ring-black/[0.03] space-y-3.5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#3B7BF6]">
                <Sparkles className="w-3 h-3" /> Atelier Gazette
              </span>
              <h4 className="text-base font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                Bespoke Dispatch
              </h4>
            </div>
            
            <p className="text-[11px] sm:text-xs text-[#8E92A2] leading-relaxed">
              Receive private drop notifications, seasonal lookbooks, and exclusive run releases.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 backdrop-blur-md border border-black/[0.08] focus-within:border-[#0C0D11] focus-within:ring-2 focus-within:ring-black/[0.05] shadow-xs transition-all"
            >
              <div className="pl-3 text-[#8E92A2]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@radhaoutfit.com"
                className="w-full bg-transparent px-2 py-1 text-xs text-[#0C0D11] placeholder:text-[#8E92A2] focus:outline-none"
              />
              <button
                type="submit"
                className={`px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  subscribed
                    ? "bg-emerald-600 text-white scale-[0.98]"
                    : "bg-[#0C0D11] hover:bg-[#1E2028] text-white"
                }`}
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Joined
                  </>
                ) : (
                  <>
                    Join <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 3. Archival Legal & Trust Band */}
        <div className="pt-8 sm:pt-10 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10.5px] font-mono text-[#8E92A2] text-center sm:text-left">
          <p>© {new Date().getFullYear()} Radha Outfit Collection (ROC). All rights reserved.</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 uppercase tracking-wider">
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Privacy Protocol
            </Link>
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Terms of Couture
            </Link>
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Transit & Returns
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}