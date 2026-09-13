"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  UploadCloud,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Eye,
} from "lucide-react";

export default function BannerManagerModal({ onCreated }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const initialForm = {
    title: "",
    subtitle: "",
    badge: "Exclusive Run",
    link: "/shop",
    image: "",
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict background scroll-locking
  useEffect(() => {
    if (open) {
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
  }, [open]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Banner file exceeds 5MB limit.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload banner image.");

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image.trim()) {
      setError("Please upload or enter a hero banner image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create hero banner.");

      setForm(initialForm);
      setOpen(false);
      if (onCreated) onCreated(data.banner || data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-white border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] text-xs font-mono font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
      >
        <Sliders className="w-3.5 h-3.5 text-amber-500" />
        <span>Add Slider Banner</span>
      </button>

      {/* ── ISOLATED PORTAL MODAL ── */}
      {mounted &&
        open &&
        createPortal(
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
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md"
              style={{ position: "absolute", inset: 0 }}
              aria-hidden="true"
            />

            {/* Centered Modal Card */}
            <div
              className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              style={{ maxHeight: "90dvh" }}
            >
              {/* Mobile grab bar */}
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-sm sm:text-base truncate">
                      Add Carousel Slide
                    </h3>
                    <p className="text-[10px] sm:text-[10.5px] text-[#8E92A2] font-mono truncate">
                      Publish promotional hero graphic to homepage
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer active:scale-90"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto px-5 py-4 sm:p-6 space-y-4 text-xs"
                style={{ overscrollBehavior: "contain" }}
              >
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-mono font-medium border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Banner Title */}
                <div>
                  <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[10px]">
                    Banner Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. The Royal Heritage Collection '26"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-medium transition-all"
                  />
                </div>

                {/* Subtitle & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[10px]">
                      Accent Badge
                    </label>
                    <input
                      type="text"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="e.g. Haute Couture Run"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[10px]">
                      Destination Link
                    </label>
                    <input
                      type="text"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      placeholder="/shop or /category/women"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none font-mono text-[11px] transition-all"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[10px]">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Handcrafted Zardozi silhouettes for grand nuptials."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-medium transition-all"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                    <span>Banner Visual Asset *</span>
                    <span className="text-[#8E92A2]">21:9 or 16:9 Landscape</span>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 px-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#0C0D11] bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <div className="flex items-center gap-2 text-[#3B7BF6]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-mono text-xs">Uploading asset...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-bold text-[#0C0D11]">
                          Click to upload high-res banner
                        </span>
                        <span className="text-[9px] text-[#8E92A2] font-mono">
                          PNG, JPG, WEBP (min 1600x800 recommended)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Image URL fallback */}
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Or enter direct image CDN URL"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-[11px] font-mono outline-none focus:border-[#0C0D11]"
                  />

                  {/* Live Banner Aspect Ratio Preview */}
                  {form.image && (
                    <div className="relative aspect-[2.4/1] w-full rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.08] shadow-2xs mt-2">
                      <Image
                        src={form.image}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 500px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col justify-end p-3 text-white">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-300">
                          {form.badge || "FEATURED"}
                        </span>
                        <p className="font-serif font-black text-xs uppercase truncate">
                          {form.title || "Live Slide Headline Preview"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Checkbox Toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-black/[0.2] text-[#0C0D11] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-[#0C0D11] uppercase tracking-wider text-[10.5px]">
                    Display Immediately on Live Homepage
                  </span>
                </label>

                {/* Submit Action */}
                <div className="pt-2 sticky bottom-0 bg-white pb-1">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white font-mono font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      "Publish Carousel Slide"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}