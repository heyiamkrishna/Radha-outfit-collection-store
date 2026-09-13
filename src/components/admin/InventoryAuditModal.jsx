"use client";

import { useState, useEffect } from "react";
import { X, History, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

export default function InventoryAuditModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory?limit=30");
      const data = await res.json();
      if (res.ok) setLogs(data.transactions || []);
    } catch (err) {
      console.error("Failed to load inventory logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0D11]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8EBF2] shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0F2F6] pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#F4F5F9] flex items-center justify-center">
              <History className="w-4 h-4 text-[#3B7BF6]" />
            </span>
            <div>
              <h3 className="font-serif font-black text-base uppercase tracking-tight text-[#0C0D11]">
                Stock Mutation Audit Log
              </h3>
              <p className="text-[11px] text-[#8E92A2] font-mono">
                Immutable ledger of all Stock-In, Stock-Out, and QR adjustments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              className="p-2 rounded-full hover:bg-[#F4F5F9] text-[#0C0D11] transition-colors cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#8E92A2] hover:text-[#0C0D11] hover:bg-[#F4F5F9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ledger List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F6] pr-1">
          {logs.length === 0 && !loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#8E92A2]">
              No inventory transactions recorded yet.
            </div>
          ) : (
            logs.map((tx) => {
              const isPositive = (tx.quantityChange || 0) > 0;
              return (
                <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {tx.type}
                      </span>
                      <span className="font-bold text-[#0C0D11]">
                        {tx.productId?.name || tx.sku || "Garment Silhouette"}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E92A2]">
                      {tx.reason} • {new Date(tx.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-sm font-black ${
                        isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                    </span>
                    <p className="text-[9px] text-[#8E92A2]">{tx.performedBy || "Admin"}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}