import mongoose from "mongoose";

const QRScanLogSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
      index: true,
    },
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
      uppercase: true,
    },
    scannedBy: {
      type: String,
      default: "public_customer",
    },
    action: {
      type: String,
      enum: ["VIEW", "ADMIN_SCAN", "INVENTORY_UPDATE", "SALE"],
      default: "VIEW",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

QRScanLogSchema.index({ qrId: 1, timestamp: -1 });

export default mongoose.models.QRScanLog || mongoose.model("QRScanLog", QRScanLogSchema);