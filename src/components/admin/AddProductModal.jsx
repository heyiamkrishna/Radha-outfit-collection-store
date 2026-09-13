"use client";

import { useState, useEffect, useRef } from "react";
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
  ArrowRight,
} from "lucide-react";

export default function AddProductModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [createdProduct, setCreatedProduct] = useState(null); // Success popup state
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
    if (open || createdProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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
        throw new Error("Please provide or upload at least one garment image.");
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

      // Close the creation modal and trigger the luxury success card
      setOpen(false);
      setCreatedProduct({
        ...newProduct,
        displayImage: images[0],
        price: sale,
      });

      // Reset form
      setForm(initialForm);

      if (onCreated) onCreated(newProduct);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setCreatedProduct(null);
  };

  const handleCatalogAnother = () => {
    setCreatedProduct(null);
    setOpen(true);
  };

  return (
    <>
      {/* Modal Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-widest hover:bg-[#3B7BF6] transition-all shadow-md active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add New Garment
      </button>

      {/* ── 1. CREATION FORM MODAL ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-[36px] p-6 sm:p-9 border border-[#E8EBF2] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#F4F5F9] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#3B7BF6]" />
                </span>
                <div>
                  <h3 className="font-serif font-black text-base uppercase tracking-tight text-[#0C0D11]">
                    Catalog New Garment
                  </h3>
                  <p className="text-[11px] text-[#8E92A2] font-mono">
                    Direct assignment to Men, Women, or Kids rails
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                  Garment Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Zardozi Embroidered Silk Sherwani"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] focus:border-[#0C0D11] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                    Target Rail (Category) *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] focus:border-[#0C0D11] outline-none font-bold uppercase"
                  >
                    <option value="men">Men&apos;s Wardrobe</option>
                    <option value="women">Women&apos;s Collection</option>
                    <option value="kids">Kids&apos; Curations</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                    Subcategory / Badge
                  </label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    placeholder="e.g. Festive Occasion, Velvet Tux"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                    MRP Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="12999"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="9999"
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono font-bold text-emerald-600"
                  />
                </div>

                <div className="h-[46px] rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] px-3 flex items-center justify-center text-center">
                  {discountPercent > 0 ? (
                    <span className="text-[11px] font-mono font-black text-emerald-600 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#8E92A2]">Standard Price</span>
                  )}
                </div>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-3 p-4 rounded-3xl bg-[#FAFAFC] border border-[#E8EBF2]">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-[#0C0D11] block">
                    Garment Visual Assets *
                  </label>
                  <span className="text-[10px] font-mono text-[#8E92A2]">Upload or paste URLs</span>
                </div>

                {/* Upload Button Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0C0D11] bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-[#F8F9FC]"
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
                      <span className="font-mono text-xs font-bold">Uploading to CDN...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 text-[#3B7BF6]" />
                      <span className="text-xs font-bold text-[#0C0D11]">
                        Click to upload garment photo
                      </span>
                      <span className="text-[10px] text-[#8E92A2]">PNG, JPG, WEBP up to 5MB</span>
                    </>
                  )}
                </div>

                {/* Image URLs & Thumbnails */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      value={form.image1}
                      onChange={(e) => setForm({ ...form, image1: e.target.value })}
                      placeholder="Primary Angle URL *"
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                    />
                    {form.image1 && (
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#E8EBF2] shrink-0 group">
                        <Image src={form.image1} alt="Preview 1" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image1: "" })}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={form.image2}
                      onChange={(e) => setForm({ ...form, image2: e.target.value })}
                      placeholder="Detail / Back Angle URL (Optional)"
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                    />
                    {form.image2 && (
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#E8EBF2] shrink-0 group">
                        <Image src={form.image2} alt="Preview 2" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image2: "" })}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1.5">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const active = form.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-xl border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          active
                            ? "bg-[#0C0D11] text-white border-[#0C0D11]"
                            : "bg-[#F4F5F9] text-[#8E92A2] border-[#E8EBF2]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="w-full py-4 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish Garment to Catalog"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. SUCCESS POPUP CARD ── */}
      {createdProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0D11]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white rounded-[36px] p-6 sm:p-8 border border-[#E8EBF2] shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseSuccessModal}
              className="absolute top-5 right-5 p-2 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Success Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600">
                Atelier Catalog Certified
              </span>
              <h3 className="font-serif font-black text-xl uppercase tracking-tight text-[#0C0D11]">
                Garment Published!
              </h3>
              <p className="text-xs text-[#8E92A2]">
                Piece successfully indexed into your live collection catalogue.
              </p>
            </div>

            {/* Garment Preview Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E8EBF2] flex items-center gap-3.5 text-left">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-white border border-[#E8EBF2] shrink-0">
                <Image
                  src={createdProduct.displayImage || createdProduct.images?.[0] || "/placeholder.jpg"}
                  alt={createdProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase bg-[#EBF1FD] text-[#3B7BF6]">
                  {createdProduct.category} Rail
                </span>
                <h4 className="text-xs font-black uppercase text-[#0C0D11] truncate">
                  {createdProduct.name}
                </h4>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-xs font-black text-[#0C0D11]">
                    ₹{Number(createdProduct.price || createdProduct.salePrice || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[9px] text-[#8E92A2] uppercase">
                    SKU: {(createdProduct.slug || "ROC").slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCatalogAnother}
                className="w-full py-3.5 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[#0C0D11] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add Another
              </button>

              <Link
                href={`/product/${createdProduct.slug || createdProduct._id}`}
                target="_blank"
                className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 text-center"
              >
                <span>View Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}