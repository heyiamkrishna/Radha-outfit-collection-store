"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8EBF2] bg-white text-[#4A4D59] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12">
        
        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10 border-b border-[#F4F5F9]">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2]/60">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0C0D11] shadow-xs shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0C0D11]">Complimentary Express Shipping</h4>
              <p className="text-[11px] text-[#8E92A2] mt-0.5">All orders dispatched within 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2]/60">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0C0D11] shadow-xs shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0C0D11]">Bespoke Exchanges</h4>
              <p className="text-[11px] text-[#8E92A2] mt-0.5">Hassle-free 7-day pickup & return</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2]/60">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0C0D11] shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0C0D11]">Verified Authenticity</h4>
              <p className="text-[11px] text-[#8E92A2] mt-0.5">100% ethically sourced textiles</p>
            </div>
          </div>
        </div>

        {/* Main Footer Directory */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#0C0D11] text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                R
              </span>
              <span className="font-extrabold text-sm uppercase tracking-tight text-[#0C0D11]">
                Radha Outfit Collection <span className="text-[#8E92A2] font-normal text-xs">(ROC)</span>
              </span>
            </Link>
            <p className="text-xs text-[#8E92A2] leading-relaxed max-w-sm">
              Contemporary minimalist essentials tailored with precision, double-faced organic wool, and fluid modern geometry.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1FD] text-[#3B7BF6] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7BF6] animate-pulse" />
              <span>Atelier Live // Delhi, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C0D11]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#4A4D59]">
              <li>
                <Link href="/shop" className="hover:text-[#3B7BF6] transition-colors">
                  All Pieces
                </Link>
              </li>
              <li>
                <Link href="/shop?category=men" className="hover:text-[#3B7BF6] transition-colors">
                  Men&apos;s Line
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="hover:text-[#3B7BF6] transition-colors">
                  Women&apos;s Line
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kids" className="hover:text-[#3B7BF6] transition-colors">
                  Kid&apos;s Line
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C0D11]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-[#4A4D59]">
              <li>
                <Link href="/account" className="hover:text-[#3B7BF6] transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3B7BF6] transition-colors">
                  Sizing & Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3B7BF6] transition-colors">
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3B7BF6] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C0D11]">
              Bespoke Dispatch
            </h4>
            <p className="text-xs text-[#8E92A2] leading-relaxed">
              Receive private drop notifications and seasonal lookbook releases.
            </p>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-1.5 p-1 rounded-full bg-[#F4F5F9] border border-[#E8EBF2]">
              <div className="pl-3 text-[#8E92A2]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                placeholder="client@radhaoutfit.com"
                className="w-full bg-transparent px-2 py-1.5 text-xs text-[#0C0D11] placeholder:text-[#8E92A2] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-semibold tracking-wide transition-colors shrink-0 shadow-xs flex items-center gap-1"
              >
                Join <ArrowUpRight className="w-3 h-3" />
              </button>
            </form>
          </div>

        </div>

        {/* Legal Bar */}
        <div className="pt-8 border-t border-[#F4F5F9] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E92A2]">
          <p>© {new Date().getFullYear()} Radha Outfit Collection (ROC). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-[#0C0D11] transition-colors">
              Shipping & Returns
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}