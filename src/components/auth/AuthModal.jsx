"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ArrowUpRight, Lock, UserPlus, ShieldCheck } from "lucide-react";

export default function AuthModal({ isOpen, onClose, redirectUrl = "/checkout" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0D11]/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 2. Porcelain & Carbon Dialog Surface */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(12,13,17,0.25)] border border-[#E8EBF2] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#F4F5F9] text-[#4A4D59] hover:text-[#0C0D11] hover:bg-[#E8EBF2] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Monogram & Periwinkle Chip */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-[#EBF1FD] text-[#3B7BF6] flex items-center justify-center shadow-xs">
            <Lock className="w-5 h-5" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F4F5F9] text-[#8E92A2]">
            Atelier Checkout Access
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0C0D11] tracking-tight">
            Sign In or Join ROC
          </h3>

          <p className="text-xs sm:text-[13px] text-[#8E92A2] max-w-xs leading-relaxed">
            Please log in or create an account to access order tracking, bespoke sizing records, and complete your purchase.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 space-y-2.5">
          {/* Sign In Link */}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Sign In to Account</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          {/* Create Account Link */}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="w-full py-3.5 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[#0C0D11] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border border-[#E8EBF2]"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#4A4D59]" />
            <span>Create New Account</span>
          </Link>
        </div>

        {/* Security / Verification Micro-Badge */}
        <div className="mt-6 pt-4 border-t border-[#F4F5F9] flex items-center justify-center gap-2 text-[11px] text-[#8E92A2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Encrypted Session & Verified Client Protocol</span>
        </div>

      </div>
    </div>
  );
}