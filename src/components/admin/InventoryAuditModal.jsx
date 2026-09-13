"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, History, Loader2, Package, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function InventoryAuditModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/inventory?limit=50")
      .then((res) => (res.ok ? res.json() : { transactions: [] }))
      .then((data) => {
        setLogs(data.transactions || data.logs || []);
      })
      .catch((err) => {
        console.error("Audit log error:", err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0C0D11]/75 backdrop-blur-md"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-[28px] sm:rounded-[32px] border border-black/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-200"
        style={{ maxHeight: "88dvh" }}
      >
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3B7BF6] flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black uppercase tracking-tight text-[#0C0D11] text-sm sm:text-base">
                Inventory Audit Register
              </h3>
              <p className="text-[10px] text-[#8E92A2] font-mono">
                Real-time stock variance & adjustment ledger
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-[#8E92A2] hover:text-[#0C0D11] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div
          className="p-4 sm:p-6 overflow-y-auto space-y-3"
          style={{ overscrollBehavior: "contain" }}
        >
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#0C0D11]" />
              <span className="text-xs font-mono uppercase text-[#8E92A2]">Reading Ledger...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-[#8E92A2] bg-[#FAFAFC] rounded-2xl border border-dashed border-black/[0.08]">
              No inventory adjustments on record.
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {logs.map((log, idx) => {
                const isPositive = log.type === "STOCK_IN" || Number(log.quantity) > 0;
                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {log.type || (isPositive ? "STOCK_IN" : "STOCK_OUT")}
                        </span>
                        <span className="font-mono font-black text-[#0C0D11] truncate">
                          {log.sku || log.productName || "GARMENT"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#8E92A2] truncate">
                        {log.reason || "Manual Dashboard Adjustment"}
                      </p>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span
                        className={`text-sm font-black block ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : "-"}
                        {Math.abs(Number(log.quantity) || 1)}
                      </span>
                      <span className="text-[9.5px] text-[#8E92A2] block">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}