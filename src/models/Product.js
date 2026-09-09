import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  variantId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  colorName: {
    type: String,
    required: true,
    trim: true,
    default: "Classic",
  },
  colorHex: {
    type: String,
    trim: true,
    default: "#000000",
  },
  size: {
    type: String,
    required: true,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
    default: "M",
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  images: [{
    type: String,
    trim: true,
  }],
  // qrToken: {
  //   type: String,
  //   index: true,
  //   sparse: true,
  // },
  // AFTER:
qrToken: {
  type: String,
  sparse: true,
}
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "Handcrafted bespoke tailoring with luxury textile architecture.",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      default: "Haute Couture",
    },
    brand: {
      type: String,
      default: "Radha Outfit Collection",
      trim: true,
    },
    material: {
      type: String,
      trim: true,
      default: "Bespoke Silk / Cotton Blend",
    },
    price: {
      type: Number,
      required: [true, "Base price is required"],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    images: [{
      type: String,
      required: true,
    }],
    variants: [VariantSchema],
    // Backwards-compatible legacy fields to keep existing UI fully intact
    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL"],
    },
    stockCount: {
      type: Number,
      default: 10,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    ratings: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed faceted search and variant lookups
ProductSchema.index({ category: 1, inStock: 1, createdAt: -1 });
ProductSchema.index({ "variants.sku": 1 });
ProductSchema.index({ "variants.qrToken": 1 });

// Ensure total stockCount mirrors variants when present
ProductSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.stockCount = this.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    this.inStock = this.stockCount > 0;
    
    // Auto-populate unique sizes array for existing frontend compatibility
    const sizeSet = new Set(this.variants.map((v) => v.size).filter(Boolean));
    if (sizeSet.size > 0) {
      this.sizes = Array.from(sizeSet);
    }
  }
  next();
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);