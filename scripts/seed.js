import mongoose from "mongoose";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local if dotenv is not present
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join("=").trim().replace(/(^['"]|['"]$)/g, "");
      }
    }
  });
}

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/radha-outfit";

function generateSecureToken() {
  return crypto.randomBytes(16).toString("hex");
}

// -------------------------------------------------------------
// INLINE SCHEMAS TO RUN INDEPENDENTLY OF NEXT.JS COMPILER
// -------------------------------------------------------------
const VariantSchema = new mongoose.Schema({
  variantId: { type: String, required: true },
  colorName: { type: String, required: true, default: "Classic" },
  colorHex: { type: String, default: "#0C0D11" },
  size: { type: String, required: true },
  sku: { type: String, required: true, uppercase: true },
  price: Number,
  salePrice: Number,
  stock: { type: Number, default: 0 },
  images: [String],
  qrToken: { type: String, sparse: true },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    category: { type: String, required: true },
    subcategory: String,
    brand: { type: String, default: "Radha Outfit Collection" },
    material: String,
    price: { type: Number, required: true },
    salePrice: Number,
    images: [String],
    variants: [VariantSchema],
    sizes: [String],
    stockCount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: true },
    bestSeller: { type: Boolean, default: false },
    ratings: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QRCodeSchema = new mongoose.Schema(
  {
    qrId: { type: String, required: true, unique: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["ACTIVE", "DISABLED", "EXPIRED"], default: "ACTIVE" },
    scansCount: { type: Number, default: 0 },
    lastScannedAt: Date,
  },
  { timestamps: true }
);

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    badge: String,
    image: { type: String, required: true },
    link: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const QRCode = mongoose.models.QRCode || mongoose.model("QRCode", QRCodeSchema);
const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// -------------------------------------------------------------
// ATELIER PRODUCTION CURATION DATA
// -------------------------------------------------------------
const ATELIER_CATALOG = [
  // MEN'S WARDROBE
  {
    name: "Pleated Linen Trouser",
    slug: "pleated-linen-trouser",
    category: "men",
    subcategory: "Tailored Classics",
    material: "100% Normandy Flax Linen",
    price: 6999,
    salePrice: 5499,
    description:
      "Sculpted from high-twist European linen with double reverse pleats, natural horn buttons, and relaxed drape through the leg.",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    colors: [
      { name: "Oatmeal", hex: "#D6C7B2" },
      { name: "Midnight Navy", hex: "#1A202C" },
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Raw Silk Bandhgala Jacket",
    slug: "raw-silk-bandhgala-jacket",
    category: "men",
    subcategory: "Ceremonial Suiting",
    material: "Hand-spun Bhagalpur Raw Silk",
    price: 18999,
    salePrice: 15499,
    description:
      "Structured Nehru collar silhouette crafted from textured raw silk, lined with cupro jacquard and antique brass crested buttons.",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    colors: [{ name: "Ivory Ecru", hex: "#FDFBF7" }],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Cuban Collar Textured Shirt",
    slug: "cuban-collar-textured-shirt",
    category: "men",
    subcategory: "Resort Tailoring",
    material: "Organic Slub Cotton Weave",
    price: 4499,
    salePrice: 3499,
    description:
      "Relaxed camp-collar vacation silhouette woven with open slub textures for maximum breathability in warm climates.",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    colors: [{ name: "Sage Olive", hex: "#8A9A86" }],
    sizes: ["S", "M", "L", "XL"],
  },

  // WOMEN'S COLLECTION
  {
    name: "Tissue Chanderi Anarkali Ensemble",
    slug: "tissue-chanderi-anarkali-ensemble",
    category: "women",
    subcategory: "Heritage Couture",
    material: "Zari Tissue Chanderi & Mulmul",
    price: 24999,
    salePrice: 19999,
    description:
      "Flowing 32-kali metallic gold Chanderi silhouette adorned with gota patti borders and paired with an organza dupatta.",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: true,
    bestSeller: true,
    colors: [
      { name: "Champagne Gold", hex: "#E8D8B8" },
      { name: "Rose Quartz", hex: "#E6C2C6" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Tailored Wool Trench Coat",
    slug: "tailored-wool-trench-coat",
    category: "women",
    subcategory: "Outerwear",
    material: "Double-faced Merino Wool",
    price: 16999,
    salePrice: 13999,
    description:
      "Architectural storm-flap trench coat crafted with storm cuffs, horn buckles, and a structured silhouette cinch belt.",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    colors: [{ name: "Camel Tan", hex: "#C19A6B" }],
    sizes: ["S", "M", "L"],
  },
  {
    name: "Handloom Banarasi Silk Saree",
    slug: "handloom-banarasi-silk-saree",
    category: "women",
    subcategory: "Archival Weaves",
    material: "Katan Pure Mulberry Silk",
    price: 28999,
    salePrice: 24499,
    description:
      "Woven over four weeks on traditional wooden looms in Varanasi. Features kadwa floral bootis and real gold zari pallu.",
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    colors: [{ name: "Royal Vermillion", hex: "#B80F0A" }],
    sizes: ["Free Size"],
  },

  // KIDS' CURATIONS
  {
    name: "Embroidered Kurta Dhoti Set",
    slug: "embroidered-kurta-dhoti-set",
    category: "kids",
    subcategory: "Occasion Wear",
    material: "Organic Cotton & Chanderi",
    price: 3999,
    salePrice: 2999,
    description:
      "Soft mulmul-lined festive kurta with gentle resham embroidery, paired with a pre-draped elasticated dhoti.",
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: false,
    newArrival: true,
    bestSeller: true,
    colors: [{ name: "Marigold Yellow", hex: "#EAA221" }],
    sizes: ["S", "M", "L"],
  },
  {
    name: "Pastel Silk Lehenga Choli",
    slug: "pastel-silk-lehenga-choli",
    category: "kids",
    subcategory: "Celebration Attire",
    material: "Brocade Silk & Cotton Lining",
    price: 4999,
    salePrice: 3799,
    description:
      "Lightweight floral brocade skirt designed for fluid mobility, finished with delicate latkans and breathable inner cotton lining.",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1200&auto=format&fit=crop",
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    colors: [{ name: "Mint Pistachio", hex: "#93C572" }],
    sizes: ["XS", "S", "M", "L"],
  },
];

const PROMOTIONAL_BANNERS = [
  {
    title: "Autumn Heritage & Silks",
    subtitle: "Handcrafted festive silhouettes woven with pure zari threads.",
    badge: "New Season Runway",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
    link: "/shop",
    order: 1,
    isActive: true,
  },
  {
    title: "Bespoke Menswear Curations",
    subtitle: "European linen tailoring and ceremonial raw silk jackets.",
    badge: "Atelier Classics",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop",
    link: "/shop",
    order: 2,
    isActive: true,
  },
];

// -------------------------------------------------------------
// EXECUTION SEED RUNNER
// -------------------------------------------------------------
async function runSeed() {
  console.log("==================================================");
  console.log("🌸 RADHA OUTFIT COLLECTION — PRODUCTION CATALOG SEEDER");
  console.log("==================================================");
  console.log(`Connecting to MongoDB: ${MONGO_URI.split("@").pop() || "localhost"}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connection Established.");

    // Clean previous seed runs
    console.log("🧹 Clearing previous products, barcodes, and promotional banners...");
    await Promise.all([
      Product.deleteMany({}),
      QRCode.deleteMany({}),
      Banner.deleteMany({}),
    ]);

    // 1. Seed Banners
    console.log(`🖼️ Inserting ${PROMOTIONAL_BANNERS.length} hero slider banners...`);
    await Banner.insertMany(PROMOTIONAL_BANNERS);

    // 2. Seed Products and Generate Corresponding QR Tokens
    console.log(`👗 Seeding ${ATELIER_CATALOG.length} core garment silhouettes with variants...`);
    let totalVariantsSeeded = 0;
    let totalQRCodesGenerated = 0;

    for (const item of ATELIER_CATALOG) {
      const generatedVariants = [];
      const qrRecordsToInsert = [];

      // Generate variants for each Color x Size permutation
      for (const color of item.colors) {
        for (const size of item.sizes) {
          const skuPrefix = item.slug.substring(0, 6).toUpperCase();
          const colorCode = color.name.substring(0, 3).toUpperCase();
          const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
          const sku = `${skuPrefix}-${colorCode}-${size}-${randomSuffix}`;

          const variantId = `var-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          const token = generateSecureToken();

          generatedVariants.push({
            variantId,
            colorName: color.name,
            colorHex: color.hex,
            size,
            sku,
            price: item.price,
            salePrice: item.salePrice,
            stock: 12, // Default 12 units per variant
            images: item.images,
            qrToken: token,
          });

          qrRecordsToInsert.push({
            qrId: `QR-${sku}`,
            variantId,
            sku,
            token,
            status: "ACTIVE",
          });

          totalVariantsSeeded++;
        }
      }

      // Compute aggregates
      const stockCount = generatedVariants.reduce((sum, v) => sum + v.stock, 0);

      // Create Product
      const createdProduct = await Product.create({
        name: item.name,
        slug: item.slug,
        category: item.category,
        subcategory: item.subcategory,
        material: item.material,
        price: item.price,
        salePrice: item.salePrice,
        description: item.description,
        images: item.images,
        variants: generatedVariants,
        sizes: item.sizes,
        stockCount,
        inStock: stockCount > 0,
        featured: item.featured,
        newArrival: item.newArrival,
        bestSeller: item.bestSeller,
        ratings: 5.0,
        reviewCount: Math.floor(Math.random() * 18) + 4,
      });

      // Link Product ID into QR code records and insert
      const finalizedQRs = qrRecordsToInsert.map((qr) => ({
        ...qr,
        productId: createdProduct._id,
      }));

      await QRCode.insertMany(finalizedQRs);
      totalQRCodesGenerated += finalizedQRs.length;
    }

    console.log("--------------------------------------------------");
    console.log(`🎉 CATALOG POPULATED SUCCESSFULLY:`);
    console.log(`   - Garment Silhouettes : ${ATELIER_CATALOG.length}`);
    console.log(`   - Normalized Variants : ${totalVariantsSeeded}`);
    console.log(`   - Active QR Codes     : ${totalQRCodesGenerated}`);
    console.log(`   - Hero Slider Banners : ${PROMOTIONAL_BANNERS.length}`);
    console.log("--------------------------------------------------");
    console.log("✅ Storefront and Admin desks are fully stocked.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder encountered an error:", err);
    process.exit(1);
  }
}

runSeed();