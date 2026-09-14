import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  variantId: {
    type: String,
    default: () =>
      `var-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
  },
  colorName: {
    type: String,
    default: "Standard",
  },
  colorHex: {
    type: String,
    default: "#0C0D11",
  },
  size: {
    type: String,
    required: [true, "Size identifier is required."],
    trim: true,
  },
  sku: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
  },
  stock: {
    type: Number,
    default: 10,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  qrToken: {
    type: String,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Garment title is mandatory."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Unique URL slug is mandatory."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: ["women", "men", "kids", "accessories"],
      lowercase: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: "Atelier Haute Couture",
      trim: true,
    },
    brand: {
      type: String,
      default: "Radha Outfit Collection",
      trim: true,
    },

    // ── Technical Dossier & Highlights ──
    fabric: {
      type: String,
      default: "Pure Cotton",
      trim: true,
    },
    material: {
      type: String,
      default: "100% Pure Combed Cotton",
      trim: true,
    },
    sleeve: {
      type: String,
      default: "Full Sleeve",
      trim: true,
    },
    pattern: {
      type: String,
      default: "Solid",
      trim: true,
    },
    color: {
      type: String,
      default: "Imperial Purple",
      trim: true,
    },
    fit: {
      type: String,
      default: "Slim",
      trim: true,
    },
    collar: {
      type: String,
      default: "Spread Collar",
      trim: true,
    },
    styleCode: {
      type: String,
      default: "",
      trim: true,
    },
    packOf: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ── Valuation & Stock Metrics ──
    price: {
      type: Number,
      required: [true, "Original retail valuation is mandatory."],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    stockCount: {
      type: Number,
      default: 10,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── Visual Showcase Assets ──
    image: {
      type: String,
      default: "/placeholder.jpg",
    },
    images: {
      type: [String],
      default: [],
    },

    // ── Atelier Sizes & Variants ──
    sizes: {
      type: [String],
      default: ["38 (S)", "39 (M)", "40 (L)", "42 (XL)"],
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },

    // ── Curation Status Badges ──
    badge: {
      type: String,
      default: "Exclusive",
      trim: true,
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
    },

    // ── Ratings & Social Proof ──
    ratings: {
      type: Number,
      default: 5,
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

// Fallback inStock sync before save
ProductSchema.pre("save", function (next) {
  if (this.stockCount <= 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }
  next();
});

// Clear stale cached schema in Next.js development server
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Product;
}

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;