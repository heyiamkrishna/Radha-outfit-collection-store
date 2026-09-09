import mongoose from "mongoose";

const InventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT", "SALE", "RETURN"],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
      default: "Manual Admin Stock Adjustment",
    },
    performedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

InventoryTransactionSchema.index({ sku: 1, createdAt: -1 });

export default mongoose.models.InventoryTransaction || mongoose.model("InventoryTransaction", InventoryTransactionSchema);