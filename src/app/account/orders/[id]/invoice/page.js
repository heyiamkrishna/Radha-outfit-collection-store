import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import InvoicePrintButton from "./InvoicePrintButton";
import ProductBarcode from "./ProductBarcode";
import OrderQRCode from "./OrderQRCode";
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Tax Invoice | Radha Outfit Collection",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderInvoicePage({ params }) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id;

  const cookieStore = await cookies();
  const token = cookieStore.get("roc_token")?.value;

  if (!token) {
    redirect(`/login?redirect=/account/orders/${orderId}/invoice`);
  }

  let userPayload = null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "atelier_super_secret_jwt_key_2026"
    );
    const { payload } = await jwtVerify(token, secret);
    userPayload = payload;
  } catch (_) {
    redirect(`/login?redirect=/account/orders/${orderId}/invoice`);
  }

  await connectToDatabase();

  // Dual lookup: MongoDB _id or Human-readable orderNumber (e.g. ROC-12345)
  const queryConditions = [{ orderNumber: orderId }];
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    queryConditions.push({ _id: new mongoose.Types.ObjectId(orderId) });
  }

  // Allow document owner OR site administrators
  const accessFilter =
    userPayload.role === "admin"
      ? {}
      : {
          $or: [
            { user: userPayload.userId },
            { "shippingAddress.email": userPayload.email },
          ],
        };

  const orderDoc = await Order.findOne({
    $and: [{ $or: queryConditions }, accessFilter],
  }).lean();

  if (!orderDoc) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0C0D11]">Invoice Not Found</h2>
        <p className="text-xs text-[#8E92A2] max-w-sm leading-relaxed">
          We could not locate this document or you do not have authorized credentials to view it.
        </p>
        <Link
          href="/account"
          className="px-6 py-3 rounded-full bg-[#0C0D11] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3B7BF6] transition-all shadow-xs"
        >
          Return to Account
        </Link>
      </div>
    );
  }

  const order = JSON.parse(JSON.stringify(orderDoc));

  const shippingCost =
    order.totalAmount > (order.subtotal || 0)
      ? order.totalAmount - (order.subtotal || 0)
      : 0;

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-6 sm:py-12 px-3 sm:px-6">
      {/* Floating Action Header (Hidden during Print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <Link
          href={userPayload.role === "admin" ? "/admin/orders" : "/account"}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E92A2] hover:text-[#0C0D11] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />{" "}
          {userPayload.role === "admin" ? "Admin Desk" : "Account Parcels"}
        </Link>

        <InvoicePrintButton />
      </div>

      {/* Main Luxury Paper Sheet */}
      <div className="relative max-w-4xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 md:p-16 shadow-[0_20px_70px_-20px_rgba(12,13,17,0.08)] border border-[#E8EBF2] print:border-none print:shadow-none print:p-0 print:m-0 text-[#0C0D11] space-y-10 sm:space-y-12 overflow-hidden">
        {/* Subtle Watermark Monogram Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] text-[180px] sm:text-[280px] font-serif font-black z-0">
          ROC
        </div>

        {/* Top Header Grid: Brand Info, QR Code, and Reference Meta */}
        <div className="relative z-10 pb-8 sm:pb-10 border-b border-[#F0F2F6]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* 1. Brand Identity */}
            <div className="space-y-2 max-w-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F5F9] text-[#3B7BF6] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Atelier Tax Invoice
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0C0D11] tracking-tight">
                Radha Outfit Collection
              </h1>
              <p className="text-xs text-[#8E92A2] leading-relaxed">
                Haute Couture & Curated Prêt-à-Porter
                <br />
                Atelier Suite 4B, Barakhamba Road, Connaught Place
                <br />
                New Delhi, Delhi 110001, India
              </p>
            </div>

            {/* 2. QR Code & Metadata Card Block */}
            <div className="flex flex-wrap sm:flex-nowrap items-center sm:items-stretch justify-start md:justify-end gap-5">
              <OrderQRCode orderNumber={order.orderNumber} orderId={order._id} />

              <div className="flex flex-col justify-between space-y-2 text-left md:text-right min-w-[170px]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A2]">
                    Invoice Reference
                  </span>
                  <p className="font-mono text-sm sm:text-base font-black text-[#0C0D11] break-all">
                    INV-{order.orderNumber}
                  </p>
                </div>

                <div className="inline-flex items-center md:justify-end gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit md:ml-auto">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Payment {order.paymentStatus}</span>
                </div>

                <div className="text-xs text-[#8E92A2] flex items-center md:justify-end gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#0C0D11] shrink-0" />
                  <span>{orderDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destination & Client Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 text-xs relative z-10">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#FBFBFC] border border-[#F0F2F6] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B7BF6] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Billed & Shipped Destination
            </span>
            <p className="font-extrabold text-sm text-[#0C0D11]">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-[#4A4D59] leading-relaxed">
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.postalCode}
            </p>
            <div className="pt-2 flex flex-col gap-1 text-[11px] text-[#8E92A2] font-mono">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#0C0D11]" /> +91 {order.shippingAddress?.phone}
              </span>
              {order.shippingAddress?.email && (
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#0C0D11]" /> {order.shippingAddress?.email}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-[#FBFBFC] border border-[#F0F2F6] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A2] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#0C0D11]" /> Payment & Dispatch Terms
              </span>
              <p className="text-xs text-[#4A4D59]">
                Method: <strong className="text-[#0C0D11] uppercase font-bold">{order.paymentMethod}</strong>
              </p>
              <p className="text-xs text-[#4A4D59]">
                Fulfillment:{" "}
                <strong className="text-[#0C0D11] uppercase font-bold">
                  {order.orderStatus?.replace("_", " ") || "CONFIRMED"}
                </strong>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#E8EBF2] text-[11px] text-[#8E92A2]">
              Direct dispatch from Radha Outfit Collection Central Wardrobe.
            </div>
          </div>
        </div>

        {/* Itemized Garments Table */}
        <div className="relative z-10 overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[500px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#0C0D11] text-[#0C0D11] uppercase tracking-widest text-[10px]">
                <th className="py-3 font-black">Garment & Barcode</th>
                <th className="py-3 font-black text-center">Fit / Size</th>
                <th className="py-3 font-black text-center">Qty</th>
                <th className="py-3 font-black text-right">Unit Rate</th>
                <th className="py-3 font-black text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F6]">
              {order.items?.map((item, idx) => {
                const barcodeValue = String(item.product || item._id || order.orderNumber);

                return (
                  <tr key={idx} className="group hover:bg-[#FBFBFC] transition-colors">
                    <td className="py-4 pr-3">
                      <p className="font-extrabold text-sm text-[#0C0D11]">{item.name}</p>
                      <p className="text-[10px] font-mono text-[#8E92A2] pt-0.5">
                        SKU: ROC-{(item.slug || "GARMENT").slice(0, 10).toUpperCase()}
                      </p>
                      <ProductBarcode value={barcodeValue} />
                    </td>
                    <td className="py-4 text-center align-top pt-5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F4F5F9] font-bold text-[11px] text-[#0C0D11]">
                        {item.size || "M"}
                      </span>
                    </td>
                    <td className="py-4 text-center align-top pt-5 font-mono font-semibold text-[#0C0D11]">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right align-top pt-5 font-mono text-[#4A4D59]">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 text-right align-top pt-5 font-mono font-extrabold text-[#0C0D11]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pt-6 sm:pt-8 border-t border-[#F0F2F6] gap-6 text-xs relative z-10">
          <div className="max-w-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E92A2]">
              Atelier Exchange Terms
            </span>
            <p className="text-[11px] text-[#8E92A2] leading-relaxed">
              Every handcrafted piece includes our 7-calendar-day exchange guarantee. All items must retain original atelier tags and garment bags.
            </p>
          </div>

          <div className="w-full sm:w-72 p-5 sm:p-6 rounded-3xl bg-[#FBFBFC] border border-[#F0F2F6] space-y-3">
            <div className="flex justify-between text-[#4A4D59]">
              <span>Garment Subtotal</span>
              <span className="font-mono font-semibold text-[#0C0D11]">
                ₹{(order.subtotal || order.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-[#4A4D59]">
              <span>Insured Courier Dispatch</span>
              <span className="font-mono font-semibold text-[#0C0D11]">
                {shippingCost === 0 ? "COMPLIMENTARY" : `₹${shippingCost.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="flex justify-between text-[#4A4D59]">
              <span>Taxes (GST Included)</span>
              <span className="font-mono font-semibold text-[#0C0D11]">₹0</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-[#0C0D11] pt-3 border-t border-[#E8EBF2]">
              <span>Total Payable</span>
              <span className="font-mono text-lg font-black text-[#0C0D11]">
                ₹{order.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Authentication & Signature */}
        <div className="pt-8 sm:pt-10 border-t border-[#F0F2F6] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8E92A2] gap-4 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-[#0C0D11]">Radha Outfit Collection</p>
            <p>© {new Date().getFullYear()} ROC Atelier. Computer-generated tax document.</p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="inline-block border-b border-[#0C0D11] pb-1 px-4">
              <span className="font-serif italic text-sm text-[#0C0D11] tracking-wide">
                Radha Outfit Collection
              </span>
            </div>
            <p className="text-[10px] text-[#8E92A2] uppercase tracking-wider">
              Authorized Atelier Seal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}