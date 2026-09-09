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
  Calendar,
  CreditCard,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  LogOut,
  ShoppingBag,
} from "lucide-react";

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
  } catch (_) {
    redirect("/login?redirect=/account");
  }

  const userId = userPayload.userId || userPayload.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    redirect("/login?redirect=/account");
  }

  await connectToDatabase();

  // Fetch logged in customer profile
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    redirect("/login?redirect=/account");
  }

  // STRICT DATA ISOLATION: Query ONLY orders belonging to this user's ObjectId
  const rawOrders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .lean();

  const orders = JSON.parse(JSON.stringify(rawOrders));

  const getStatusStep = (status) => {
    switch (status) {
      case "received":
        return 1;
      case "processing":
        return 2;
      case "in_transit":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0; // cancelled
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-8 sm:py-12 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Customer Header Card */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-[#E8EBF2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B7BF6]">
              Atelier Client Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C0D11] tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-[#8E92A2] font-mono">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors"
              >
                Admin Control Room
              </Link>
            )}

            <Link
              href="/shop"
              className="px-4 py-2 rounded-full border border-[#E8EBF2] bg-[#FAFAFC] text-xs font-bold text-[#0C0D11] hover:bg-[#E8EBF2] transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Orders Stream Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EBF2]">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0C0D11] uppercase tracking-wider">
                My Wardrobe Orders ({orders.length})
              </h2>
              <p className="text-[11px] text-[#8E92A2]">
                Track tailoring progress, courier logistics, and digital tax invoices
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[32px] border border-[#E8EBF2] space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F4F5F9] text-[#8E92A2] flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#0C0D11]">
                  No Purchases Recorded Yet
                </h3>
                <p className="text-xs text-[#8E92A2] max-w-sm mx-auto">
                  Your order history is empty. Pieces ordered from Radha Outfit Collection will appear here.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" /> Discover Garments
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStep = getStatusStep(order.orderStatus);
                const isCancelled = order.orderStatus === "cancelled";

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-[32px] border border-[#E8EBF2] p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F4F5F9] text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A2]">
                          Order Reference
                        </span>
                        <p className="font-mono font-black text-base text-[#0C0D11]">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#8E92A2] font-mono hidden sm:inline-block">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            order.orderStatus === "delivered"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : isCancelled
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-[#EBF1FD] text-[#3B7BF6] border-[#3B7BF6]/20"
                          }`}
                        >
                          {order.orderStatus?.replace("_", " ")}
                        </span>

                        <Link
                          href={`/account/orders/${order._id}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8EBF2] bg-[#FAFAFC] hover:bg-[#0C0D11] hover:text-white text-xs font-bold text-[#0C0D11] transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Tax Invoice
                        </Link>
                      </div>
                    </div>

                    {/* 4-Step Visual Progress Timeline (Hidden if Cancelled) */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {[
                            { label: "Received", step: 1 },
                            { label: "In Atelier", step: 2 },
                            { label: "In Transit", step: 3 },
                            { label: "Delivered", step: 4 },
                          ].map((stage) => {
                            const isDone = currentStep >= stage.step;
                            return (
                              <div key={stage.step} className="space-y-2">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isDone ? "bg-[#0C0D11]" : "bg-[#F0F2F6]"
                                  }`}
                                />
                                <span
                                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block ${
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

                    {/* Items Grid & Destination */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
                      {/* Included Garments */}
                      <div className="lg:col-span-8 space-y-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E92A2]">
                          Garments In Parcel ({order.items?.length || 0})
                        </span>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAFC] border border-[#F0F2F6]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-14 rounded-xl bg-white overflow-hidden border border-[#E8EBF2] shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8E92A2]">
                                      ROC
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[#0C0D11] truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-[#8E92A2]">
                                    Size: <strong className="text-[#0C0D11]">{item.size || "M"}</strong> · Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-[#0C0D11]">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment Meta */}
                      <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FAFAFC] border border-[#F0F2F6] space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B7BF6] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Delivery Destination
                          </span>
                          <p className="font-bold text-[#0C0D11] mt-1">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-[#4A4D59] text-[11px] leading-relaxed">
                            {order.shippingAddress?.street}
                            <br />
                            {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#E8EBF2] flex justify-between items-end">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#8E92A2]">
                              Total Paid
                            </span>
                            <p className="text-[11px] text-[#4A4D59] uppercase font-semibold">
                              {order.paymentMethod} ({order.paymentStatus})
                            </p>
                          </div>
                          <span className="font-mono font-black text-base text-[#0C0D11]">
                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}