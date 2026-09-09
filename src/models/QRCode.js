import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
      default: () => `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
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
      index: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
    scansCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastScannedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

QRCodeSchema.index({ productId: 1, variantId: 1 });

export default mongoose.models.QRCode || mongoose.model("QRCode", QRCodeSchema);