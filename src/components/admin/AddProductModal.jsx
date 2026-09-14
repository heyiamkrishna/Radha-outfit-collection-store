"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Loader2,
  Plus,
  UploadCloud,
  Trash2,
  Sparkles,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  Check,
  ExternalLink,
} from "lucide-react";

const COUTURE_TAGS = [
  "100% Pure Raw Silk",
  "Handcrafted Zari & Dabka Embroidery",
  "Tailored Contemporary Silhouette",
  "Artisanal Hand-Dyed Fabric",
  "Intricate Gota Patti Work",
  "Dry Clean Only",
  "Includes Matching Dupatta & Trousers",
  "Free Custom Waist & Length Sizing",
  "Lightweight Breathable Chiffon Base",
  "Handcrafted in Delhi Atelier",
];

const PRESETS = {
  fabric: [
    "Pure Cotton",
    "Raw Silk",
    "Chanderi Silk",
    "Linen Blend",
    "Georgette",
    "Velvet",
    "Mulmul",
  ],
  sleeve: [
    "Full Sleeve",
    "Half Sleeve",
    "Sleeveless",
    "3/4th Sleeve",
    "Roll-up Sleeve",
  ],
  pattern: [
    "Solid",
    "Embroidered",
    "Floral Print",
    "Self Design",
    "Woven Zari",
    "Striped",
  ],
  fit: [
    "Slim",
    "Regular",
    "Tailored",
    "Relaxed Atelier Fit",
    "Oversized",
  ],
  color: [
    "Purple",
    "Ivory White",
    "Royal Black",
    "Deep Wine",
    "Emerald Green",
    "Blush Pink",
  ],
};

const ATELIER_SIZES = [
  "38 (S)",
  "39 (M)",
  "40 (L)",
  "42 (XL)",
  "44 (XXL)",
  "Free Size",
];

export default function AddProductModal({ onCreated }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ── Success State & Saved Product Dossier ──
  const [successProduct, setSuccessProduct] = useState(null);

  // Toggle for Multi-Asset Gallery vs Single Upload
  const [multiImageMode, setMultiImageMode] = useState(false);

  const fileInputRef = useRef(null);

  const initialForm = {
    name: "",
    slug: "",
    category: "women",
    price: "",
    salePrice: "",
    stockCount: "10",
    sizes: ["38 (S)", "39 (M)", "40 (L)", "42 (XL)"],
    images: [],
    badge: "Exclusive",
    description: "",

    // Technical Dossier & Highlights
    fabric: "Pure Cotton",
    sleeve: "Full Sleeve",
    pattern: "Solid",
    color: "Purple",
    fit: "Slim",
    packOf: "1",
    brand: "Radha Outfit Collection",
    styleCode: "",
    collar: "Spread Collar",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict scroll lock when any modal overlay is active
  useEffect(() => {
    if (open || descriptionModalOpen || successProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, descriptionModalOpen, successProduct]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const selectedFiles = multiImageMode ? files : [files[0]];

    try {
      setUploading(true);
      setError("");

      const uploadedUrls = [];

      for (const file of selectedFiles) {
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 8MB limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "CDN Upload failure");
        uploadedUrls.push(data.url);
      }

      setForm((prev) => ({
        ...prev,
        images: multiImageMode
          ? [...prev.images, ...uploadedUrls]
          : uploadedUrls,
      }));
    } catch (err) {
      setError(err.message || "Failed to upload garment photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleToggleSize = (size) => {
    setForm((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

  const appendTagToDescription = (tagText) => {
    setForm((prev) => {
      const currentDesc = prev.description ? prev.description.trim() : "";
      if (currentDesc.includes(tagText)) return prev;
      const separator = currentDesc.length > 0 ? "\n• " : "• ";
      return {
        ...prev,
        description: `${currentDesc}${separator}${tagText}`,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.images.length === 0) {
      setError("Please upload at least one garment image.");
      setLoading(false);
      return;
    }

    if (form.sizes.length === 0) {
      setError("Please select at least one available size.");
      setLoading(false);
      return;
    }

    try {
      const computedSlug =
        form.slug.trim() ||
        form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const generatedVariants = form.sizes.map((sz, idx) => ({
        variantId: `var-${Date.now().toString(36)}-${idx}`,
        colorName: form.color || "Standard",
        colorHex: "#0C0D11",
        size: sz,
        sku: `${computedSlug.slice(0, 8).toUpperCase()}-${sz.replace(/[^a-zA-Z0-9]/g, "")}-${idx}`,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : Number(form.price),
        stock: Math.max(1, Math.floor(Number(form.stockCount) / form.sizes.length)),
        images: form.images,
      }));

      const payload = {
        name: form.name.trim(),
        slug: computedSlug,
        category: form.category,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : Number(form.price),
        stockCount: Number(form.stockCount) || 0,
        sizes: form.sizes,
        images: form.images,
        image: form.images[0],
        badge: form.badge.trim(),
        description: form.description.trim(),

        // Technical Specifications
        fabric: form.fabric.trim(),
        material: form.fabric.trim(),
        sleeve: form.sleeve.trim(),
        pattern: form.pattern.trim(),
        color: form.color.trim(),
        fit: form.fit.trim(),
        packOf: Number(form.packOf) || 1,
        brand: form.brand.trim() || "Radha Outfit Collection",
        styleCode:
          form.styleCode.trim() || `ROC-${computedSlug.slice(0, 10).toUpperCase()}`,
        collar: form.collar.trim(),
        variants: generatedVariants,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to catalog product.");

      const newlyCreated = data.product || payload;

      // Close create form and show the celebration beauty modal
      setOpen(false);
      setSuccessProduct(newlyCreated);
      setForm(initialForm);

      if (onCreated) onCreated(newlyCreated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForAnother = () => {
    setSuccessProduct(null);
    setForm(initialForm);
    setOpen(true);
  };

  return (
    <>
      {/* ── Modal Launch Button ── */}
      <button
        type="button"
        onClick={() => {
          setSuccessProduct(null);
          setOpen(true);
        }}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-xs active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-blue-400" />
        <span>Add Garment</span>
      </button>

      {/* ── 1. MAIN CATALOG STUDIO MODAL ── */}
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
              className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md transition-opacity"
              aria-hidden="true"
            />

            {/* Modal Window */}
            <div
              className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              style={{ maxHeight: "92dvh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/[0.06] bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0 border border-blue-100">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6] block">
                      Atelier Catalog Studio
                    </span>
                    <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-sm sm:text-base">
                      Catalog New Silhouette
                    </h3>
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

              {/* Form Body */}
              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto px-5 py-4 sm:p-6 space-y-4 text-xs font-mono"
                style={{ overscrollBehavior: "contain" }}
              >
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-mono font-medium border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Garment Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9.5px]">
                      Garment Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Pure Cotton Casual Shirt"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9.5px]">
                      Department / Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-bold uppercase"
                    >
                      <option value="women">Women&apos;s Couture</option>
                      <option value="men">Men&apos;s Collection</option>
                      <option value="kids">Kids & Festives</option>
                      <option value="accessories">Atelier Accessories</option>
                    </select>
                  </div>
                </div>

                {/* Valuation & Stock */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                      Original Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="3999"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.salePrice}
                      onChange={(e) =>
                        setForm({ ...form, salePrice: e.target.value })
                      }
                      placeholder="2499"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                      Stock Reserve *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stockCount}
                      onChange={(e) =>
                        setForm({ ...form, stockCount: e.target.value })
                      }
                      placeholder="10"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-bold"
                    />
                  </div>
                </div>

                {/* ── TECHNICAL SPECIFICATIONS & HIGHLIGHTS ── */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-3.5">
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-2">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B7BF6]" />
                      <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#0C0D11]">
                        Garment Highlights & Technical Specs
                      </span>
                    </div>
                    <span className="text-[8.5px] font-mono uppercase text-[#8E92A2]">
                      Storefront Specs Table
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* Fabric */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Fabric / Weave
                      </label>
                      <input
                        type="text"
                        list="fabric-options"
                        value={form.fabric}
                        onChange={(e) =>
                          setForm({ ...form, fabric: e.target.value })
                        }
                        placeholder="Pure Cotton"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                      <datalist id="fabric-options">
                        {PRESETS.fabric.map((f) => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                    </div>

                    {/* Sleeve */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Sleeve Type
                      </label>
                      <input
                        type="text"
                        list="sleeve-options"
                        value={form.sleeve}
                        onChange={(e) =>
                          setForm({ ...form, sleeve: e.target.value })
                        }
                        placeholder="Full Sleeve"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                      <datalist id="sleeve-options">
                        {PRESETS.sleeve.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>

                    {/* Pattern */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Pattern / Texture
                      </label>
                      <input
                        type="text"
                        list="pattern-options"
                        value={form.pattern}
                        onChange={(e) =>
                          setForm({ ...form, pattern: e.target.value })
                        }
                        placeholder="Solid"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                      <datalist id="pattern-options">
                        {PRESETS.pattern.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Primary Color
                      </label>
                      <input
                        type="text"
                        list="color-options"
                        value={form.color}
                        onChange={(e) =>
                          setForm({ ...form, color: e.target.value })
                        }
                        placeholder="Purple"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                      <datalist id="color-options">
                        {PRESETS.color.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    {/* Fit */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Silhouette Fit
                      </label>
                      <input
                        type="text"
                        list="fit-options"
                        value={form.fit}
                        onChange={(e) =>
                          setForm({ ...form, fit: e.target.value })
                        }
                        placeholder="Slim"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                      <datalist id="fit-options">
                        {PRESETS.fit.map((ft) => (
                          <option key={ft} value={ft} />
                        ))}
                      </datalist>
                    </div>

                    {/* Pack Of */}
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9px]">
                        Pack Of
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={form.packOf}
                        onChange={(e) =>
                          setForm({ ...form, packOf: e.target.value })
                        }
                        placeholder="1"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-black/[0.04]">
                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[8.5px]">
                        Brand / Label
                      </label>
                      <input
                        type="text"
                        value={form.brand}
                        onChange={(e) =>
                          setForm({ ...form, brand: e.target.value })
                        }
                        placeholder="Radha Outfit Collection"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-[11px] outline-none focus:border-[#0C0D11]"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[8.5px]">
                        Style Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.styleCode}
                        onChange={(e) =>
                          setForm({ ...form, styleCode: e.target.value })
                        }
                        placeholder="ROC-SLIM-COT"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-[11px] font-mono outline-none focus:border-[#0C0D11]"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[8.5px]">
                        Collar Architecture
                      </label>
                      <input
                        type="text"
                        value={form.collar}
                        onChange={(e) =>
                          setForm({ ...form, collar: e.target.value })
                        }
                        placeholder="Spread Collar"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-[11px] outline-none focus:border-[#0C0D11]"
                      />
                    </div>
                  </div>
                </div>

                {/* ── IMAGE SECTION WITH MULTI-IMAGE TOGGLE ── */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#3B7BF6]" />
                      <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#0C0D11]">
                        Visual Showcase Assets
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase text-[#8E92A2]">
                        {multiImageMode
                          ? "Multi-Asset Mode (>2 Img)"
                          : "Single Image Mode"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMultiImageMode(!multiImageMode);
                          if (multiImageMode && form.images.length > 1) {
                            setForm((prev) => ({
                              ...prev,
                              images: [prev.images[0]],
                            }));
                          }
                        }}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer p-0.5 ${
                          multiImageMode ? "bg-[#0C0D11]" : "bg-neutral-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            multiImageMode ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#0C0D11] bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={multiImageMode}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <div className="flex items-center gap-2 text-[#3B7BF6]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-mono text-xs">
                          Uploading photo asset(s)...
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-[#8E92A2]" />
                        <span className="text-xs font-bold text-[#0C0D11]">
                          {multiImageMode
                            ? "Click to select multiple photographs (Angles, Details)"
                            : "Click to snap or upload primary garment image"}
                        </span>
                        <span className="text-[9px] font-mono text-[#8E92A2]">
                          {multiImageMode
                            ? "Multi-file upload enabled"
                            : "Single primary photo mode"}
                        </span>
                      </>
                    )}
                  </div>

                  {form.images.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-mono uppercase text-[#8E92A2] block">
                        Uploaded Assets ({form.images.length})
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {form.images.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden border border-black/[0.08] group bg-white shadow-2xs"
                          >
                            <Image
                              src={imgUrl}
                              alt="Garment Preview"
                              fill
                              className="object-cover"
                            />
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-[#0C0D11]/90 text-white text-[7.5px] px-1 rounded uppercase font-bold">
                                Main
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizing Selection */}
                <div>
                  <label className="font-mono font-bold uppercase text-[#0C0D11] block mb-1 text-[9.5px]">
                    Available Atelier Sizes
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ATELIER_SIZES.map((sz) => {
                      const isSelected = form.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0C0D11] text-white shadow-2xs"
                              : "bg-[#FAFAFC] text-[#4A4D59] border border-black/[0.06] hover:bg-neutral-100"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description Studio Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-bold uppercase text-[#0C0D11] text-[9.5px]">
                      Garment Narrative & Styling Notes
                    </label>

                    <button
                      type="button"
                      onClick={() => setDescriptionModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase text-[#3B7BF6] bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Description Studio</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe fabric weave, hand-feel, and tailoring highlights..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs transition-all placeholder:text-neutral-400 font-sans"
                  />
                </div>

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
                      "Publish Garment into Live Catalog"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── 2. BEAUTY SUCCESS CELEBRATION POPUP WITH DISCOUNT % ── */}
      {mounted &&
        successProduct &&
        createPortal(
          (() => {
            const originalPrice = Number(successProduct.price || 0);
            const currentPrice = Number(
              successProduct.salePrice || successProduct.price || 0
            );
            const discountPercent =
              originalPrice > currentPrice
                ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                : 0;

            return (
              <div
                className="fixed inset-0 z-[100001] flex items-center justify-center p-4 overflow-hidden"
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
                  onClick={() => setSuccessProduct(null)}
                  className="absolute inset-0 bg-[#0C0D11]/80 backdrop-blur-lg transition-opacity"
                  aria-hidden="true"
                />

                {/* Glowing Ambient Halo */}
                <div className="pointer-events-none absolute w-80 h-80 bg-gradient-to-tr from-emerald-500/25 via-blue-500/20 to-transparent rounded-full blur-3xl" />

                {/* Modal Card */}
                <div className="relative z-10 w-full max-w-md bg-white rounded-[36px] border border-black/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.35)] p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
                  {/* Close Cross */}
                  <button
                    type="button"
                    onClick={() => setSuccessProduct(null)}
                    className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Animated Success Badge */}
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3 h-3 fill-black" />
                    </div>
                  </div>

                  {/* Congratulatory Text */}
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-600 block">
                      Couture Cataloged Successfully
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                      Master Silhouette Live
                    </h3>
                    <p className="text-xs font-mono text-[#8E92A2] max-w-xs mx-auto">
                      Your piece has been archived into the active Radha Atelier
                      vault and is immediately purchasable.
                    </p>
                  </div>

                  {/* Garment Snapshot Pill with Discount Tag */}
                  <div className="relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] text-left overflow-hidden">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-black/[0.04]">
                      <Image
                        src={
                          successProduct.images?.[0] ||
                          successProduct.image ||
                          "/placeholder.jpg"
                        }
                        alt={successProduct.name}
                        fill
                        className="object-cover"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[8px] font-bold shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-mono font-bold uppercase text-[#3B7BF6] truncate">
                          {successProduct.category || "Atelier"}
                        </span>
                        <span className="text-[8.5px] font-mono text-[#8E92A2]">
                          SKU: {successProduct.slug?.slice(0, 10).toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs font-serif font-bold uppercase text-[#0C0D11] truncate">
                        {successProduct.name}
                      </p>

                      {/* Pricing & Computed Savings */}
                      <div className="flex flex-wrap items-baseline gap-2 pt-0.5 font-mono">
                        <span className="text-sm font-black text-[#0C0D11]">
                          ₹{currentPrice.toLocaleString("en-IN")}
                        </span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-[10px] text-[#8E92A2] line-through">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {discountPercent}% OFF (Save ₹
                              {(originalPrice - currentPrice).toLocaleString("en-IN")})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <Link
                      href={`/product/${successProduct.slug || successProduct._id}`}
                      className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white font-mono font-bold uppercase tracking-wider text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>View Live Product Page</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleResetForAnother}
                      className="w-full py-3 rounded-full bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] font-mono font-bold uppercase tracking-wider text-xs transition-colors border border-black/[0.06] cursor-pointer active:scale-95"
                    >
                      Catalog Another Silhouette
                    </button>
                  </div>
                </div>
              </div>
            );
          })(),
          document.body
        )}

      {/* ── 3. DESCRIPTION ASSISTANT STUDIO MODAL ── */}
      {mounted &&
        descriptionModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-3.5 sm:p-4 overflow-hidden"
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
            <div
              onClick={() => setDescriptionModalOpen(false)}
              className="absolute inset-0 bg-[#0C0D11]/80 backdrop-blur-md"
              aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-lg bg-white rounded-[32px] sm:rounded-[36px] border border-black/[0.08] shadow-2xl p-5 sm:p-7 space-y-4 my-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider">
                      Couture Narrative Studio
                    </span>
                  </div>
                  <h4 className="font-serif font-black uppercase text-base text-[#0C0D11]">
                    Add Description Tags & Details
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setDescriptionModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tag Quick-Insert Panel */}
              <div className="space-y-2">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] block">
                  Click to Auto-Insert Specifications:
                </span>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1">
                  {COUTURE_TAGS.map((tagText) => {
                    const isAlreadyIncluded = form.description.includes(tagText);
                    return (
                      <button
                        key={tagText}
                        type="button"
                        onClick={() => appendTagToDescription(tagText)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono transition-all active:scale-95 cursor-pointer ${
                          isAlreadyIncluded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-[#FAFAFC] text-[#4A4D59] border border-black/[0.07] hover:bg-[#0C0D11] hover:text-white"
                        }`}
                      >
                        {isAlreadyIncluded ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        <span>{tagText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Narrative Editor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#8E92A2]">
                  <span>Live Product Copy</span>
                  <span>{form.description.length} characters</span>
                </div>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Review or custom edit your bullet points and narrative here..."
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-sans leading-relaxed"
                />
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, description: "" })}
                  className="py-2.5 rounded-full bg-[#FAFAFC] hover:bg-rose-50 text-neutral-600 hover:text-rose-600 text-xs font-mono font-bold uppercase transition-colors"
                >
                  Clear Description
                </button>

                <button
                  type="button"
                  onClick={() => setDescriptionModalOpen(false)}
                  className="py-2.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  Apply to Garment
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}