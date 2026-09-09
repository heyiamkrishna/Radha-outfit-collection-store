import Product from "@/models/Product";
import InventoryTransaction from "@/models/InventoryTransaction";

/**
 * Atomically adjusts inventory for a specific SKU or Product
 * and writes an immutable audit record to InventoryTransaction.
 */
export async function adjustVariantStock({
  productId,
  variantId,
  sku,
  quantityChange, // negative for deductions (e.g. -2 for sale), positive for additions (+10)
  type, // "SALE" | "RETURN" | "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"
  reason = "Order Fulfillment",
  performedBy = "system",
}) {
  // 1. Fetch current product state
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  let previousStock = 0;
  let newStock = 0;
  let targetVariant = null;

  // Check if product uses structured variants
  if (product.variants && product.variants.length > 0) {
    const variantIndex = product.variants.findIndex(
      (v) => (sku && v.sku === sku) || (variantId && v.variantId === variantId)
    );

    if (variantIndex === -1) {
      throw new Error(`Variant not found for SKU: ${sku || variantId}`);
    }

    targetVariant = product.variants[variantIndex];
    previousStock = targetVariant.stock || 0;
    newStock = previousStock + quantityChange;

    if (newStock < 0) {
      throw new Error(
        `Insufficient stock for SKU ${targetVariant.sku}. Requested: ${Math.abs(quantityChange)}, Available: ${previousStock}`
      );
    }

    targetVariant.stock = newStock;
    product.stockCount = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    product.inStock = product.stockCount > 0;
  } else {
    // Fallback for legacy items with flat stockCount
    previousStock = product.stockCount ?? 10;
    newStock = previousStock + quantityChange;

    if (newStock < 0) {
      throw new Error(
        `Insufficient stock for ${product.name}. Requested: ${Math.abs(quantityChange)}, Available: ${previousStock}`
      );
    }

    product.stockCount = newStock;
    product.inStock = newStock > 0;
  }

  await product.save();

  // 2. Write immutable transaction log
  const transaction = await InventoryTransaction.create({
    productId: product._id,
    variantId: targetVariant ? targetVariant.variantId : "legacy-default",
    sku: targetVariant ? targetVariant.sku : (product.slug?.toUpperCase() || "GEN-SKU"),
    type,
    quantity: Math.abs(quantityChange),
    previousStock,
    newStock,
    reason,
    performedBy,
  });

  return { product, transaction, newStock };
}