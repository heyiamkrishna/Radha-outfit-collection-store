import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";
import InvoicePrintButton from "./InvoicePrintButton";
import ProductBarcode from "./ProductBarcode";
import OrderQRCode from "./OrderQRCode";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  AlertCircle,
  Sparkles,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Tax Certificate & Invoice | Radha Outfit Collection",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderInvoicePage({ params }) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id;

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const userPayload = await getSessionUser();
  if (!userPayload) {
    redirect(`/login?redirect=/account/orders/${orderId}/invoice`);
  }

  await connectToDatabase();

  const queryConditions = [{ orderNumber: orderId }];
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    queryConditions.push({ _id: new mongoose.Types.ObjectId(orderId) });
  }

  const isAdmin = userPayload.role === "admin" || userPayload.role === "superadmin";

  const accessFilter = isAdmin
    ? {}
    : {
        $or: [
          { user: userPayload.userId || userPayload.id },
          { "shippingAddress.email": userPayload.email },
        ],
      };

  const order = await Order.findOne({
    $and: [{ $or: queryConditions }, accessFilter],
  }).lean();

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-black uppercase text-[#0C0D11]">
          Document Inaccessible
        </h2>
        <p className="text-xs text-[#8E92A2] max-w-sm leading-relaxed font-mono">
          We could not locate this archive or you lack authorized credentials to view it.
        </p>
        <Link
          href="/account"
          className="px-6 py-3 rounded-full bg-[#0C0D11] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-xs"
        >
          Return to Client Portal
        </Link>
      </div>
    );
  }

  const subtotal = Number(order.subtotal || 0);
  const totalAmount = Number(order.totalAmount || 0);
  const shippingCost =
    totalAmount > subtotal ? totalAmount - subtotal : Number(order.shippingFee || 0);

  // Approximate 12% Indian Apparel GST split
  const gstRate = 0.12;
  const taxableValue = subtotal > 0 ? Math.round(subtotal / (1 + gstRate)) : totalAmount;
  const gstAmount = subtotal > 0 ? subtotal - taxableValue : 0;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden !important;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible !important;
            }
            #printable-invoice {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 196mm !important;
              max-width: 196mm !important;
              height: 280mm !important;
              max-height: 280mm !important;
              margin: 8mm 7mm !important;
              padding: 6mm 8mm !important;
              box-sizing: border-box !important;
              border: 1px solid #1A1C23 !important;
              border-radius: 12px !important;
              background: #ffffff !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
            nav, footer, .print\\:hidden {
              display: none !important;
            }
          }
        `,
        }}
      />

      <div className="min-h-screen bg-[#F7F8FA] py-6 sm:py-12 px-3 sm:px-6 print:bg-white print:p-0 print:m-0">
        {/* Top Control Bar */}
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-5 print:hidden">
          <Link
            href={isAdmin ? "/admin/orders" : "/account"}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAdmin ? "Admin Desk" : "Account Wardrobe"}</span>
          </Link>

          <InvoicePrintButton orderNumber={order.orderNumber} />
        </div>

        {/* ── BESPOKE CERTIFICATE SHEET ── */}
        <div
          id="printable-invoice"
          className="relative max-w-4xl mx-auto bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-[#E2E6EF] text-[#0C0D11] space-y-4 shadow-[0_25px_70px_-20px_rgba(12,13,17,0.07)] overflow-hidden"
          style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
        >
          {/* Outer Inset Double Border Aesthetic */}
          <div className="absolute inset-2 sm:inset-3 border border-[#E8EBF2] rounded-[22px] sm:rounded-[30px] pointer-events-none z-0 opacity-70" />

          {/* Watermark Crest */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] text-[220px] font-serif font-black z-0 leading-none">
            ROC
          </div>

          {/* 1. Header & Brand Block */}
          <header className="relative z-10 pb-4 border-b border-[#E8EBF2]">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0C0D11] text-white text-[8.5px] font-mono font-black uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>Tax Invoice & Certificate of Authenticity</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight text-[#0C0D11] leading-none pt-0.5">
                  Radha Outfit Collection
                </h1>
                <p className="text-[9.5px] text-[#8E92A2] font-mono leading-relaxed pt-0.5">
                  M/S RADHA OUTFIT COLLECTION PVT. LTD. • GSTIN: 07AAACR0926K1ZP
                  <br />
                  Atelier Suite 4B, Barakhamba Road, Connaught Place, New Delhi 110001
                </p>
              </div>

              {/* QR Verification and Invoice Number */}
              <div className="flex items-center gap-3 self-end sm:self-auto text-right">
                <div className="bg-[#FAFBFD] p-1.5 rounded-xl border border-[#E8EBF2] shrink-0">
                  <OrderQRCode
                    orderNumber={order.orderNumber}
                    orderId={order._id?.toString()}
                    baseUrl={baseUrl}
                  />
                </div>

                <div className="space-y-0.5 font-mono text-right">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#8E92A2] block">
                    Tax Document Ref
                  </span>
                  <p className="text-xs sm:text-sm font-black text-[#0C0D11] tracking-tight">
                    INV-{order.orderNumber}
                  </p>
                  <div className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{order.paymentStatus === "paid" ? "Settled" : "Doorstep COD"}</span>
                  </div>
                  <p className="text-[9px] text-[#8E92A2]">Dated: {orderDate}</p>
                </div>
              </div>
            </div>
          </header>

          {/* 2. Destination & Settlement Meta Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
            {/* Consignee */}
            <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E8EBF2] space-y-1">
              <div className="flex items-center justify-between text-[#8E92A2] text-[8.5px] font-mono uppercase font-bold">
                <span className="flex items-center gap-1 text-[#3B7BF6]">
                  <MapPin className="w-2.5 h-2.5" /> Billed & Shipped To
                </span>
                <span>POS: {order.shippingAddress?.state || "07-Delhi"}</span>
              </div>
              <div>
                <h3 className="font-serif font-black text-xs uppercase text-[#0C0D11]">
                  {order.shippingAddress?.fullName}
                </h3>
                <p className="text-[#4A4D59] text-[9.5px] leading-snug mt-0.5">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                </p>
              </div>
              <div className="pt-1 flex flex-wrap items-center gap-3 text-[9px] font-mono text-[#8E92A2]">
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-[#0C0D11]" /> +91 {order.shippingAddress?.phone}
                </span>
                {order.shippingAddress?.email && (
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-2.5 h-2.5 text-[#0C0D11]" /> {order.shippingAddress?.email}
                  </span>
                )}
              </div>
            </div>

            {/* Settlement & Logistics */}
            <div className="p-3.5 rounded-xl bg-[#FAFBFD] border border-[#E8EBF2] space-y-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8E92A2] text-[8.5px] font-mono uppercase font-bold">
                <span className="flex items-center gap-1 text-[#0C0D11]">
                  <CreditCard className="w-2.5 h-2.5" /> Payment & Dispatch
                </span>
                <span className="text-emerald-700 font-bold">Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[#8E92A2] block text-[8px] uppercase font-mono">
                    Payment Method
                  </span>
                  <strong className="font-mono font-bold uppercase text-[#0C0D11]">
                    {order.paymentMethod === "cod" ? "Doorstep COD" : "Online UPI / Card"}
                  </strong>
                </div>
                <div>
                  <span className="text-[#8E92A2] block text-[8px] uppercase font-mono">
                    Dispatch Status
                  </span>
                  <strong className="font-mono font-bold uppercase text-[#3B7BF6]">
                    {order.orderStatus?.replace("_", " ")}
                  </strong>
                </div>
              </div>
              <div className="text-[8.5px] font-mono text-[#8E92A2] flex items-center justify-between pt-1 border-t border-[#E8EBF2]">
                <span>Logistics Partner:</span>
                <span className="font-bold text-[#0C0D11]">BlueDart Express Courier</span>
              </div>
            </div>
          </section>

          {/* 3. Garments Manifest Table */}
          <section className="relative z-10">
            <div className="overflow-hidden rounded-xl border border-[#E8EBF2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFBFD] border-b border-[#E8EBF2] font-mono text-[8.5px] uppercase text-[#8E92A2]">
                  <tr>
                    <th className="py-2 pl-3 font-bold">Garment Silhouette & Barcode</th>
                    <th className="py-2 px-2 text-center font-bold">HSN</th>
                    <th className="py-2 px-2 text-center font-bold">Size</th>
                    <th className="py-2 px-2 text-center font-bold">Qty</th>
                    <th className="py-2 px-2 text-right font-bold">Rate</th>
                    <th className="py-2 pr-3 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F6]">
                  {order.items?.map((item, idx) => {
                    const barcodeValue = String(item.product || item._id || order.orderNumber);
                    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                    return (
                      <tr key={idx} className="hover:bg-[#FAFAFC]">
                        <td className="py-2 pl-3 pr-2">
                          <p className="font-serif font-black text-[11px] uppercase text-[#0C0D11]">
                            {item.name}
                          </p>
                          <p className="text-[8.5px] font-mono text-[#8E92A2]">
                            SKU: ROC-{(item.sku || item.slug || "GARMENT").slice(0, 10).toUpperCase()}
                          </p>
                          <div className="pt-0.5 opacity-80 scale-90 origin-left">
                            <ProductBarcode value={barcodeValue} />
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center align-top pt-2.5 font-mono text-[9px] text-[#8E92A2]">
                          6204
                        </td>
                        <td className="py-2 px-2 text-center align-top pt-2.5 font-mono text-[9.5px] font-bold">
                          {item.size || "M"}
                        </td>
                        <td className="py-2 px-2 text-center align-top pt-2.5 font-mono font-bold text-[#0C0D11]">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-right align-top pt-2.5 font-mono text-[#4A4D59] text-[10px]">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 pr-3 text-right align-top pt-2.5 font-mono font-black text-[#0C0D11] text-[10px]">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. GST Breakdown & Final Settlement */}
          <section className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-1 text-xs relative z-10">
            {/* Atelier Covenant & Security Assurance */}
            <div className="max-w-xs space-y-1 font-mono text-[8.5px] text-[#8E92A2] leading-relaxed">
              <span className="font-bold text-[#0C0D11] uppercase tracking-wider block text-[9px]">
                Atelier Guarantee & Exchange
              </span>
              <p>
                Every handcrafted silhouette carries our 7-day doorstep exchange warranty. Garments must
                remain in unworn condition with all original security seals intact.
              </p>
              <p className="text-[8px] pt-0.5 border-t border-[#E8EBF2]">
                Computer-generated electronic tax invoice compliant with Indian GST laws.
              </p>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-60 p-3 rounded-xl bg-[#FAFBFD] border border-[#E8EBF2] space-y-1 text-[9.5px]">
              <div className="flex justify-between text-[#4A4D59]">
                <span>Taxable Value:</span>
                <span className="font-mono font-bold text-[#0C0D11]">
                  ₹{taxableValue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[#8E92A2] text-[9px]">
                <span>CGST (6%):</span>
                <span className="font-mono">₹{cgst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#8E92A2] text-[9px]">
                <span>SGST (6%):</span>
                <span className="font-mono">₹{sgst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#4A4D59]">
                <span>Express Courier:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {shippingCost === 0 ? "COMPLIMENTARY" : `₹${shippingCost.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between text-xs font-black text-[#0C0D11] pt-1 border-t border-[#E8EBF2]">
                <span className="uppercase tracking-wide text-[10px]">Grand Total:</span>
                <span className="font-mono text-xs font-black">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </section>

          {/* 5. Footer Signatory & Wax Stamp Aesthetic */}
          <footer className="pt-3 border-t border-[#E8EBF2] flex items-center justify-between text-[8.5px] text-[#8E92A2] relative z-10">
            <div>
              <p className="font-serif font-black uppercase text-[9.5px] text-[#0C0D11]">
                Radha Outfit Collection
              </p>
              <p>© {new Date().getFullYear()} ROC Central Atelier. Official Record.</p>
            </div>

            {/* Formal Signature & Wax Seal */}
            <div className="flex items-center gap-3 text-right">
              {/* Artisanal Wax Seal Badge */}
              <div className="w-9 h-9 rounded-full border border-[#0C0D11] bg-[#0C0D11] text-white flex items-center justify-center shadow-xs">
                <span className="font-serif font-black text-[10px] tracking-tight">ROC</span>
              </div>

              <div className="space-y-0.5">
                <div className="inline-block border-b border-[#0C0D11] pb-0.5 px-3">
                  <span className="font-serif italic text-xs text-[#0C0D11] tracking-wider">
                    Radha Outfit Collection
                  </span>
                </div>
                <p className="uppercase tracking-widest font-mono text-[7.5px] text-[#8E92A2] block">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}