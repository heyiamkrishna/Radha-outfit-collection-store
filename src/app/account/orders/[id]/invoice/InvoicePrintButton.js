"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";

export default function InvoicePrintButton({ orderNumber }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;

    try {
      setDownloading(true);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const targetWidth = pdfWidth - margin * 2;
      const calculatedHeight = (canvas.height * targetWidth) / canvas.width;
      const targetHeight = Math.min(calculatedHeight, pdfHeight - margin * 2);

      pdf.addImage(imgData, "JPEG", margin, margin, targetWidth, targetHeight, "", "FAST");

      const filename = `ROC-Invoice-${orderNumber || "ORDER"}.pdf`;
      pdf.save(filename);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("Direct PDF generation failed, launching print dialog:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      disabled={downloading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer select-none disabled:opacity-60 ${
        downloaded
          ? "bg-emerald-600 text-white"
          : "bg-[#0C0D11] hover:bg-[#3B7BF6] text-white"
      }`}
    >
      {downloading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : downloaded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
          <span>Downloaded PDF</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>Download Invoice</span>
        </>
      )}
    </button>
  );
}