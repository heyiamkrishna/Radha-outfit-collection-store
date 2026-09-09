"use client";

import { useState } from "react";
import { Plus, X, Loader2, Sparkles, Image as ImageIcon, Percent } from "lucide-react";

export default function AddProductModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
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
  });

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // Live discount percentage preview
  const original = Number(form.price) || 0;
  const sale = Number(form.salePrice) || original;
  const discountPercent =
    original > sale && original > 0 ? Math.round(((original - sale) / original) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const images = [form.image1, form.image2].filter(Boolean);

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

      setOpen(false);
      setForm({
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
      });

      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-widest hover:bg-[#3B7BF6] transition-all shadow-md active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add New Garment
      </button>

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
              {/* Garment Title */}
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

              {/* Category & Rail Assignment */}
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

              {/* Pricing & Auto-Discount */}
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

              {/* Image URLs */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-[#0C0D11] block mb-1">
                  Garment High-Res Image URLs (ImageKit or CDN) *
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    required
                    value={form.image1}
                    onChange={(e) => setForm({ ...form, image1: e.target.value })}
                    placeholder="Primary Angle (https://ik.imagekit.io/...)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                  />
                  <input
                    type="url"
                    value={form.image2}
                    onChange={(e) => setForm({ ...form, image2: e.target.value })}
                    placeholder="Back or Detail Angle (Optional)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Sizes Selector */}
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
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
    </>
  );
}