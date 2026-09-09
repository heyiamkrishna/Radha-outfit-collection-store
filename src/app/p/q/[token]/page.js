import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import QRCode from "@/models/QRCode";
import Product from "@/models/Product";
import QRScanLog from "@/models/QRScanLog";

export default async function PublicQRRedirectPage({ params }) {
  const { token } = await params;

  if (!token) notFound();

  await connectToDatabase();

  const qr = await QRCode.findOne({ token }).lean();

  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 text-[#0C0D11]">
        <div className="p-8 sm:p-10 bg-white border border-[#E8EBF2] rounded-[32px] text-center space-y-4 max-w-md shadow-xs">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600">
            Unrecognized Tag
          </p>
          <h2 className="text-xl font-serif font-black uppercase tracking-tight">
            Invalid Atelier QR
          </h2>
          <p className="text-xs text-[#8E92A2]">
            This garment tag does not match any authenticated record in the archive.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (qr.status === "DISABLED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4 text-[#0C0D11]">
        <div className="p-8 sm:p-10 bg-white border border-[#E8EBF2] rounded-[32px] text-center space-y-4 max-w-md shadow-xs">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600">
            Archived Garment
          </p>
          <h2 className="text-xl font-serif font-black uppercase tracking-tight">
            Tag Deactivated
          </h2>
          <p className="text-xs text-[#8E92A2]">
            This specific garment QR code has been retired by our curation team.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full bg-[#0C0D11] text-white text-xs font-black uppercase tracking-wider hover:bg-[#3B7BF6] transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = await Product.findById(qr.productId).select("slug").lean();
  if (!product) notFound();

  // Log customer discovery scan
  try {
    await QRScanLog.create({
      qrId: qr.qrId,
      productId: qr.productId,
      variantId: qr.variantId,
      sku: qr.sku,
      action: "VIEW",
      scannedBy: "public_customer",
    });
    await QRCode.updateOne({ _id: qr._id }, { $inc: { scansCount: 1 } });
  } catch (logErr) {
    console.error("Failed to log customer scan:", logErr);
  }

  // Forward straight to your existing PDP
  redirect(`/product/${product.slug}`);
}