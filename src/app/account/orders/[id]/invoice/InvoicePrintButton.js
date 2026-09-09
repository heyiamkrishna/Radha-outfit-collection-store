"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors shadow-sm cursor-pointer active:scale-95"
    >
      <Printer className="w-3.5 h-3.5" /> Print Invoice
    </button>
  );
}