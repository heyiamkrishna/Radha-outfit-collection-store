"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  Percent,
  UploadCloud,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AddProductModal({ onCreated }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [createdProduct, setCreatedProduct] = useState(null);
  const fileInputRef = useRef(null);

  const initialForm = {
    name: "",
    category: "women",
    subcategory: "Bridal Couture",
    price: "",
    salePrice: "",
    image1: "",
    image2: "",
    stockCount: 15,
    sizes: ["S", "M", "L", "XL"],
    description: "",
  };

  const [form, setForm] = useState(initialForm);
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock both html and body to eliminate background scrolling on mobile
  useEffect(() => {
    if (open || createdProduct) {
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
  }, [open, createdProduct]);

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");

      setForm((prev) => ({
        ...prev,
        image1: prev.image1 ? prev.image1 : data.url,
        image2: prev.image1 && !prev.image2 ? data.url : prev.image2,
      }));
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const original = Number(form.price) || 0;
  const sale = Number(form.salePrice) || original;
  const discountPercent =
    original > sale && original > 0 ? Math.round(((original - sale) / original) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const images = [form.image1.trim(), form.image2.trim()].filter(Boolean);

      if (images.length === 0) {
        throw new Error("Please upload or enter at least one garment image.");
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to catalog garment.");

      const newProduct = data.product || data;

      setOpen(false);
      setCreatedProduct({
        ...newProduct,
        displayImage: images[0],
        price: sale,
      });

      setForm(initialForm);
      if (onCreated) onCreated(newProduct);
    } catch (err) {
      setError(err.message);
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
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#1E2028] transition-all shadow-xs active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4 text-emerald-400" />
        <span>Add New Garment</span>
      </button>

      {/* ── 1. ISOLATED PORTAL MODAL ── */}
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

            {/* Modal Dialog Card */}
            <div
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[28px] sm:rounded-[32px] border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden"
              style={{
                maxHeight: "88dvh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Drag bar indicator on mobile */}
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

              {/* Sticky Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-black/[0.06] bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-black text-sm sm:text-base uppercase tracking-tight text-[#0C0D11] truncate">
                      Catalog New Garment
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-[#8E92A2] font-mono truncate">
                      Men, Women, or Kids rails allocation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 sm:p-2 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 sm:space-y-4 text-xs"
                style={{ overscrollBehavior: "contain" }}
              >
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-mono font-medium border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px] sm:text-[10.5px]">
                    Garment Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Zardozi Embroidered Silk Sherwani"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-medium transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px] sm:text-[10.5px]">
                      Target Rail (Category) *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none font-mono text-xs font-bold uppercase transition-all"
                    >
                      <option value="women">Women&apos;s Collection</option>
                      <option value="men">Men&apos;s Wardrobe</option>
                      <option value="kids">Kids&apos; Curations</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px] sm:text-[10.5px]">
                      Subcategory / Badge
                    </label>
                    <input
                      type="text"
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      placeholder="e.g. Bridal Occasion, Velvet Tux"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs font-medium transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Pricing Structure */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px] sm:text-[10.5px]">
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="12999"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none font-mono font-bold text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px] sm:text-[10.5px]">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                      placeholder="9999"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none font-mono font-bold text-xs text-emerald-700 transition-all"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 h-[42px] rounded-xl bg-[#FAFAFC] border border-black/[0.06] px-2.5 flex items-center justify-center">
                    {discountPercent > 0 ? (
                      <span className="text-[10.5px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <Percent className="w-3 h-3" /> {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-mono text-[#8E92A2] uppercase">Standard MRP</span>
                    )}
                  </div>
                </div>

                {/* Upload Image Section */}
                <div className="space-y-2.5 p-3 sm:p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block text-[9.5px] sm:text-[10.5px]">
                      Garment Visual Assets *
                    </label>
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#8E92A2]">ImageKit CDN</span>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 sm:py-4 px-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#0C0D11] bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-[#3B7BF6]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-mono text-xs">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-[#3B7BF6]" />
                        <span className="text-xs font-bold text-[#0C0D11]">Upload Garment Photo</span>
                        <span className="text-[9.5px] text-[#8E92A2] font-mono">JPG, PNG, WEBP &le; 5MB</span>
                      </>
                    )}
                  </div>

                  {/* Image Inputs */}
                  <div className="space-y-2 pt-0.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        required
                        value={form.image1}
                        onChange={(e) => setForm({ ...form, image1: e.target.value })}
                        placeholder="Primary image URL *"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/[0.08] focus:border-[#0C0D11] outline-none font-mono text-[10.5px]"
                      />
                      {form.image1 && (
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white border border-black/[0.08] shrink-0 group">
                          <Image src={form.image1} alt="Primary" fill className="object-cover" sizes="40px" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image1: "" })}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={form.image2}
                        onChange={(e) => setForm({ ...form, image2: e.target.value })}
                        placeholder="Detail angle URL (optional)"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/[0.08] focus:border-[#0C0D11] outline-none font-mono text-[10.5px]"
                      />
                      {form.image2 && (
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white border border-black/[0.08] shrink-0 group">
                          <Image src={form.image2} alt="Secondary" fill className="object-cover" sizes="40px" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image2: "" })}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sizing Chips */}
                <div>
                  <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5 text-[9.5px] sm:text-[10.5px]">
                    Available Silhouettes Sizing
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((size) => {
                      const active = form.sizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border font-mono text-[9.5px] sm:text-[10px] font-bold uppercase transition-all cursor-pointer active:scale-90 ${
                            active
                              ? "bg-[#0C0D11] text-white border-[#0C0D11]"
                              : "bg-[#FAFAFC] text-[#8E92A2] border-black/[0.07] hover:bg-neutral-100"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sticky / Pinned CTA */}
                <div className="pt-2 sticky bottom-0 bg-white pb-1">
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white font-mono font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      "Publish Garment to Catalog"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── 2. SUCCESS CONFIRMATION MODAL ── */}
      {mounted &&
        createdProduct &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-4 overflow-hidden"
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
              onClick={() => setCreatedProduct(null)}
              className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md"
              style={{ position: "absolute", inset: 0 }}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 border border-black/[0.08] shadow-2xl space-y-4 text-center my-auto">
              <button
                type="button"
                onClick={() => setCreatedProduct(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                  Atelier Certified
                </span>
                <h3 className="font-serif font-black text-base sm:text-lg uppercase tracking-tight text-[#0C0D11]">
                  Garment Published!
                </h3>
                <p className="text-[11px] text-[#8E92A2]">
                  Indexed into live collection catalog.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-black/[0.05] flex items-center gap-3 text-left">
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-white border border-black/[0.05] shrink-0">
                  <Image
                    src={createdProduct.displayImage || createdProduct.images?.[0] || "/placeholder.jpg"}
                    alt={createdProduct.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase bg-blue-50 text-[#3B7BF6]">
                    {createdProduct.category}
                  </span>
                  <h4 className="text-xs font-serif font-bold uppercase text-[#0C0D11] truncate">
                    {createdProduct.name}
                  </h4>
                  <p className="text-xs font-mono font-black text-[#0C0D11]">
                    ₹{Number(createdProduct.price || createdProduct.salePrice || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedProduct(null);
                    setOpen(true);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] border border-black/[0.08] text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  Add More
                </button>
                <Link
                  href={`/product/${createdProduct.slug || createdProduct._id}`}
                  target="_blank"
                  className="w-full py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}