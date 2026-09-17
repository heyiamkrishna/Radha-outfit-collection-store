"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Clock,
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  X,
  ChevronRight,
  Sparkles,
  IndianRupee,
  TrendingUp,
  Banknote,
  Globe,
  Tag,
  Receipt,
  Calendar,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/admin/orders?limit=150", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load transactions.");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Order fetch failure:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  const advanceStatus = async (orderId, currentStatus) => {
    const statusSequence = {
      received: "processing",
      processing: "shipped",
      shipped: "delivered",
      delivered: "delivered",
    };
    const nextStatus = statusSequence[currentStatus] || "processing";

    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: nextStatus } : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: nextStatus }));
        }
      }
    } catch (err) {
      alert("Status update failed: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Financial & Metric Calculations ──
  const grossRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const manualOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.isManualEntry ||
        o.orderNumber?.startsWith("ROC-POS") ||
        o.orderNumber?.startsWith("ROC-MAN")
    );
  }, [orders]);

  const manualCount = manualOrders.length;
  const manualRevenue = useMemo(() => {
    return manualOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [manualOrders]);

  const onlineRevenue = grossRevenue - manualRevenue;

  const cashOrders = useMemo(() => {
    return orders.filter((o) => {
      const m = o.paymentMethod?.toLowerCase() || "";
      return m === "cash" || m === "cod" || m.includes("cash");
    });
  }, [orders]);

  const cashRevenue = useMemo(() => {
    return cashOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [cashOrders]);

  const averageTicket = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;
  const pendingDispatches = useMemo(() => {
    return orders.filter((o) => o.orderStatus !== "delivered").length;
  }, [orders]);

  // ── Product-Level Sales Performance Calculation ──
  const productSellStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.name || "Bespoke Silhouette";
        if (!map[key]) {
          map[key] = {
            name: key,
            quantity: 0,
            revenue: 0,
            image: item.image || "/placeholder.jpg",
          };
        }
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        map[key].quantity += qty;
        map[key].revenue += price * qty;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4); // Top 4 best-sellers
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.orderNumber?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q));

      const isManual =
        o.isManualEntry === true ||
        o.orderNumber?.startsWith("ROC-POS") ||
        o.orderNumber?.startsWith("ROC-MAN");

      if (statusFilter === "manual-pos") return matchesSearch && isManual;
      if (statusFilter === "online") return matchesSearch && !isManual;
      if (statusFilter !== "all") {
        return matchesSearch && o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
      }
      return matchesSearch;
    });
  }, [orders, searchQuery, statusFilter]);

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFC] text-[#0C0D11] pt-4 sm:pt-8 pb-32 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-7 sm:space-y-10 selection:bg-[#0C0D11] selection:text-white">
      {/* ── Atmospheric Ambient Radiance ── */}
      <div className="pointer-events-none fixed top-[-5%] left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-indigo-100/25 via-blue-50/15 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-emerald-100/20 via-amber-50/15 to-transparent rounded-full blur-3xl -z-10" />

      {/* ── 1. COMMAND RIBBON HEADER ── */}
      <header className="border-b border-black/[0.06] pb-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#3B7BF6] truncate">
                Atelier Fulfillment Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black uppercase tracking-tight text-[#0C0D11] truncate">
              Orders & Boutique POS
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="p-2.5 sm:p-3 rounded-full bg-white border border-black/[0.08] hover:border-[#0C0D11] text-[#0C0D11] transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/admin"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-black/[0.08] hover:border-[#0C0D11] text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11] shadow-xs active:scale-95 transition-all"
            >
              Console
            </Link>
          </div>
        </div>

        {/* ── 2. EXECUTIVE METRIC TILES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Gross Settlement */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/[0.06] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Gross Settlement
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black font-mono text-[#0C0D11] truncate">
              ₹{grossRevenue.toLocaleString("en-IN")}
            </p>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">
              Audited Ledger ({orders.length} orders)
            </span>
          </div>

          {/* Boutique POS */}
          <div
            onClick={() => setStatusFilter("manual-pos")}
            className="p-4 sm:p-5 rounded-[24px] bg-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-600 transition-all"
          >
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Boutique POS
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black font-mono text-emerald-900">
              ₹{manualRevenue.toLocaleString("en-IN")}
            </p>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">
              {manualCount} Counter Invoices
            </span>
          </div>

          {/* Online Web Store */}
          <div
            onClick={() => setStatusFilter("online")}
            className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/[0.06] shadow-xs space-y-1.5 cursor-pointer hover:border-[#0C0D11] transition-all"
          >
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Storefront Digital
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-[#3B7BF6] flex items-center justify-center shadow-2xs">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black font-mono text-[#0C0D11]">
              ₹{onlineRevenue.toLocaleString("en-IN")}
            </p>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#3B7BF6] uppercase tracking-widest block">
              {orders.length - manualCount} Web Dispatches
            </span>
          </div>

          {/* Average Ticket Size */}
          <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/[0.06] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Avg Ticket Size
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-base sm:text-2xl font-black font-mono text-[#0C0D11]">
              ₹{averageTicket.toLocaleString("en-IN")}
            </p>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest block">
              Cash Vol: ₹{cashRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* ── 3. PRODUCT-WISE SALES BREAKDOWN ── */}
        {productSellStats.length > 0 && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-2.5">
              <div className="flex items-center gap-1.5 text-[#0C0D11]">
                <Tag className="w-3.5 h-3.5 text-[#3B7BF6]" />
                <h3 className="font-serif font-black uppercase text-xs sm:text-sm tracking-tight">
                  Top Performing Silhouettes (Product Sell Matrix)
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#8E92A2] uppercase tracking-wider">
                Revenue Leaderboard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {productSellStats.map((item, idx) => {
                const percentOfGross =
                  grossRevenue > 0 ? Math.round((item.revenue / grossRevenue) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAFAFC] border border-black/[0.05] flex items-center gap-3"
                  >
                    <div className="relative w-11 h-14 rounded-xl overflow-hidden bg-white border border-black/[0.06] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5 font-mono">
                      <p className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[#8E92A2]">
                        {item.quantity} Units Sold ({percentOfGross}% rev)
                      </p>
                      <p className="text-xs font-black text-[#0C0D11]">
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ── 4. CONTROLS STRIP: SEARCH & FILTER PILLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-[26px] border border-black/[0.06] shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, Patron, or Phone..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-full bg-[#FAFAFC] border border-black/[0.07] text-xs font-mono outline-none focus:bg-white focus:border-[#0C0D11] transition-all shadow-2xs"
          />
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: "all", label: "All Records" },
            { id: "manual-pos", label: `Boutique POS (${manualCount})`, icon: Store },
            { id: "online", label: "Storefront Digital" },
            { id: "received", label: "Received" },
            { id: "processing", label: "Processing" },
            { id: "delivered", label: "Delivered" },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-mono uppercase font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  active
                    ? "bg-[#0C0D11] text-white shadow-2xs"
                    : tab.id === "manual-pos"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-[#FAFAFC] text-[#4A4D59] border border-black/[0.06] hover:bg-white"
                }`}
              >
                {Icon && <Icon className="w-3 h-3 text-emerald-600" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. TRANSACTIONS STREAM WITH TIME DETAILS ── */}
      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-3 bg-white rounded-[32px] border border-black/[0.06]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C0D11]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#8E92A2]">
            Synchronizing Records with Cloud Vault...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[32px] border border-dashed border-black/[0.08] space-y-2.5">
          <Receipt className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-serif font-black uppercase text-sm sm:text-base text-[#0C0D11]">
            No Orders In This View
          </h3>
          <p className="text-xs font-mono text-[#8E92A2] max-w-sm mx-auto">
            Try adjusting your search criteria or switching across active filter tabs.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile High-Density Cards (< 640px) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredOrders.map((o) => {
              const isManual =
                o.isManualEntry ||
                o.orderNumber?.startsWith("ROC-POS") ||
                o.orderNumber?.startsWith("ROC-MAN");

              const { date, time } = formatDateTime(o.createdAt);

              return (
                <div
                  key={o._id}
                  className={`rounded-[24px] p-4 border shadow-2xs space-y-3 transition-colors ${
                    isManual
                      ? "bg-emerald-50/25 border-emerald-200/80"
                      : "bg-white border-black/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
                    <div className="flex items-center gap-1.5">
                      {isManual ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Store className="w-2.5 h-2.5" /> Boutique POS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-blue-50 text-[#3B7BF6] border border-blue-100">
                          Storefront
                        </span>
                      )}
                      <span className="font-mono text-xs font-black text-[#0C0D11]">
                        {o.orderNumber}
                      </span>
                    </div>

                    <span
                      className={`text-[8.5px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                        o.orderStatus === "delivered"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-neutral-100 text-[#0C0D11] border-neutral-200"
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-15 rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
                      <Image
                        src={o.items?.[0]?.image || "/placeholder.jpg"}
                        alt={o.items?.[0]?.name || "Piece"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate">
                        {o.items?.[0]?.name || "Bespoke Silhouette"}
                      </h4>
                      <p className="text-[11px] font-mono text-[#4A4D59] truncate">
                        Client: {o.shippingAddress?.fullName || "Walk-in Patron"}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#3B7BF6]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {date} • {time}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#8E92A2] pt-0.5">
                        {o.paymentMethod?.toUpperCase()} • ₹
                        {Number(o.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => advanceStatus(o._id, o.orderStatus)}
                      disabled={updatingId === o._id || o.orderStatus === "delivered"}
                      className="py-2.5 rounded-xl bg-[#0C0D11] text-white text-[10px] font-mono font-bold uppercase disabled:opacity-40 active:scale-95"
                    >
                      {o.orderStatus === "delivered" ? "Delivered ✓" : "Advance State →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="py-2.5 rounded-xl bg-white border border-black/[0.08] text-[#0C0D11] text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                    >
                      <Eye className="w-3 h-3 text-[#3B7BF6]" /> Inspect Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Matrix Register (>= 640px) */}
          <div className="hidden sm:block bg-white rounded-[32px] border border-black/[0.06] overflow-hidden shadow-xs">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead className="bg-[#FAFAFC] border-b border-black/[0.05] font-mono text-[9px] uppercase tracking-wider text-[#8E92A2]">
                  <tr>
                    <th className="p-4 pl-6 font-bold">Transaction Ref</th>
                    <th className="p-4 font-bold">Channel</th>
                    <th className="p-4 font-bold">Patron Credentials</th>
                    <th className="p-4 font-bold">Piece Preview</th>
                    <th className="p-4 font-bold">Exact Timestamp</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 text-right font-bold">Settlement</th>
                    <th className="p-4 pr-6 text-right font-bold">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredOrders.map((o) => {
                    const isManual =
                      o.isManualEntry ||
                      o.orderNumber?.startsWith("ROC-POS") ||
                      o.orderNumber?.startsWith("ROC-MAN");

                    const { date, time } = formatDateTime(o.createdAt);

                    return (
                      <tr
                        key={o._id}
                        className={`hover:bg-[#FAFAFC]/80 transition-colors ${
                          isManual ? "bg-emerald-50/15" : ""
                        }`}
                      >
                        <td className="p-4 pl-6 font-mono font-black text-[#0C0D11]">
                          {o.orderNumber}
                        </td>

                        <td className="p-4">
                          {isManual ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Store className="w-2.5 h-2.5" /> Boutique POS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase bg-blue-50 text-[#3B7BF6] border border-blue-100">
                              Storefront
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <p className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate max-w-[170px]">
                            {o.shippingAddress?.fullName || "Guest Patron"}
                          </p>
                          <p className="text-[10px] font-mono text-[#8E92A2]">
                            {o.shippingAddress?.phone || "No contact"} • {o.shippingAddress?.city || "Counter"}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
                              <Image
                                src={o.items?.[0]?.image || "/placeholder.jpg"}
                                alt="Garment"
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                            <span className="font-mono text-xs text-[#0C0D11] truncate max-w-[140px]">
                              {o.items?.[0]?.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 font-mono space-y-0.5">
                          <span className="text-[#0C0D11] font-bold block text-xs">
                            {date}
                          </span>
                          <span className="text-[#3B7BF6] text-[10px] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {time}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              o.orderStatus === "delivered"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-[#FAFAFC] text-[#0C0D11] border-black/[0.06]"
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-black text-xs sm:text-sm text-[#0C0D11]">
                          ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => advanceStatus(o._id, o.orderStatus)}
                              disabled={updatingId === o._id || o.orderStatus === "delivered"}
                              className="px-3.5 py-1.5 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-[9.5px] font-mono font-bold uppercase transition-all shadow-2xs active:scale-95 disabled:opacity-35 cursor-pointer"
                            >
                              {o.orderStatus === "delivered" ? "Done" : "Advance →"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="p-1.5 rounded-full bg-white hover:bg-neutral-100 border border-black/[0.07] text-[#0C0D11] transition-all cursor-pointer shadow-2xs"
                              title="Inspect Full Dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#3B7BF6]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── 6. HAUTE COUTURE INSPECTION DOSSIER ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex justify-end overflow-hidden">
          <div
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-sm transition-opacity duration-200"
          />

          <div className="relative z-10 w-full sm:max-w-md bg-white h-full shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Top Header */}
            <div className="bg-[#0C0D11] text-white px-6 py-5 text-center space-y-1 relative shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[8px] font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Atelier Verified Dossier</span>
              </div>

              <h3 className="font-serif font-black uppercase text-base tracking-tight text-white">
                Radha Outfit Collection
              </h3>
              <p className="text-[9.5px] font-mono text-white/60 tracking-wider">
                {selectedOrder.orderNumber}
              </p>
            </div>

            {/* Serrated Ticket Notch Graphics */}
            <div className="relative flex items-center justify-between px-[-10px] bg-white">
              <div className="w-5 h-5 rounded-full bg-[#0C0D11] -ml-2.5 -mt-2.5 shadow-inner" />
              <div className="flex-1 border-b-2 border-dashed border-neutral-200 mx-2" />
              <div className="w-5 h-5 rounded-full bg-[#0C0D11] -mr-2.5 -mt-2.5 shadow-inner" />
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono" style={{ overscrollBehavior: "contain" }}>
              {/* Timestamp Ribbon */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 border border-black/[0.04]">
                <span className="text-[9.5px] uppercase tracking-wider text-[#8E92A2] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Logged Date
                </span>
                <span className="font-bold text-[#0C0D11]">
                  {formatDateTime(selectedOrder.createdAt).date} • {formatDateTime(selectedOrder.createdAt).time}
                </span>
              </div>

              {/* Origin Badge */}
              {selectedOrder.isManualEntry ||
              selectedOrder.orderNumber?.startsWith("ROC-POS") ||
              selectedOrder.orderNumber?.startsWith("ROC-MAN") ? (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10.5px]">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span>Direct Boutique / Counter Sale</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-sans">
                    Hand-entered at the boutique POS desk. Handed over directly on premises.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-[#3B7BF6] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10.5px]">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Online Storefront Order</span>
                  </div>
                  <p className="text-[10px] text-blue-700 font-sans">
                    Patron placed order through online digital storefront rails.
                  </p>
                </div>
              )}

              {/* Garment Breakdown */}
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-3">
                <span className="text-[9px] uppercase tracking-wider text-[#8E92A2] block font-bold">
                  Ordered Silhouettes
                </span>

                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative w-13 h-16 rounded-xl overflow-hidden bg-white border border-black/[0.06] shrink-0">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[#8E92A2]">
                        Fit: {item.size || "Free Size"} • Qty: {item.quantity || 1}
                      </p>
                      <p className="font-black text-xs text-[#0C0D11]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Patron & Destination */}
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-2.5">
                <span className="text-[9px] uppercase tracking-wider text-[#8E92A2] block font-bold">
                  Client & Settlement Profile
                </span>

                <div className="space-y-1.5">
                  <div className="flex justify-between pb-1 border-b border-black/[0.04]">
                    <span className="text-[#8E92A2]">Patron</span>
                    <span className="font-bold text-[#0C0D11]">
                      {selectedOrder.shippingAddress?.fullName || "Guest Patron"}
                    </span>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-black/[0.04]">
                    <span className="text-[#8E92A2]">Contact</span>
                    <span className="text-[#0C0D11]">
                      {selectedOrder.shippingAddress?.phone || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-black/[0.04]">
                    <span className="text-[#8E92A2]">Destination</span>
                    <span className="text-[#0C0D11]">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                    </span>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-black/[0.04]">
                    <span className="text-[#8E92A2]">Settlement Mode</span>
                    <span className="font-bold uppercase text-emerald-700">
                      {selectedOrder.paymentMethod} • {selectedOrder.paymentStatus}
                    </span>
                  </div>

                  {selectedOrder.shippingAddress?.street && (
                    <div className="pt-1">
                      <span className="text-[#8E92A2] block pb-0.5">Notes / Alterations:</span>
                      <p className="font-sans text-[11px] text-[#4A4D59] bg-white p-2.5 rounded-xl border border-black/[0.04]">
                        {selectedOrder.shippingAddress.street}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Settlement Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0C0D11] text-white">
                <span className="font-serif font-black uppercase text-xs">Total Settlement</span>
                <span className="font-mono font-black text-lg text-emerald-400">
                  ₹{Number(selectedOrder.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-black/[0.06] grid grid-cols-2 gap-2 bg-white shrink-0">
              <Link
                href={`/account/orders/${selectedOrder.orderNumber}/invoice`}
                target="_blank"
                className="py-3 rounded-full bg-[#FAFAFC] hover:bg-neutral-100 text-[#0C0D11] border border-black/[0.07] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#3B7BF6]" />
                <span>Invoice</span>
              </Link>

              <button
                type="button"
                onClick={() => advanceStatus(selectedOrder._id, selectedOrder.orderStatus)}
                disabled={updatingId === selectedOrder._id || selectedOrder.orderStatus === "delivered"}
                className="py-3 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <span>Advance</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  
}