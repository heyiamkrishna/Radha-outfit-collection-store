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
  Globe,
  Tag,
  Receipt,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // ── DATE FILTER STATES ──
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/admin/orders?limit=300", { cache: "no-store" });
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

  // ── COMBINED FILTER: SEARCH, CHANNEL & DATE ──
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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

      let matchesStatus = true;
      if (statusFilter === "manual-pos") matchesStatus = isManual;
      else if (statusFilter === "online") matchesStatus = !isManual;
      else if (statusFilter !== "all") {
        matchesStatus = o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
      }

      const orderDate = new Date(o.createdAt);
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = orderDate >= startOfToday;
      } else if (dateFilter === "yesterday") {
        matchesDate = orderDate >= startOfYesterday && orderDate < startOfToday;
      } else if (dateFilter === "last7") {
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === "thisMonth") {
        matchesDate = orderDate >= startOfMonth;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && orderDate >= s;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && orderDate <= e;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchQuery, statusFilter, dateFilter, startDate, endDate]);

  // ── REFINED FINANCIAL METRICS (LIVE FOR ACTIVE WINDOW) ──
  const grossRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const manualOrders = useMemo(() => {
    return filteredOrders.filter(
      (o) =>
        o.isManualEntry ||
        o.orderNumber?.startsWith("ROC-POS") ||
        o.orderNumber?.startsWith("ROC-MAN")
    );
  }, [filteredOrders]);

  const manualCount = manualOrders.length;
  const manualRevenue = useMemo(() => {
    return manualOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [manualOrders]);

  const onlineRevenue = grossRevenue - manualRevenue;

  const cashOrders = useMemo(() => {
    return filteredOrders.filter((o) => {
      const m = o.paymentMethod?.toLowerCase() || "";
      return m === "cash" || m === "cod" || m.includes("cash");
    });
  }, [filteredOrders]);

  const cashRevenue = useMemo(() => {
    return cashOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [cashOrders]);

  const averageTicket =
    filteredOrders.length > 0 ? Math.round(grossRevenue / filteredOrders.length) : 0;

  // ── TOP PERFORMING SILHOUETTES LEADERBOARD ──
  const productSellStats = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
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
      .slice(0, 4);
  }, [filteredOrders]);

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
    <div className="relative min-h-screen bg-[#FAFBFD] text-[#0C0D11] pt-3 sm:pt-6 md:pt-8 pb-32 px-3 sm:px-6 md:px-10 lg:px-12 max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-x-hidden selection:bg-[#0C0D11] selection:text-white">
      
      {/* ── Haute Couture Ambient Radial Background ── */}
      <div className="pointer-events-none fixed top-[-5%] left-1/3 w-[650px] h-[650px] bg-gradient-to-br from-indigo-100/30 via-rose-50/15 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 right-0 w-[550px] h-[550px] bg-gradient-to-tl from-blue-100/25 via-amber-50/15 to-transparent rounded-full blur-3xl -z-10" />

      {/* ── 1. EDITORIAL HEADER & METRIC SUMMARY ── */}
      <header className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#3B7BF6]">
                Atelier Fulfillment Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight text-[#0C0D11]">
              Orders & Boutique POS
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.07] hover:border-[#0C0D11] text-[#0C0D11] transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/admin"
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#0C0D11] text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all"
            >
              Console
            </Link>
          </div>
        </div>

        {/* ── 2. EXECUTIVE METRIC TILES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Tile 1: Gross Sales */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-2 hover:border-black/[0.12] transition-colors">
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Audited Gross
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-mono font-black text-[#0C0D11] truncate">
              ₹{grossRevenue.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center justify-between text-[8.5px] font-mono text-emerald-700 font-bold uppercase">
              <span>{filteredOrders.length} Entries</span>
              <span>100% Settled</span>
            </div>
          </div>

          {/* Tile 2: Boutique POS */}
          <div
            onClick={() => setStatusFilter("manual-pos")}
            className="p-4 sm:p-5 rounded-[26px] bg-emerald-50/50 backdrop-blur-md border border-emerald-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-2 hover:border-emerald-600 cursor-pointer transition-all active:scale-98"
          >
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Boutique POS
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-mono font-black text-emerald-950 truncate">
              ₹{manualRevenue.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center justify-between text-[8.5px] font-mono text-emerald-700 font-bold uppercase">
              <span>{manualCount} Counter Invoices</span>
              <span>
                {grossRevenue > 0 ? Math.round((manualRevenue / grossRevenue) * 100) : 0}% Share
              </span>
            </div>
          </div>

          {/* Tile 3: Online Storefront */}
          <div
            onClick={() => setStatusFilter("online")}
            className="p-4 sm:p-5 rounded-[26px] bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-2 hover:border-[#0C0D11] cursor-pointer transition-all active:scale-98"
          >
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Digital Web
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3B7BF6] flex items-center justify-center border border-blue-100/60">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-mono font-black text-[#0C0D11] truncate">
              ₹{onlineRevenue.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center justify-between text-[8.5px] font-mono text-[#3B7BF6] font-bold uppercase">
              <span>{filteredOrders.length - manualCount} Web Dispatches</span>
              <span>Online Rails</span>
            </div>
          </div>

          {/* Tile 4: Average Ticket Size */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-2 hover:border-black/[0.12] transition-colors">
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[8.5px] sm:text-[9.5px] font-mono uppercase font-bold tracking-wider">
                Average Ticket
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-mono font-black text-[#0C0D11] truncate">
              ₹{averageTicket.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center justify-between text-[8.5px] font-mono text-[#8E92A2]">
              <span>Cash: ₹{cashRevenue.toLocaleString("en-IN")}</span>
              <span>Per Patron</span>
            </div>
          </div>

        </div>

        {/* ── 3. PRODUCT-WISE SALES LEADERBOARD ── */}
        {productSellStats.length > 0 && (
          <div className="p-4 sm:p-6 rounded-[30px] bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#3B7BF6]" />
                <h3 className="font-serif font-black uppercase text-xs sm:text-sm tracking-tight text-[#0C0D11]">
                  Top Silhouette Sales Matrix (Active Period)
                </h3>
              </div>
              <span className="text-[9.5px] font-mono text-[#8E92A2] uppercase tracking-wider">
                Revenue Share Index
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {productSellStats.map((item, idx) => {
                const percentOfGross =
                  grossRevenue > 0 ? Math.round((item.revenue / grossRevenue) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-[#FAFAFC] border border-black/[0.05] flex items-center gap-3.5 hover:border-black/[0.12] transition-colors"
                  >
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-white border border-black/[0.06] shrink-0 shadow-2xs">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                      <span className="absolute top-1 left-1 px-1 rounded bg-[#0C0D11]/80 text-white font-mono text-[7.5px] font-bold">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1 font-mono">
                      <p className="font-serif font-bold uppercase text-xs text-[#0C0D11] truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#8E92A2]">
                        <span>{item.quantity} Sold</span>
                        <span className="text-emerald-700 font-bold">{percentOfGross}% share</span>
                      </div>
                      <div className="w-full bg-neutral-200/80 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-[#0C0D11] h-1 rounded-full"
                          style={{ width: `${Math.min(100, percentOfGross)}%` }}
                        />
                      </div>
                      <p className="text-xs font-black text-[#0C0D11] pt-0.5">
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

      {/* ── 4. CONTROLS CONCIERGE: SEARCH & DATE FILTER ISLAND ── */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-[28px] border border-black/[0.06] shadow-2xs space-y-3.5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, Patron, or Contact..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-full bg-[#FAFAFC] border border-black/[0.07] text-xs font-mono outline-none focus:bg-white focus:border-[#0C0D11] transition-all shadow-2xs"
            />
          </div>

          {/* Quick Date Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "last7", label: "Last 7 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "custom", label: "Custom Range", icon: Calendar },
            ].map((preset) => {
              const active = dateFilter === preset.id;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDateFilter(preset.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                    active
                      ? "bg-[#0C0D11] text-white shadow-xs scale-102"
                      : "bg-[#FAFAFC] text-[#4A4D59] border border-black/[0.06] hover:bg-white hover:border-black/20"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 text-amber-500" />}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Picker Drawer */}
{/* ── LUXURY BESPOKE DATE SELECTION CONCIERGE ── */}
{dateFilter === "custom" && (
  <div className="p-3.5 sm:p-4 rounded-[22px] bg-gradient-to-r from-[#FAFAFC] via-white to-[#FAFAFC] border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
    
    {/* Left Label */}
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#3B7BF6] flex items-center justify-center border border-blue-100/70 shadow-2xs">
        <Calendar className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] block">
          Custom Ledger Period
        </span>
        <span className="text-[8.5px] font-mono text-[#8E92A2]">
          Filter orders by audit timeline
        </span>
      </div>
    </div>

    {/* Center Pickers */}
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      
      {/* FROM DATE */}
      <div className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] hover:border-[#0C0D11] shadow-2xs focus-within:border-[#0C0D11] focus-within:ring-2 focus-within:ring-black/5 transition-all">
        <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] group-hover:text-[#0C0D11] transition-colors">
          From
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-transparent text-xs font-mono text-[#0C0D11] font-semibold outline-none cursor-pointer scheme-light selection:bg-neutral-200"
        />
      </div>

      <span className="text-[10px] font-mono font-bold text-neutral-300">
        →
      </span>

      {/* TO DATE */}
      <div className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] hover:border-[#0C0D11] shadow-2xs focus-within:border-[#0C0D11] focus-within:ring-2 focus-within:ring-black/5 transition-all">
        <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-[#8E92A2] group-hover:text-[#0C0D11] transition-colors">
          To
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-transparent text-xs font-mono text-[#0C0D11] font-semibold outline-none cursor-pointer scheme-light selection:bg-neutral-200"
        />
      </div>

      {/* ACTIVE DATE CHIP OR CLEAR */}
      {(startDate || endDate) && (
        <button
          type="button"
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 text-[9.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <X className="w-3 h-3" />
          <span>Reset Window</span>
        </button>
      )}

    </div>
  </div>
)}

        {/* Channel / Status Filter Navigation Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-black/[0.04] pt-2.5">
          {[
            { id: "all", label: `All Orders (${filteredOrders.length})` },
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9.5px] font-mono uppercase font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
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

      {/* ── 5. TRANSACTIONS STREAM WITH EXACT TIMESTAMP ── */}
      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-3 bg-white/80 rounded-[32px] border border-black/[0.06]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C0D11]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#8E92A2]">
            Synchronizing Records with Cloud Vault...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-24 text-center bg-white/80 rounded-[32px] border border-dashed border-black/[0.08] space-y-2.5">
          <Receipt className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-serif font-black uppercase text-sm sm:text-base text-[#0C0D11]">
            No Orders In This View
          </h3>
          <p className="text-xs font-mono text-[#8E92A2] max-w-sm mx-auto">
            Try adjusting your search query, switching filter tabs, or clearing your date range.
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
                    <div className="relative w-12 h-15 rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0 shadow-2xs">
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
                      className="py-2.5 rounded-xl bg-[#0C0D11] text-white text-[10px] font-mono font-bold uppercase disabled:opacity-40 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      {o.orderStatus === "delivered" ? "Delivered ✓" : "Advance State →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="py-2.5 rounded-xl bg-white border border-black/[0.08] text-[#0C0D11] text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#3B7BF6]" /> Inspect Dossier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Matrix Register (>= 640px) */}
          <div className="hidden sm:block bg-white/95 backdrop-blur-md rounded-[32px] border border-black/[0.06] overflow-hidden shadow-xs">
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
                            {o.shippingAddress?.phone || "No contact"} •{" "}
                            {o.shippingAddress?.city || "Counter"}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0 shadow-2xs">
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

      {/* ── 6. HAUTE COUTURE INSPECTION DOSSIER (SERRATED SLIDING TICKET) ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex justify-end overflow-hidden">
          <div
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-sm transition-opacity duration-200"
          />

          <div className="relative z-10 w-full sm:max-w-md bg-white h-full shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Top Vault Header */}
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
            <div
              className="p-6 overflow-y-auto space-y-4 text-xs font-mono"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* Timestamp Ribbon */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 border border-black/[0.04]">
                <span className="text-[9.5px] uppercase tracking-wider text-[#8E92A2] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Logged Date
                </span>
                <span className="font-bold text-[#0C0D11]">
                  {formatDateTime(selectedOrder.createdAt).date} •{" "}
                  {formatDateTime(selectedOrder.createdAt).time}
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
                    <div className="relative w-13 h-16 rounded-xl overflow-hidden bg-white border border-black/[0.06] shrink-0 shadow-2xs">
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
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}
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
                      <span className="text-[#8E92A2] block pb-0.5">
                        Notes / Alterations:
                      </span>
                      <p className="font-sans text-[11px] text-[#4A4D59] bg-white p-2.5 rounded-xl border border-black/[0.04]">
                        {selectedOrder.shippingAddress.street}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Settlement Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0C0D11] text-white">
                <span className="font-serif font-black uppercase text-xs">
                  Total Settlement
                </span>
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
                disabled={
                  updatingId === selectedOrder._id ||
                  selectedOrder.orderStatus === "delivered"
                }
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