import crypto from "crypto";
import QRCode from "@/models/QRCode";
import Product from "@/models/Product";

/**
 * Generates an unguessable 32-character hexadecimal cryptographic token.
 */
export function generateSecureToken() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Generates or regenerates an active QR code record for a specific product variant.
 */
export async function createOrUpdateQRCode({ productId, variantId, sku, regenerate = false }) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found for ID: ${productId}`);
  }

  // If regenerating, mark existing active QR code as DISABLED
  if (regenerate) {
    await QRCode.updateMany(
      { productId, variantId, status: "ACTIVE" },
      { $set: { status: "DISABLED" } }
    );
  }

  // Check if an active QR code already exists
  let existingQR = await QRCode.findOne({ productId, variantId, status: "ACTIVE" });
  if (existingQR && !regenerate) {
    return existingQR;
  }

  const token = generateSecureToken();
  const qrId = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const qrRecord = await QRCode.create({
    qrId,
    productId,
    variantId,
    sku: sku.toUpperCase(),
    token,
    status: "ACTIVE",
  });

  // Attach token directly to variant in Product for fast lookup
  if (product.variants && product.variants.length > 0) {
    const variant = product.variants.find(
      (v) => v.variantId === variantId || v.sku === sku
    );
    if (variant) {
      variant.qrToken = token;
      await product.save();
    }
  }

  return qrRecord;
}