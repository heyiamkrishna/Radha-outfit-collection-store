"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Banknote,
  Lock,
  Edit3,
  Check,
  MapPin,
  Phone,
  Sparkles,
  ArrowUpRight,
  Package,
  Layers,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [hasProfileData, setHasProfileData] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    addressLine2: "",
    city: "",
    state: "Delhi",
    postalCode: "",
    paymentMethod: "cod",
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 4999 ? 0 : 250;
  const grandTotal = subtotal + shipping;

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const u = data.user;
          const hasExistingAddress = Boolean(u.phone && u.addressLine1 && u.city && u.postalCode);
          setHasProfileData(hasExistingAddress);
          setIsEditingAddress(!hasExistingAddress);

          setForm((prev) => ({
            ...prev,
            fullName: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            street: u.addressLine1 || "",
            addressLine2: u.addressLine2 || "",
            city: u.city || "",
            state: u.state || "Delhi",
            postalCode: u.postalCode || "",
          }));
        } else {
          setIsEditingAddress(true);
        }
      })
      .catch(() => {
        setIsEditingAddress(true);
      })
      .finally(() => setFetchingProfile(false));
  }, []);

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    if (clean.length <= 10) {
      setForm((p) => ({ ...p, phone: clean }));
    }
  };

  const handlePostalChange = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    if (clean.length <= 6) {
      setForm((p) => ({ ...p, postalCode: clean }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    if (form.phone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!form.street || !form.city || !form.postalCode) {
      setError("Please furnish your complete delivery address.");
      return;
    }

    setLoading(true);

    try {
      if (saveToProfile) {
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: form.phone,
            addressLine1: form.street,
            addressLine2: form.addressLine2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
          }),
        }).catch(() => { });
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            street: `${form.street} ${form.addressLine2 || ""}`.trim(),
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
          },
          paymentMethod: form.paymentMethod.toLowerCase().trim(),
          totalAmount: grandTotal,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server communication anomaly. Please try again.");
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Order dispatch failed");

      setConfirmedOrder({
        orderNumber: resData.orderNumber || resData.order?.orderNumber,
        total: grandTotal,
        recipient: form.fullName,
        destination: `${form.city}, ${form.state}`,
        paymentMethod: form.paymentMethod,
      });

      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (item) => {
    if (item.image && typeof item.image === "string" && item.image.trim() !== "") {
      return item.image;
    }
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return null;
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] overflow-hidden">
      {/* Ambient Luxury Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-14 space-y-8">

        {/* Navigation Breadcrumb & Secure Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/cart"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
          >
            <span className="p-2 rounded-full bg-white/80 border border-[#E8EBF2] shadow-2xs group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <span>Return to Bag</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>256-Bit SSL Atelier Secured</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT: Client Dossier & Settlement Arrangement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative bg-white/75 backdrop-blur-2xl rounded-[36px] p-6 sm:p-10 border border-white/90 shadow-[0_12px_40px_rgba(12,13,17,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-8">

              {/* Header Title Block */}
              <div className="flex items-center justify-between pb-6 border-b border-[#F0F2F6]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#3B7BF6]">
                    <Sparkles className="w-3 h-3" /> Step 01 / 02
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif uppercase text-[#0C0D11]">
                    Dispatch Dossier
                  </h1>
                </div>

                {hasProfileData && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 hover:bg-white text-[#0C0D11] transition-all border border-[#E8EBF2] shadow-2xs cursor-pointer active:scale-95"
                  >
                    {isEditingAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Save View
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-[#3B7BF6]" /> Edit Details
                      </>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Saved Address Glass Capsule */}
              {!isEditingAddress && hasProfileData && (
                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#F8F9FC] to-[#F1F3F9] border border-white/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#3B7BF6] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Destination On Record
                    </span>
                    <span className="text-[11px] font-mono text-[#8E92A2] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#0C0D11]" /> +91 {form.phone}
                    </span>
                  </div>
                  <div className="text-xs text-[#0C0D11] space-y-1">
                    <p className="font-extrabold text-sm uppercase">{form.fullName}</p>
                    <p className="text-[#4A4D59] leading-relaxed">{form.street}</p>
                    {form.addressLine2 && <p className="text-[#8E92A2]">{form.addressLine2}</p>}
                    <p className="font-mono font-bold text-[#0C0D11] pt-1">
                      {form.city}, {form.state} — {form.postalCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmitOrder} className="space-y-6 text-xs">
                {isEditingAddress && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                          Client Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="e.g. Radhika Sharma"
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                            Mobile (+91) *
                          </label>
                          <span className="text-[10px] text-[#8E92A2] font-mono">
                            {form.phone.length}/10
                          </span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={handlePhoneChange}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                        Notification & Invoice Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                        Street Address & Suite / House *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                        placeholder="House / Villa No., Apartment, Boulevard"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                        Landmark / Sector (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.addressLine2}
                        onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                        placeholder="Near Metro Station, Sector 15"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">City *</label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="New Delhi"
                          className="w-full px-3.5 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">State *</label>
                        <input
                          type="text"
                          required
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          placeholder="Delhi"
                          className="w-full px-3.5 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">PIN Code *</label>
                        <input
                          type="text"
                          required
                          value={form.postalCode}
                          onChange={handlePostalChange}
                          placeholder="110001"
                          maxLength={6}
                          className="w-full px-3.5 py-3.5 rounded-2xl bg-white/70 border border-[#E8EBF2] focus:border-[#0C0D11] focus:bg-white outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="saveProfile"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0C0D11] focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="saveProfile" className="text-xs text-[#4A4D59] cursor-pointer">
                        Preserve as primary delivery destination for future orders
                      </label>
                    </div>
                  </div>
                )}

                {/* Settlement Arrangement Section */}
                <div className="space-y-3 pt-6 border-t border-[#F0F2F6]">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold uppercase tracking-wider text-[#0C0D11] text-[10px]">
                      Step 02 / Settlement Mode
                    </label>
                    <span className="text-[10px] font-mono text-[#8E92A2] uppercase">
                      Select Preference
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Cash on Delivery Card */}
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: "cod" })}
                      className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${form.paymentMethod === "cod"
                          ? "border-[#0C0D11] bg-white shadow-[0_8px_25px_rgba(12,13,17,0.06)] scale-[1.01]"
                          : "border-transparent bg-white/60 hover:bg-white/90 hover:border-[#E8EBF2]"
                        }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#0C0D11] text-white flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-xs uppercase tracking-wider text-[#0C0D11]">
                            Doorstep COD
                          </p>
                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E92A2] leading-relaxed">
                          Pay Cash or UPI upon personal delivery handover.
                        </p>
                      </div>
                    </div>

                    {/* Online Gateway Card */}
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: "online" })}
                      className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${form.paymentMethod === "online"
                          ? "border-[#0C0D11] bg-white shadow-[0_8px_25px_rgba(12,13,17,0.06)] scale-[1.01]"
                          : "border-transparent bg-white/60 hover:bg-white/90 hover:border-[#E8EBF2]"
                        }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#3B7BF6] text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-xs uppercase tracking-wider text-[#0C0D11]">
                            Online / UPI
                          </p>
                          <span className="text-[9px] font-mono font-bold uppercase text-[#3B7BF6] bg-blue-50 px-2 py-0.5 rounded-full">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E92A2] leading-relaxed">
                          Priority dispatch via UPI, Debit/Credit Card, or NetBanking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Order Commitment CTA */}
                <div className="pt-3 sm:pt-4 w-full">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 rounded-2xl sm:rounded-full bg-[#0C0D11] hover:bg-[#000000] active:bg-[#000000] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all duration-200 shadow-md sm:shadow-lg flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer active:scale-[0.98] select-none"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0 text-white/80" />
                    <span className="truncate">
                      {loading
                        ? "Verifying Atelier Dispatch..."
                        : `Place Confirmed Order · ₹${grandTotal.toLocaleString("en-IN")}`}
                    </span>
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* RIGHT: Restyled High-Fashion Garment Dossier Card */}
          <div className="lg:col-span-5 bg-white/80 backdrop-blur-2xl rounded-[36px] p-6 sm:p-8 border border-white/90 shadow-[0_16px_50px_rgba(12,13,17,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] space-y-6 sticky top-24">

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F6]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#0C0D11] text-white text-[11px] font-serif font-black flex items-center justify-center border border-white/20 shadow-xs">
                  R
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-[#0C0D11]">
                  Dossier Summary
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#3B7BF6] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {cart.length} {cart.length === 1 ? "Silhouette" : "Silhouettes"}
              </span>
            </div>

            {/* Garment Items List */}
            <div className="divide-y divide-[#F4F5F9] max-h-80 overflow-y-auto no-scrollbar pr-1 space-y-1">
              {cart.map((item, idx) => {
                const imageUrl = getItemImage(item);

                return (
                  <div
                    key={idx}
                    className="py-3.5 flex items-center gap-4 group transition-colors"
                  >
                    {/* Visual Frame */}
                    <div className="relative w-14 h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F4F5F9] to-[#E8EBF2] shrink-0 border border-[#E8EBF2] shadow-2xs">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name || "Garment"}
                          fill
                          sizes="60px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-[#F4F5F9]">
                          <Package className="w-4 h-4 text-[#8E92A2] mb-0.5" />
                          <span className="text-[8px] font-mono font-bold text-[#8E92A2] tracking-tighter">
                            ROC
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Garment Details & Unit Math */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-extrabold text-[#0C0D11] truncate tracking-tight uppercase">
                        {item.name}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-[#F4F5F9] font-bold text-[#0C0D11] border border-[#E8EBF2]">
                          {item.size || "M"}
                        </span>
                        <span className="text-[#8E92A2]">Qty: {item.quantity}</span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="text-[#8E92A2]">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Line Item Total */}
                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-xs text-[#0C0D11]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#F0F2F6] text-xs">
              <div className="flex justify-between text-[#696E7E]">
                <span>Silhouettes Subtotal</span>
                <span className="font-mono font-bold text-[#0C0D11]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-[#696E7E]">
                <span>Insured Express Courier</span>
                <span className="font-mono font-bold text-emerald-600">
                  {shipping === 0 ? "COMPLIMENTARY" : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-[#696E7E]">
                <span>Taxes (GST 12% Included)</span>
                <span className="font-mono text-[#8E92A2]">₹0</span>
              </div>

              {/* Total Row */}
              <div className="flex justify-between text-sm font-black text-[#0C0D11] pt-3.5 border-t border-[#E8EBF2]">
                <span className="uppercase tracking-wider">Total Payable</span>
                <span className="font-mono text-xl">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Service Pillars */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0F2F6] text-[10px] font-mono text-[#8E92A2]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#3B7BF6] shrink-0" />
                <span>3-5 Days Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>7-Day Exchange</span>
              </div>
            </div>

          </div>

        </div>

        {/* Confirmation Modal */}
        {confirmedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-[36px] p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(12,13,17,0.3)] border border-[#E8EBF2] text-center space-y-6 animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#3B7BF6]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative mx-auto w-20 h-20 rounded-full bg-[#F4F5F9] border border-[#E8EBF2] flex items-center justify-center shadow-inner">
                <div className="w-14 h-14 rounded-full bg-[#0C0D11] text-white flex items-center justify-center shadow-lg">
                  <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B7BF6] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3B7BF6]"></span>
                </span>
              </div>

              <div className="space-y-1.5 z-10 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#EBF1FD] text-[#3B7BF6]">
                  <Sparkles className="w-3 h-3" /> Reservation Secured
                </div>
                <h2 className="text-2xl font-extrabold text-[#0C0D11] tracking-tight">
                  Order Confirmed
                </h2>
                <p className="text-xs text-[#8E92A2] max-w-xs mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#0C0D11]">{confirmedOrder.recipient}</strong>. Your garment order has been received and queued for dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F5F9] border border-[#E8EBF2] text-xs space-y-2.5 z-10 relative text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E92A2]">
                    Tracking Ref
                  </span>
                  <span className="font-mono font-extrabold text-[#0C0D11]">
                    {confirmedOrder.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E92A2]">
                    Destination
                  </span>
                  <span className="font-medium text-[#0C0D11]">
                    {confirmedOrder.destination}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E92A2]">
                    Payment Mode
                  </span>
                  <span className="font-semibold text-[#0C0D11] uppercase">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8EBF2]/80 flex items-center justify-between">
                  <span className="font-bold text-[#0C0D11]">Grand Total</span>
                  <span className="text-sm font-extrabold text-[#0C0D11]">
                    ₹{confirmedOrder.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 z-10 relative pt-1">
                <button
                  onClick={() => router.push(`/account/orders/${confirmedOrder.orderNumber}/invoice`)}
                  className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>View Tax Invoice</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => router.push("/shop")}
                  className="w-full py-3 rounded-full bg-white hover:bg-[#F4F5F9] text-[#4A4D59] hover:text-[#0C0D11] text-xs font-bold uppercase tracking-wider transition-all border border-[#E8EBF2] cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E92A2]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>An official tax invoice and dispatch timeline has been emailed.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}