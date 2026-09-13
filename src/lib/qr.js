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
  // 1. Verify product existence via light projection
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) {
    throw new Error(`Product not found for ID: ${productId}`);
  }

  const normalizedSku = sku.trim().toUpperCase();

  // 2. If not regenerating, check for existing active token
  if (!regenerate) {
    const existingQR = await QRCode.findOne({ productId, variantId, status: "ACTIVE" }).lean();
    if (existingQR) {
      return existingQR;
    }
  } else {
    // Disable previous active QR codes for this variant
    await QRCode.updateMany(
      { productId, variantId, status: "ACTIVE" },
      { $set: { status: "DISABLED" } }
    );
  }

  const token = generateSecureToken();
  const qrId = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const qrRecord = await QRCode.create({
    qrId,
    productId,
    variantId,
    sku: normalizedSku,
    token,
    status: "ACTIVE",
  });

  // 3. Update variant directly without loading/saving entire document
  await Product.updateOne(
    { _id: productId },
    { $set: { "variants.$[elem].qrToken": token } },
    {
      arrayFilters: [
        {
          $or: [
            { "elem.variantId": variantId },
            { "elem.sku": normalizedSku }
          ]
        }
      ]
    }
  );

  return qrRecord;
}