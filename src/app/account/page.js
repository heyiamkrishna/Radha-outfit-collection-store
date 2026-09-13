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

  // Customer statistics calculations
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
    <div className="relative min-h-screen bg-[#FAFBFD] text-[#0C0D11] py-8 sm:py-14 px-3 sm:px-6 md:px-12 overflow-hidden selection:bg-[#0C0D11] selection:text-white">
      {/* Editorial Ambient Radial Halos */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-5 w-[420px] h-[420px] bg-gradient-to-bl from-purple-100/30 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── CLIENT ATELIER HERO CARD ── */}
        <section className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 border border-[#E8EBF2]/80 shadow-[0_16px_45px_-10px_rgba(12,13,17,0.04)] transition-all">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#F0F2F6]">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C0D11] text-white text-[9.5px] font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>Patron Dossier • ROC Privilege</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                {user.name}
              </h1>
              <p className="text-xs font-mono text-[#8E92A2] tracking-wide flex items-center gap-2">
                <span>{user.email}</span>
                <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                <span className="text-emerald-600 font-bold uppercase">Member in Good Standing</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-md active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Desk</span>
                </Link>
              )}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F8F9FC] text-[#0C0D11] border border-[#E8EBF2] text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95"
              >
                <span>Curated Silhouettes</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8E92A2]" />
              </Link>
            </div>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
            <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Pieces Acquired
                </span>
                <span className="text-xl sm:text-2xl font-serif font-black text-[#0C0D11]">
                  {totalSilhouettes}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8EBF2] flex items-center justify-center text-[#0C0D11]">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Active Parcels
                </span>
                <span className="text-xl sm:text-2xl font-serif font-black text-[#3B7BF6]">
                  {activeShipments}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8EBF2] flex items-center justify-center text-[#3B7BF6]">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#8E92A2] tracking-wider block">
                  Cumulative Value
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#0C0D11]">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8EBF2] flex items-center justify-center text-emerald-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ── ORDERS DISPATCH STREAM ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EBF2]">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-black uppercase tracking-wider text-[#0C0D11]">
                Wardrobe Order Register ({orders.length})
              </h2>
              <p className="text-[11px] font-mono text-[#8E92A2]">
                Tailoring dispatches, real-time courier tracking, and legal tax documents
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center bg-white/80 backdrop-blur-md rounded-[36px] border border-dashed border-[#CBD5E1] space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#F4F5F9] text-[#8E92A2] flex items-center justify-center mx-auto border border-[#E8EBF2]">
                <Package className="w-7 h-7 text-[#0C0D11]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                  No Acquisitions Recorded Yet
                </h3>
                <p className="text-xs text-[#8E92A2] max-w-sm mx-auto font-mono leading-relaxed">
                  Your wardrobe register is clear. Pieces crafted or ordered will populate this ledger.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-mono font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" /> Discover Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const { step: currentStep, label: statusLabel, badge: badgeClass, icon: StatusIcon } =
                  getStatusConfig(order.orderStatus);
                const isCancelled = order.orderStatus === "cancelled";
                const invoiceRef = order.orderNumber || order._id;

                return (
                  <div
                    key={order._id}
                    className="group bg-white/95 backdrop-blur-xl rounded-[32px] sm:rounded-[36px] border border-[#E8EBF2] p-5 sm:p-8 shadow-[0_12px_36px_rgba(12,13,17,0.03)] space-y-6 transition-all hover:shadow-[0_20px_50px_rgba(12,13,17,0.06)]"
                  >
                    {/* Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F4F5F9] text-xs">
                      <div>
                        <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#8E92A2]">
                          Parcel Identifier
                        </span>
                        <p className="font-mono font-black text-sm sm:text-base text-[#0C0D11] tracking-tight">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#8E92A2] font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#0C0D11]" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeClass}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </span>

                        <Link
                          href={`/account/orders/${invoiceRef}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E8EBF2] bg-[#FAFBFD] hover:bg-[#0C0D11] hover:text-white text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#3B7BF6] group-hover:text-white" />
                          <span>Tax Invoice</span>
                        </Link>
                      </div>
                    </div>

                    {/* Visual 4-Stage Atelier Stepper */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
                          {[
                            { label: "Secured", step: 1 },
                            { label: "In Atelier", step: 2 },
                            { label: "BlueDart Air", step: 3 },
                            { label: "Delivered", step: 4 },
                          ].map((stage) => {
                            const isDone = currentStep >= stage.step;
                            return (
                              <div key={stage.step} className="space-y-2">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isDone
                                      ? "bg-[#0C0D11] shadow-[0_0_8px_rgba(12,13,17,0.3)]"
                                      : "bg-[#EEF1F6]"
                                  }`}
                                />
                                <span
                                  className={`text-[9px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider block truncate ${
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
                      
                      {/* Left: Included Items */}
                      <div className="lg:col-span-8 space-y-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] block">
                          Curated Garments in Parcel ({order.items?.length || 0})
                        </span>
                        
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6] hover:bg-[#F3F5FA] transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="relative w-12 h-14 rounded-xl bg-white overflow-hidden border border-[#E8EBF2] shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-[#8E92A2]">
                                      ROC
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-serif font-black text-xs sm:text-sm text-[#0C0D11] truncate uppercase">
                                    {item.name}
                                  </p>
                                  <p className="text-[10.5px] font-mono text-[#8E92A2]">
                                    Silhouette Fit: <strong className="text-[#0C0D11]">{item.size || "M"}</strong> • Qty: {item.quantity}
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
                      <div className="lg:col-span-4 p-5 rounded-2xl bg-[#F8F9FC] border border-[#F0F2F6] space-y-3.5">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3B7BF6] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Destination
                          </span>
                          <p className="font-serif font-black text-xs uppercase text-[#0C0D11] mt-1 truncate">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-[#4A4D59] text-[11px] leading-relaxed mt-0.5 font-sans">
                            {order.shippingAddress?.street}
                            <br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E8EBF2] flex justify-between items-end">
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-[#8E92A2] block">
                              Total Settled
                            </span>
                            <p className="text-[10.5px] text-[#4A4D59] uppercase font-mono font-semibold">
                              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online UPI / NetBanking"}
                            </p>
                          </div>
                          <span className="font-mono font-black text-base sm:text-lg text-[#0C0D11]">
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