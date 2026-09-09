"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Plus, Loader2, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export default function BannerManagerModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    badge: "Radha Exclusive",
    tagline: "Starting at ₹4,999",
    ctaText: "Explore Piece",
    ctaLink: "/shop",
    image: "",
    bgGradient: "from-[#FFF5F5] via-[#FDF2F4] to-[#FDE8EC]",
    order: 0,
  });

  const gradientOptions = [
    { label: "Rose Dust", val: "from-[#FFF5F5] via-[#FDF2F4] to-[#FDE8EC]" },
    { label: "Sky Atelier", val: "from-[#F0F4FF] via-[#F5F8FF] to-[#E8EFFF]" },
    { label: "Champagne Silk", val: "from-[#FBF8F2] via-[#F6F2EA] to-[#ECE6D8]" },
    { label: "Obsidian Slate", val: "from-[#F2F3F7] via-[#E8EAF0] to-[#DFE2EB]" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish hero slide.");

      setOpen(false);
      setForm({
        title: "",
        subtitle: "",
        badge: "Radha Exclusive",
        tagline: "Starting at ₹4,999",
        ctaText: "Explore Piece",
        ctaLink: "/shop",
        image: "",
        bgGradient: "from-[#FFF5F5] via-[#FDF2F4] to-[#FDE8EC]",
        order: 0,
      });

      if (onCreated) onCreated(data.banner);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Full width on mobile, inline on desktop */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#3B7BF6]" />
        <span>Add Slider Banner</span>
      </button>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-5 sm:p-8 border border-[#E8EBF2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#F4F5F9] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#3B7BF6]" />
                </span>
                <div>
                  <h3 className="font-serif font-black text-sm sm:text-base uppercase tracking-tight text-[#0C0D11]">
                    New Hero Carousel Slide
                  </h3>
                  <p className="text-[11px] text-[#8E92A2] font-mono">
                    Flipkart-style peek slider component
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Slide Headline */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. FESTIVE SILK COLLECTION"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] focus:border-[#0C0D11] outline-none font-medium"
                />
              </div>

              {/* Subtitle / Subheading */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                  Secondary Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted tissue silk and gold zardozi"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] focus:border-[#0C0D11] outline-none"
                />
              </div>

              {/* Badging and Pricing Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                    Pill Badge
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. Radha Exclusive"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                    Price Tagline
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="e.g. Flat 30% Off"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Garment Image URL & Preview */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                  Garment Visual URL *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E92A2]" />
                    <input
                      type="url"
                      required
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... or CDN URL"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                    />
                  </div>
                  {form.image && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#F4F5F9] border border-[#E8EBF2] shrink-0">
                      <Image
                        src={form.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Call-to-Action Link & Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Order Piece"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                    Target Destination
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E92A2]" />
                    <input
                      type="text"
                      value={form.ctaLink}
                      onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                      placeholder="/shop?category=women"
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Background Color Gradient Selector */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                  Atelier Color Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {gradientOptions.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm({ ...form, bgGradient: opt.val })}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                        form.bgGradient === opt.val
                          ? "border-[#0C0D11] bg-white font-bold shadow-2xs"
                          : "border-[#E8EBF2] bg-[#F8F9FC] text-[#8E92A2]"
                      }`}
                    >
                      <span className="text-[11px]">{opt.label}</span>
                      <div className={`w-4 h-4 rounded-full border border-black/10 bg-gradient-to-r ${opt.val}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish Hero Slide"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}