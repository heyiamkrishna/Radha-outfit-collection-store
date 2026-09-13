"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Truck,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true);
      else setLoading(true);

      const url = new URL("/api/admin/orders", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (search.trim()) url.searchParams.set("q", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      if (res.ok) {
        fetchOrders(true);
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = [
    { id: "all", label: "All Dispatches" },
    { id: "received", label: "Received" },
    { id: "confirmed", label: "Confirmed" },
    { id: "in_production", label: "Tailoring" },
    { id: "dispatched", label: "Dispatched" },
    { id: "delivered", label: "Delivered" },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-6 sm:pt-10 pb-24 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6 sm:space-y-8 selection:bg-[#0C0D11] selection:text-white animate-luxury-fade overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute top-4 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-blue-100/35 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-8 w-[420px] h-[420px] bg-gradient-to-tl from-rose-100/25 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10" />

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] pb-5 sm:pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/dashboard"
            className="group inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-widest bg-blue-50 text-[#3B7BF6] border border-blue-100/80">
              <Sparkles className="w-2.5 h-2.5" /> Client Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
            Order Desk & Client Dossiers
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
            title="Refresh Registry"
            aria-label="Refresh Registry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] hover:border-[#0C0D11] shadow-2xs transition-all active:scale-95"
          >
            Garments Studio
          </Link>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Horizontal Scrolling Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {statuses.map((st) => (
            <button
              type="button"
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                statusFilter === st.id
                  ? "bg-[#0C0D11] text-white shadow-xs"
                  : "bg-white/85 backdrop-blur-md text-[#8E92A2] border border-black/[0.06] hover:border-[#0C0D11] hover:text-[#0C0D11]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E92A2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, client, phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] focus:border-[#0C0D11] focus:bg-white outline-none text-xs font-medium placeholder:text-[#8E92A2] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#8E92A2]">
          Loading Client Dispatches...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white/80 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] border border-dashed border-black/[0.12] space-y-2 p-6 shadow-2xs">
          <Package className="w-8 h-8 text-[#8E92A2] mx-auto opacity-70" />
          <p className="font-serif font-black uppercase text-xs text-[#0C0D11]">
            No Orders Found
          </p>
          <p className="text-[11px] font-mono text-[#8E92A2]">
            No orders match the selected filter or query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* MOBILE VIEW (lg:hidden): Adaptive Action Cards */}
          <div className="grid grid-cols-1 gap-3.5 lg:hidden">
            {orders.map((o) => {
              const clientName = o.shippingAddress?.fullName || o.user?.name || "Guest Customer";
              const clientPhone = o.shippingAddress?.phone || o.user?.phone || "";
              const clientCity = o.shippingAddress?.city || "IN";
              const isRegistered = !!o.user?._id;

              return (
                <div
                  key={o._id}
                  className="bg-white/95 backdrop-blur-xl rounded-[24px] p-4 sm:p-5 border border-black/[0.06] shadow-xs space-y-3.5 ring-1 ring-black/[0.02]"
                >
                  {/* Top Bar: Number + Date + Registered Badge */}
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-black text-[#0C0D11]">
                        {o.orderNumber}
                      </span>
                      <span className="text-[9.5px] text-[#8E92A2] font-mono block">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[8.5px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isRegistered
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}
                    >
                      {isRegistered ? "Verified Member" : "Guest Checkout"}
                    </span>
                  </div>

                  {/* Customer Info & Value */}
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-serif font-black uppercase text-xs text-[#0C0D11] truncate">{clientName}</p>
                      <p className="text-[11px] font-mono text-[#4A4D59] truncate">{clientCity}</p>
                      {clientPhone && (
                        <p className="text-[10px] font-mono text-[#8E92A2]">{clientPhone}</p>
                      )}
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="text-sm font-black text-[#0C0D11] block">
                        ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 border ${
                          o.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                            : "bg-amber-50 text-amber-800 border-amber-200/80"
                        }`}
                      >
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown & Inspection Action */}
                  <div className="pt-2 flex items-center gap-2 border-t border-black/[0.04]">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#FAFAFC] border border-black/[0.07] font-mono text-[10.5px] font-bold uppercase outline-none focus:border-[#0C0D11] cursor-pointer"
                    >
                      <option value="received">Received</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_production">Tailoring</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="py-2 px-4 rounded-xl bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW (hidden lg:block): High-Fidelity Table */}
          <div className="hidden lg:block bg-white/90 backdrop-blur-2xl rounded-[28px] border border-white/90 shadow-[0_16px_45px_-12px_rgba(12,13,17,0.04)] ring-1 ring-black/[0.03] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-[#FAFAFC] border-b border-black/[0.05] font-mono text-[9px] uppercase tracking-wider text-[#8E92A2]">
                  <tr>
                    <th className="p-4 pl-6 font-bold">Reference</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Dispatch City</th>
                    <th className="p-4 font-bold">Settlement</th>
                    <th className="p-4 font-bold">Fulfillment Status</th>
                    <th className="p-4 pr-6 text-right font-bold">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {orders.map((o) => {
                    const isRegistered = !!o.user?._id;
                    const clientName =
                      o.shippingAddress?.fullName || o.user?.name || "Guest Customer";
                    const clientEmail =
                      o.shippingAddress?.email || o.user?.email || "No email";
                    const clientPhone =
                      o.shippingAddress?.phone || o.user?.phone || "No phone";

                    return (
                      <tr key={o._id} className="hover:bg-[#FAFAFC]/80 transition-colors">
                        <td className="p-4 pl-6">
                          <span className="font-mono font-black text-[#0C0D11] text-xs">
                            {o.orderNumber}
                          </span>
                          <div className="text-[9.5px] text-[#8E92A2] font-mono">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold uppercase text-[#0C0D11] text-xs">
                              {clientName}
                            </span>
                            {isRegistered ? (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                                Member
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-neutral-100 text-neutral-600">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-[#8E92A2] font-mono">{clientEmail}</div>
                          <div className="text-[10px] text-[#8E92A2] font-mono">{clientPhone}</div>
                        </td>

                        <td className="p-4 font-medium text-[#4A4D59]">
                          {o.shippingAddress?.city || "Metro"}, {o.shippingAddress?.state || "IN"}
                        </td>

                        <td className="p-4 font-mono">
                          <div className="font-black text-[#0C0D11] text-xs">
                            ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                          </div>
                          <span
                            className={`inline-block mt-0.5 text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                                : "bg-amber-50 text-amber-800 border-amber-200/80"
                            }`}
                          >
                            {o.paymentMethod} • {o.paymentStatus}
                          </span>
                        </td>

                        <td className="p-4">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-black/[0.07] font-mono text-[10px] font-bold uppercase outline-none focus:border-[#0C0D11] cursor-pointer"
                          >
                            <option value="received">Received</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_production">Tailoring</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="px-3.5 py-1.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-2xs"
                          >
                            Inspect Client
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Inspection Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0C0D11]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg sm:max-w-xl bg-white h-full shadow-2xl overflow-y-auto p-5 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                <div>
                  <span className="text-[9.5px] font-mono font-black uppercase text-[#3B7BF6] tracking-wider">
                    Client Dossier
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-neutral-100 cursor-pointer active:scale-90 transition-all"
                  aria-label="Close Dossier"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Client Identity */}
              <div className="p-4 sm:p-5 rounded-[22px] bg-[#FAFAFC] border border-black/[0.05] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0C0D11]" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#0C0D11]">
                      Client Identity
                    </span>
                  </div>
                  {selectedOrder.user ? (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Registered
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                      Guest
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[9.5px] text-[#8E92A2] font-mono uppercase block">Full Name</span>
                    <p className="font-serif font-bold uppercase text-[#0C0D11]">
                      {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#8E92A2] font-mono uppercase block">Email Address</span>
                    <p className="font-mono text-[#0C0D11] truncate">
                      {selectedOrder.shippingAddress?.email || selectedOrder.user?.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#8E92A2] font-mono uppercase block">Phone / Mobile</span>
                    <p className="font-mono text-[#0C0D11]">
                      {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#8E92A2] font-mono uppercase block">Customer Account</span>
                    <p className="font-mono text-[#0C0D11]">
                      {selectedOrder.user?.createdAt
                        ? `Member since ${new Date(selectedOrder.user.createdAt).getFullYear()}`
                        : "One-Time Buyer"}
                    </p>
                  </div>
                </div>

                {/* Direct Communications */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-black/[0.05]">
                  <a
                    href={`https://wa.me/${(selectedOrder.shippingAddress?.phone || "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-white border border-black/[0.06] hover:border-emerald-500 text-emerald-800 text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Client
                  </a>
                  <a
                    href={`mailto:${selectedOrder.shippingAddress?.email}?subject=Radha Outfit Collection - Order ${selectedOrder.orderNumber}`}
                    className="flex-1 py-2 rounded-xl bg-white border border-black/[0.06] hover:border-blue-500 text-blue-700 text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Notice
                  </a>
                </div>
              </div>

              {/* 2. Dispatch Address */}
              <div className="p-4 sm:p-5 rounded-[22px] bg-[#FAFAFC] border border-black/[0.05] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0C0D11]">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Dispatch Destination</span>
                </div>
                <p className="text-xs text-[#4A4D59] leading-relaxed">
                  {selectedOrder.shippingAddress?.street}
                  <br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
              </div>

              {/* 3. Items Ordered */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0C0D11]">
                  Curated Garments ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#FAFAFC] shrink-0 border border-black/[0.04]">
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-bold uppercase text-[#0C0D11] truncate">{item.name}</p>
                          <p className="text-[10px] font-mono text-[#8E92A2]">
                            Size: <span className="text-[#0C0D11] font-bold">{item.size || "M"}</span> • Qty:{" "}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-[#0C0D11] shrink-0">
                        ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Settlement Footer */}
            <div className="border-t border-black/[0.05] pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8E92A2]">Net Settlement</span>
                <span className="text-base font-black text-[#0C0D11]">
                  ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-98 cursor-pointer shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}