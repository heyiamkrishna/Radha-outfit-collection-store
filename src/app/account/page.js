import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import {
  Package,
  MapPin,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  Scissors,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("roc_token")?.value;

  if (!token) {
    redirect("/login?redirect=/account");
  }

  let userPayload = null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);
    userPayload = payload;
  } catch {
    redirect("/login?redirect=/account");
  }

  const userId = userPayload.userId || userPayload.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    redirect("/login?redirect=/account");
  }

  await connectToDatabase();

  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    redirect("/login?redirect=/account");
  }

  const rawOrders = await Order.find({
    $or: [{ user: user._id }, { "shippingAddress.email": user.email }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const orders = JSON.parse(JSON.stringify(rawOrders));

  const totalSilhouettes = orders.reduce((acc, order) => {
    return acc + (order.items?.reduce((iAcc, item) => iAcc + (Number(item.quantity) || 1), 0) || 0);
  }, 0);

  const totalSpent = orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);
  const activeShipments = orders.filter(
    (o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled"
  ).length;

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "received":
        return {
          step: 1,
          label: "Order Secured",
          badge: "bg-blue-50 text-blue-700 border-blue-200/80",
          icon: Clock,
        };
      case "processing":
        return {
          step: 2,
          label: "In Atelier",
          badge: "bg-amber-50 text-amber-800 border-amber-200/80",
          icon: Scissors,
        };
      case "in_transit":
      case "shipped":
        return {
          step: 3,
          label: "In Transit",
          badge: "bg-purple-50 text-purple-700 border-purple-200/80",
          icon: Truck,
        };
      case "delivered":
        return {
          step: 4,
          label: "Delivered",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: CheckCircle2,
        };
      default:
        return {
          step: 0,
          label: "Archived / Void",
          badge: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] py-6 sm:py-12 px-3 sm:px-6 md:px-12 overflow-x-hidden selection:bg-[#0C0D11] selection:text-white animate-luxury-fade">
      {/* Editorial Ambient Atmospheric Blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-blue-100/35 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/3 right-4 w-[420px] h-[420px] bg-gradient-to-bl from-rose-100/25 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        
        {/* ── CLIENT ATELIER HERO CARD ── */}
        <section className="relative overflow-hidden bg-white/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[40px] p-5 sm:p-10 border border-white/90 shadow-[0_16px_45px_-12px_rgba(12,13,17,0.04)] ring-1 ring-black/[0.03]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-black/[0.05]">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C0D11] text-white text-[8.5px] sm:text-[9.5px] font-mono font-bold uppercase tracking-widest shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>Patron Dossier • ROC Privilege</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight text-[#0C0D11] leading-none">
                {user.name}
              </h1>
              <p className="text-[11px] sm:text-xs font-mono text-[#8E92A2] tracking-wide flex flex-wrap items-center gap-2">
                <span>{user.email}</span>
                <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                <span className="text-emerald-700 font-bold uppercase text-[10px] sm:text-[11px]">Member in Good Standing</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0C0D11] text-white text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#1E2028] transition-all shadow-xs active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Desk</span>
                </Link>
              )}

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white hover:bg-[#FAFAFC] text-[#0C0D11] border border-black/[0.07] text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-95"
              >
                <span>Discover Silhouettes</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8E92A2]" />
              </Link>
            </div>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-5 sm:pt-6">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Pieces Acquired
                </span>
                <span className="text-xl sm:text-2xl font-serif font-black text-[#0C0D11]">
                  {totalSilhouettes}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-[#0C0D11] shadow-2xs">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Active Parcels
                </span>
                <span className="text-xl sm:text-2xl font-serif font-black text-[#3B7BF6]">
                  {activeShipments}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-[#3B7BF6] shadow-2xs">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Cumulative Value
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#0C0D11]">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-emerald-600 shadow-2xs">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ── ORDERS DISPATCH STREAM ── */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-black uppercase tracking-wider text-[#0C0D11]">
                Wardrobe Order Register ({orders.length})
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono text-[#8E92A2]">
                Tailoring dispatches, real-time courier tracking, and tax certificates
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 sm:py-20 text-center bg-white/80 backdrop-blur-md rounded-[32px] sm:rounded-[36px] border border-dashed border-black/[0.12] space-y-3.5 shadow-2xs">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAFAFC] text-[#8E92A2] flex items-center justify-center mx-auto border border-black/[0.05]">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-[#0C0D11]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                  No Acquisitions Recorded Yet
                </h3>
                <p className="text-[11px] sm:text-xs text-[#8E92A2] max-w-sm mx-auto font-mono leading-relaxed">
                  Your wardrobe register is clear. Pieces tailored or acquired will populate this ledger.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[11px] sm:text-xs font-mono font-black uppercase tracking-widest transition-all shadow-xs active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Discover Collection</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => {
                const { step: currentStep, label: statusLabel, badge: badgeClass, icon: StatusIcon } =
                  getStatusConfig(order.orderStatus);
                const isCancelled = order.orderStatus === "cancelled";
                const invoiceRef = order.orderNumber || order._id;

                return (
                  <div
                    key={order._id}
                    className="group bg-white/95 backdrop-blur-xl rounded-[26px] sm:rounded-[36px] border border-black/[0.06] p-4 sm:p-7 md:p-8 shadow-[0_12px_36px_rgba(12,13,17,0.03)] space-y-5 sm:space-y-6 hover:shadow-[0_18px_45px_rgba(12,13,17,0.05)] transition-all"
                  >
                    {/* Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-black/[0.05] text-xs">
                      <div>
                        <span className="text-[9px] sm:text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#8E92A2]">
                          Parcel Identifier
                        </span>
                        <p className="font-mono font-black text-xs sm:text-base text-[#0C0D11] tracking-tight">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <div className="hidden xs:inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8E92A2] font-mono">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0C0D11]" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeClass}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </span>

                        <Link
                          href={`/account/orders/${invoiceRef}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border border-black/[0.07] bg-[#FAFAFC] hover:bg-[#0C0D11] hover:text-white text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3B7BF6] group-hover:text-white" />
                          <span>Tax Certificate</span>
                        </Link>
                      </div>
                    </div>

                    {/* 4-Stage Atelier Stepper */}
                    {!isCancelled && (
                      <div className="py-1 sm:py-2">
                        <div className="grid grid-cols-4 gap-2 sm:gap-3.5 text-center">
                          {[
                            { label: "Secured", step: 1 },
                            { label: "In Atelier", step: 2 },
                            { label: "In Transit", step: 3 },
                            { label: "Delivered", step: 4 },
                          ].map((stage) => {
                            const isDone = currentStep >= stage.step;
                            return (
                              <div key={stage.step} className="space-y-1.5 sm:space-y-2">
                                <div
                                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                                    isDone
                                      ? "bg-[#0C0D11] shadow-[0_0_8px_rgba(12,13,17,0.25)]"
                                      : "bg-neutral-200/70"
                                  }`}
                                />
                                <span
                                  className={`text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider block truncate ${
                                    isDone ? "text-[#0C0D11]" : "text-[#CBD5E1]"
                                  }`}
                                >
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Garments in Parcel & Shipping Snapshot */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start text-xs">
                      
                      {/* Left: Included Items */}
                      <div className="lg:col-span-8 space-y-2.5">
                        <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] block">
                          Curated Garments in Parcel ({order.items?.length || 0})
                        </span>
                        
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] hover:bg-[#F4F5F9] transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-11 h-14 sm:w-12 sm:h-14 rounded-xl bg-white overflow-hidden border border-black/[0.05] shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      sizes="60px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-[#8E92A2]">
                                      ROC
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-serif font-black text-xs sm:text-[13px] text-[#0C0D11] truncate uppercase">
                                    {item.name}
                                  </p>
                                  <p className="text-[9.5px] sm:text-[10.5px] font-mono text-[#8E92A2]">
                                    Size: <strong className="text-[#0C0D11]">{item.size || "M"}</strong> • Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>

                              <span className="font-mono font-black text-xs sm:text-sm text-[#0C0D11] shrink-0 pl-2">
                                ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Delivery & Payment Capsule */}
                      <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#FAFAFC] border border-black/[0.04] space-y-3">
                        <div>
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6] flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Destination
                          </span>
                          <p className="font-serif font-black text-xs uppercase text-[#0C0D11] mt-1 truncate">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-[#4A4D59] text-[10.5px] sm:text-[11px] leading-relaxed mt-0.5 font-sans">
                            {order.shippingAddress?.street}
                            <br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-black/[0.05] flex justify-between items-end">
                          <div>
                            <span className="text-[8.5px] uppercase font-mono font-bold text-[#8E92A2] block">
                              Settlement Total
                            </span>
                            <p className="text-[10px] text-[#4A4D59] uppercase font-mono font-semibold truncate">
                              {order.paymentMethod === "cod" ? "Doorstep COD" : "Online UPI / Card"}
                            </p>
                          </div>
                          <span className="font-mono font-black text-sm sm:text-base text-[#0C0D11]">
                            ₹{(Number(order.totalAmount) || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}