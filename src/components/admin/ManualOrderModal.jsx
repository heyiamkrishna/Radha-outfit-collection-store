"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Loader2,
  UploadCloud,
  CheckCircle2,
  Receipt,
  User,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
  Trash2,
  Printer,
  ShieldCheck,
  Calendar,
  CreditCard,
  Package,
} from "lucide-react";

export default function ManualOrderModal({ onCreated }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const fileInputRef = useRef(null);
  const voucherRef = useRef(null);

  const initialForm = {
    productName: "",
    price: "",
    image: "",
    description: "",
    buyerName: "",
    buyerPhone: "",
    buyerCity: "",
    paymentMethod: "cash",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict scroll lock when form or luxury success card is open
  useEffect(() => {
    if (open || successOrder) {
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
  }, [open, successOrder]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds the 5MB limit.");
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
      if (!res.ok) throw new Error(data.error || "CDN Upload failure");
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err.message || "Failed to upload garment photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/manual-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to catalog order.");

      setSuccessOrder(data.order);
      setForm(initialForm);
      setOpen(false);
      if (onCreated) onCreated(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const numPrice = Number(form.price) || 0;

  return (
    <>
      {/* ── Trigger Pill ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] text-xs font-mono font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5 text-emerald-600 transition-transform group-hover:scale-110" />
        <span>Manual Sale</span>
      </button>

      {/* ── 1. FORM DIALOG MODAL ── */}
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
            {/* Ambient Backdrop */}
            <div
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md transition-opacity"
              style={{ position: "absolute", inset: 0 }}
              aria-hidden="true"
            />

            {/* Modal Card Structure */}
            <div
              className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              style={{ maxHeight: "90dvh" }}
            >
              {/* Mobile grab handle */}
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Counter POS
                      </span>
                    </div>
                    <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-sm sm:text-base truncate pt-0.5">
                      Record Manual Purchase
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

                {/* Section A: Product & Valuation */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E92A2] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Garment & Valuation
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px]">
                        Garment / Piece Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.productName}
                        onChange={(e) =>
                          setForm({ ...form, productName: e.target.value })
                        }
                        placeholder="e.g. Royal Raw Silk Sherwani"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] focus:border-[#0C0D11] outline-none text-xs font-medium shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px]">
                        Settlement (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E92A2]" />
                        <input
                          type="number"
                          required
                          min="1"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                          placeholder="4500"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-black/[0.08] focus:border-[#0C0D11] outline-none font-mono font-bold text-xs shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {numPrice > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] text-[10px] font-mono">
                      <span className="text-[#8E92A2]">Total Settlement Due</span>
                      <span className="font-black text-emerald-700 text-xs">
                        ₹{numPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Section B: Photo of Product (Optional) */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-[9.5px] font-mono font-bold uppercase">
                    <span className="text-[#0C0D11]">Garment Visual</span>
                    <span className="text-[#8E92A2]">Optional CDN Asset</span>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#0C0D11] bg-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
                        <span className="font-mono text-xs">Uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-[#8E92A2]" />
                        <span className="text-xs font-bold text-[#0C0D11]">
                          Click to snap or upload image
                        </span>
                        <span className="text-[9.5px] font-mono text-[#8E92A2]">
                          PNG / JPG
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      placeholder="Or enter direct image CDN URL"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-[10.5px] font-mono outline-none focus:border-[#0C0D11]"
                    />
                    {form.image && (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-black/[0.08] shrink-0 group">
                        <Image
                          src={form.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: "" })}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section C: Patron Information (Optional) */}
                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-2.5">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#8E92A2] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#3B7BF6]" />
                    Patron Profile (Optional)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9px]">
                        Buyer Name
                      </label>
                      <input
                        type="text"
                        value={form.buyerName}
                        onChange={(e) =>
                          setForm({ ...form, buyerName: e.target.value })
                        }
                        placeholder="Guest Patron"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                    </div>
                    <div>
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9px]">
                        Phone / Contact
                      </label>
                      <input
                        type="tel"
                        value={form.buyerPhone}
                        onChange={(e) =>
                          setForm({ ...form, buyerPhone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-mono outline-none focus:border-[#0C0D11]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9px]">
                        Station / City
                      </label>
                      <input
                        type="text"
                        value={form.buyerCity}
                        onChange={(e) =>
                          setForm({ ...form, buyerCity: e.target.value })
                        }
                        placeholder="Atelier Counter"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs outline-none focus:border-[#0C0D11]"
                      />
                    </div>

                    <div>
                      <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9px]">
                        Settlement Mode
                      </label>
                      <select
                        value={form.paymentMethod}
                        onChange={(e) =>
                          setForm({ ...form, paymentMethod: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-mono font-bold uppercase outline-none focus:border-[#0C0D11]"
                      >
                        <option value="cash">Direct Cash</option>
                        <option value="upi">UPI / Scanner</option>
                        <option value="card">Card POS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section D: Description / Notes */}
                <div>
                  <label className="font-mono font-bold uppercase tracking-wider text-[#0C0D11] block mb-1 text-[9.5px]">
                    Bespoke Notes / Alterations (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g. Sizing customized at waist; cash handed over at boutique desk."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFC] border border-black/[0.08] focus:bg-white focus:border-[#0C0D11] outline-none text-xs transition-all placeholder:text-neutral-400"
                  />
                </div>

                {/* Action CTA */}
                <div className="pt-2 sticky bottom-0 bg-white pb-1">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white font-mono font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      "Record Transaction into Ledger"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── 2. HIGH-FASHION ATELIER RECEIPT VOUCHER POPUP ── */}
      {mounted &&
        successOrder &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto"
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
            {/* Dark blur overlay */}
            <div
              onClick={() => setSuccessOrder(null)}
              className="absolute inset-0 bg-[#0C0D11]/80 backdrop-blur-md"
              style={{ position: "absolute", inset: 0 }}
              aria-hidden="true"
            />

            {/* Haute Couture Serrated Card */}
            <div
              ref={voucherRef}
              className="relative z-10 w-full max-w-[370px] xs:max-w-sm sm:max-w-md bg-white rounded-[32px] sm:rounded-[38px] border border-black/[0.08] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
            >
              {/* Top Accent Strip */}
              <div className="bg-[#0C0D11] text-white px-6 py-4 text-center space-y-1 relative">
                <button
                  type="button"
                  onClick={() => setSuccessOrder(null)}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[8px] font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Atelier Certified Sale</span>
                </div>

                <h3 className="font-serif font-black uppercase text-base sm:text-lg tracking-tight text-white">
                  Radha Outfit Collection
                </h3>
                <p className="text-[9.5px] font-mono text-white/60 tracking-wider">
                  OFFICIAL TRANSACTION DOSSIER
                </p>
              </div>

              {/* Serrated Cut Notch Graphic */}
              <div className="relative flex items-center justify-between px-[-10px] bg-white">
                <div className="w-5 h-5 rounded-full bg-[#0C0D11] -ml-2.5 -mt-2.5 shadow-inner" />
                <div className="flex-1 border-b-2 border-dashed border-neutral-200 mx-2" />
                <div className="w-5 h-5 rounded-full bg-[#0C0D11] -mr-2.5 -mt-2.5 shadow-inner" />
              </div>

              {/* Main Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Reference & Verified Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8E92A2] block">
                      Transaction Ref
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-[#0C0D11]">
                      {successOrder.orderNumber}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Settled
                  </span>
                </div>

                {/* Garment Showcase */}
                <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-black/[0.05] flex items-center gap-3">
                  <div className="relative w-12 h-15 rounded-xl overflow-hidden bg-white border border-black/[0.06] shrink-0">
                    <Image
                      src={successOrder.items?.[0]?.image || "/placeholder.jpg"}
                      alt={successOrder.items?.[0]?.name || "Garment"}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[8px] font-mono font-bold uppercase text-[#3B7BF6] bg-blue-50 px-1.5 py-0.5 rounded">
                      Boutique Piece
                    </span>
                    <h4 className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate pt-0.5">
                      {successOrder.items?.[0]?.name}
                    </h4>
                    <p className="text-[10px] font-mono text-[#8E92A2]">
                      Qty: 1 • Fit: Free Size
                    </p>
                  </div>
                </div>

                {/* Patron & Payment Breakdown */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-[10px] text-[#8E92A2] uppercase">
                      Client
                    </span>
                    <span className="font-bold text-[#0C0D11] truncate max-w-[170px]">
                      {successOrder.shippingAddress?.fullName || "Walk-in Patron"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-[10px] text-[#8E92A2] uppercase">
                      Mode
                    </span>
                    <span className="font-bold uppercase text-[#0C0D11]">
                      {successOrder.paymentMethod} Counter POS
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-black/[0.04]">
                    <span className="text-[10px] text-[#8E92A2] uppercase">
                      Timestamp
                    </span>
                    <span className="text-[10.5px] text-[#4A4D59]">
                      {new Date(successOrder.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-serif font-black uppercase text-[#0C0D11]">
                      Grand Total
                    </span>
                    <span className="font-mono font-black text-base sm:text-lg text-[#0C0D11]">
                      ₹{Number(successOrder.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Barcode Strip Graphic */}
                <div className="pt-2 text-center">
                  <div className="h-6 w-full max-w-[200px] mx-auto opacity-70 bg-[repeating-linear-gradient(90deg,#0C0D11_0px,#0C0D11_2px,transparent_2px,transparent_5px,#0C0D11_5px,#0C0D11_8px,transparent_8px,transparent_11px)]" />
                  <span className="text-[8px] font-mono tracking-widest text-[#8E92A2] block mt-1">
                    *{successOrder.orderNumber}*
                  </span>
                </div>

                {/* Bottom Action Ribbons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrintVoucher}
                    className="py-2.5 sm:py-3 rounded-full bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] border border-black/[0.07] text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>

                  <Link
                    href={`/account/orders/${successOrder.orderNumber}/invoice`}
                    target="_blank"
                    className="py-2.5 sm:py-3 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95 text-center cursor-pointer"
                  >
                    <span>Invoice</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}