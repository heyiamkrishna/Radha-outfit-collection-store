"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function LuxuryPreloader() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Elegant duration tailored for initial assets and hydration
    const timer = setTimeout(() => {
      setFading(true);
      const removeTimer = setTimeout(() => setMounted(false), 750);
      return () => clearTimeout(removeTimer);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fading
          ? "opacity-0 backdrop-blur-0 scale-[1.03]"
          : "opacity-100 backdrop-blur-2xl bg-[#F8F9FC]/80"
      }`}
    >
      {/* Ambient Lighting Bloom */}
      <div className="absolute w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#3B7BF6]/15 via-rose-300/10 to-amber-200/15 blur-3xl -z-10 animate-pulse" />

      {/* Main Frosted Glass Card Container */}
      <div className="relative w-full max-w-[300px] sm:max-w-[380px] rounded-[32px] sm:rounded-[40px] bg-white/70 border border-white/90 shadow-[0_24px_60px_-15px_rgba(12,13,17,0.08)] backdrop-blur-xl p-6 sm:p-9 flex flex-col items-center text-center space-y-5 sm:space-y-6">
        
        {/* Monogram Crest with Orbital Glow Ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Orbital Ring */}
          <div className="absolute -inset-2.5 rounded-[26px] sm:rounded-[30px] border border-[#0C0D11]/10 animate-[spin_8s_linear_infinite]" />
          <div className="absolute -inset-1 rounded-[22px] sm:rounded-[26px] border border-dashed border-[#3B7BF6]/30 animate-[spin_12s_linear_infinite_reverse]" />

          {/* Central Atelier Emblem */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-[#0C0D11] text-white flex flex-col items-center justify-center shadow-xl shadow-[#0C0D11]/15">
            <span className="font-serif font-black text-xl sm:text-2xl tracking-tighter leading-none">
              ROC
            </span>
            <span className="text-[7px] font-mono tracking-[0.2em] uppercase text-white/50 mt-1">
              Atelier
            </span>

            {/* Sparkle Accent */}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#3B7BF6] to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Brand Typography & Tagline */}
        <div className="space-y-1 sm:space-y-1.5">
          <p className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-[0.28em] text-[#3B7BF6]">
            Haute Couture & Silks
          </p>
          <h2 className="text-sm sm:text-base font-serif font-black uppercase tracking-widest text-[#0C0D11]">
            Radha Outfit Collection
          </h2>
          <p className="text-[10px] font-mono text-[#8E92A2]">
            Preparing Bespoke Silhouettes...
          </p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="w-32 sm:w-44 h-1 bg-[#E8EBF2] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#0C0D11] to-[#3B7BF6] rounded-full animate-[progressSweep_1.4s_infinite_cubic-bezier(0.4,0,0.2,1)]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progressSweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(260%);
          }
        }
      `}</style>
    </div>
  );
}