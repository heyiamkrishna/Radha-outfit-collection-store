"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Layers,
  Sliders,
  IndianRupee,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Scan,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Package,
} from "lucide-react";
import BannerManagerModal from "@/components/admin/BannerManagerModal";
import AddProductModal from "@/components/admin/AddProductModal";
import QRScannerModal from "@/components/admin/qr/QRScannerModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const safeJsonParse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: response.status === 401 || response.status === 403
          ? "Admin authentication required. Session may be expired."
          : `Server returned non-JSON response (${response.status})`,
      };
    }
    try {
      const parsed = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data: parsed,
        error: parsed?.error || (!response.ok ? `Request failed (${response.status})` : null),
      };
    } catch {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: "Malformed response received from server.",
      };
    }
  };

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [overviewRes, productsRes] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/products?limit=50", { cache: "no-store" }),
      ]);

      const overviewResult = await safeJsonParse(overviewRes);
      const productsResult = await safeJsonParse(productsRes);

      if (!overviewResult.ok) {
        if (overviewResult.status === 401 || overviewResult.status === 403) {
          throw new Error("Admin privileges required. Please sign in with an administrative account.");
        }
        throw new Error(overviewResult.error || "Failed to load administrative overview.");
      }

      setData(overviewResult.data);
      setError("");

      if (productsResult.ok && productsResult.data?.products) {
        const critical = productsResult.data.products.filter(
          (p) => (p.stockCount ?? 0) <= 5
        );
        setLowStockProducts(critical);
      }
    } catch (err) {
      setError(err.message || "Failed to establish secure connection to admin services.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const resData = await safeJsonParse(res);
      if (!resData.ok) throw new Error(resData.error || "Failed to update banner state");
      fetchDashboardData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("Are you sure you want to remove this hero slider banner?")) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      const resData = await safeJsonParse(res);
      if (!resData.ok) throw new Error(resData.error || "Failed to delete banner");
      fetchDashboardData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const advanceOrderStatus = async (orderId, currentStatus) => {
    const nextStatusMap = {
      received: "processing",
      processing: "shipped",
      shipped: "delivered",
      delivered: "delivered",
    };
    const nextStatus = nextStatusMap[currentStatus] || "processing";

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: nextStatus }),
      });
      const resData = await safeJsonParse(res);
      if (resData.ok) fetchDashboardData(true);
    } catch (err) {
      console.error("Failed to advance status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0C0D11]" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#8E92A2]">
          Loading Atelier Intelligence...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
        <div className="p-8 bg-white border border-[#E8EBF2] rounded-[32px] text-center space-y-4 max-w-md shadow-xl animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-black uppercase text-base text-[#0C0D11]">
              Access Restricted
            </h3>
            <p className="text-xs text-[#8E92A2] mt-1">{error}</p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all text-center"
            >
              Sign In With Admin Token
            </Link>
            <button
              type="button"
              onClick={() => fetchDashboardData()}
              className="w-full py-2.5 rounded-full border border-[#E8EBF2] text-[#0C0D11] text-xs font-bold uppercase tracking-wider hover:bg-[#F4F5F9] transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, banners, recentOrders } = data || {
    metrics: { totalRevenue: 0, orderCount: 0, productCount: 0, bannerCount: 0 },
    banners: [],
    recentOrders: [],
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#0C0D11] pt-20 sm:pt-24 pb-28 px-3.5 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-8 sm:space-y-10 selection:bg-[#0C0D11] selection:text-white">
      {/* 1. Header & Command Bar */}
      <header className="border-b border-[#E8EBF2] pb-5 sm:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-[#3B7BF6]">
                Atelier Management Console
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#0C0D11] leading-tight">
              Radha Outfit Collection
            </h1>
          </div>

          {/* Mobile Refresh Icon */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="sm:hidden p-2.5 rounded-full bg-white border border-[#E8EBF2] active:scale-95 text-[#0C0D11] shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Adaptive Action Bar */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5">
          {/* Desktop Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="hidden sm:inline-flex p-2.5 rounded-full bg-white border border-[#E8EBF2] hover:border-[#0C0D11] text-[#0C0D11] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Overview"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Scan QR Trigger */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E8EBF2] hover:border-[#0C0D11] text-[#0C0D11] text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Scan className="w-4 h-4 text-[#3B7BF6]" />
            <span>Scan QR</span>
          </button>

          {/* Banner Manager Modal Trigger */}
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
            <BannerManagerModal onCreated={() => fetchDashboardData(true)} />
          </div>

          {/* Add Product Modal Trigger */}
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
            <AddProductModal onCreated={() => fetchDashboardData(true)} />
          </div>

          {/* Quick Nav Links */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/products"
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white border border-[#E8EBF2] hover:border-[#0C0D11] text-xs font-bold uppercase tracking-wider text-[#0C0D11] text-center transition-all shadow-xs active:scale-95"
            >
              Garments
            </Link>

            <Link
              href="/admin/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-sm text-center active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#3B7BF6]" />
              <span>Orders Desk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Executive Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border border-[#E8EBF2] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#8E92A2]">
            <span className="text-[10px] font-mono uppercase font-bold">Gross Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-2xl font-black font-mono truncate">
            ₹{(metrics.totalRevenue || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-wider block">
            Authoritative Ledger
          </span>
        </div>

        {/* Customer Orders */}
        <Link
          href="/admin/orders"
          className="group p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border border-[#E8EBF2] shadow-xs hover:border-[#3B7BF6] transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-[#8E92A2]">
            <span className="text-[10px] font-mono uppercase font-bold">Customer Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#3B7BF6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg sm:text-2xl font-black font-mono">{metrics.orderCount || 0}</p>
            <span className="text-[10px] font-mono text-[#3B7BF6] flex items-center gap-0.5">
              Fulfill <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Garments Catalog */}
        <Link
          href="/admin/products"
          className="group p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border border-[#E8EBF2] shadow-xs hover:border-[#0C0D11] transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-[#8E92A2]">
            <span className="text-[10px] font-mono uppercase font-bold">Catalog Silhouettes</span>
            <Layers className="w-4 h-4 text-[#0C0D11]" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg sm:text-2xl font-black font-mono">{metrics.productCount || 0}</p>
            <span className="text-[10px] font-mono text-[#8E92A2] flex items-center gap-0.5">
              Rails & QR <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Low Stock Warning or Active Banners */}
        {lowStockProducts.length > 0 ? (
          <div className="p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border border-rose-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-[10px] font-mono uppercase font-bold">Low Stock Radar</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-lg sm:text-2xl font-black font-mono text-rose-600">
              {lowStockProducts.length}
            </p>
            <span className="text-[9px] font-mono text-rose-500 font-bold uppercase block">
              Units ≤ 5 threshold
            </span>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-[22px] sm:rounded-[26px] bg-white border border-[#E8EBF2] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8E92A2]">
              <span className="text-[10px] font-mono uppercase font-bold">Active Banners</span>
              <Sliders className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-lg sm:text-2xl font-black font-mono">{metrics.bannerCount || 0}</p>
            <span className="text-[9px] font-mono text-[#8E92A2] uppercase block">
              Carousel Slides
            </span>
          </div>
        )}
      </div>

      {/* 3. Hero Carousel Banner Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8EBF2] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight">
              Homepage Hero Slides
            </h2>
            <p className="text-[11px] sm:text-xs text-[#8E92A2]">
              Live Flipkart-style peek slides displayed on your storefront
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#3B7BF6] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {banners.length} Active
          </span>
        </div>

        {banners.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-[28px] border border-dashed border-[#CBD5E1] space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#0C0D11]">
              No Custom Promotional Slides
            </p>
            <p className="text-[11px] text-[#8E92A2] max-w-md mx-auto">
              The storefront is currently generating fallback slides dynamically from your
              newest garments. Click &ldquo;Add Slider Banner&rdquo; to publish custom designs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-[24px] p-3.5 sm:p-4 border border-[#E8EBF2] shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="relative aspect-[2.2/1] w-full rounded-2xl overflow-hidden bg-[#F4F5F9]">
                    <Image
                      src={b.image}
                      alt={b.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        b.isActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-[#0C0D11]/80 text-white"
                      }`}
                    >
                      {b.isActive ? "Live on Store" : "Hidden"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-[#3B7BF6]">
                      {b.badge || "Exclusive Run"}
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-[#0C0D11] truncate">
                      {b.title}
                    </h3>
                    <p className="text-[11px] text-[#8E92A2] truncate">
                      {b.subtitle || "No subtitle provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F0F2F6] pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleBannerStatus(b._id, b.isActive)}
                    className="flex items-center gap-1.5 font-bold cursor-pointer text-[#0C0D11] hover:text-[#3B7BF6] transition-colors"
                  >
                    {b.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{b.isActive ? "Displayed" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBanner(b._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Recent Dispatches Desk */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EBF2] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight">
              Recent Client Dispatches
            </h2>
            <p className="text-[11px] sm:text-xs text-[#8E92A2]">
              Latest transactions and client orders placed on storefront
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#3B7BF6] hover:underline self-start sm:self-auto"
          >
            <span>View All Orders Desk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[24px] border border-dashed border-[#CBD5E1] text-xs font-mono text-[#8E92A2]">
            No client orders placed yet.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mobile Stacked Touch Cards */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-[20px] p-4 border border-[#E8EBF2] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-2">
                    <span className="font-mono text-xs font-black text-[#0C0D11]">
                      {o.orderNumber}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#ECEEF2] text-[#0C0D11] font-bold">
                      {o.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-[#0C0D11]">
                        {o.shippingAddress?.fullName || "Guest Customer"}
                      </p>
                      <p className="text-[10px] text-[#8E92A2] font-mono">
                        {(o.paymentMethod || "COD").toUpperCase()} • {o.paymentStatus}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-[#0C0D11]">
                        ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => advanceOrderStatus(o._id, o.orderStatus)}
                      className="py-2 rounded-xl bg-[#0C0D11] text-white text-[10px] font-mono font-bold uppercase hover:bg-[#3B7BF6] transition-colors"
                    >
                      Advance State →
                    </button>
                    <Link
                      href="/admin/orders"
                      className="py-2 rounded-xl bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[#0C0D11] text-center text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block bg-white rounded-[28px] border border-[#E8EBF2] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FC] border-b border-[#E8EBF2] font-mono text-[10px] uppercase text-[#8E92A2]">
                    <tr>
                      <th className="p-4 pl-6">Order Ref</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Net Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Fulfillment</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F6]">
                    {recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-[#FAFAFC] transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-[#0C0D11]">
                          {o.orderNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#0C0D11]">
                            {o.shippingAddress?.fullName || "Guest Customer"}
                          </div>
                          <div className="text-[10px] text-[#8E92A2] font-mono">
                            {o.shippingAddress?.phone || "No contact"}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-black text-[#0C0D11]">
                          ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 uppercase font-mono text-[10px]">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.paymentMethod} • {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 uppercase font-mono text-[10px]">
                          <span className="px-2.5 py-1 rounded-full bg-[#ECEEF2] text-[#0C0D11] font-black border border-[#DFE2EB]">
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => advanceOrderStatus(o._id, o.orderStatus)}
                              className="px-3 py-1.5 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-[10px] font-mono font-bold uppercase transition-colors"
                            >
                              Advance →
                            </button>
                            <Link
                              href="/admin/orders"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C0D11]"
                            >
                              <Eye className="w-3 h-3" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Embedded Camera Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}