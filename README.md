@'
<div align="center">

# 🌸 RADHA OUTFIT COLLECTION
### *Haute Couture, Bespoke Silks & Tailored Atelier*

An editorial luxury apparel e-commerce platform engineered with Next.js 15 App Router, MongoDB, server-authoritative checkout orchestration, and an integrated physical-to-digital QR inventory engine.

[Explore Architecture](#-system-architecture) • [Features](#-core-capabilities) • [QR Engine](#-physical-to-digital-qr-engine) • [API Guide](#-api-directory) • [Setup](#-local-development)

<br/>

![Next.js 15](https://img.shields.io/badge/Next.js-15.0+-0C0D11?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-0C0D11?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-0C0D11?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-0C0D11?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Zustand](https://img.shields.io/badge/State-Zustand-0C0D11?style=for-the-badge&logo=react&logoColor=white)

</div>

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Storefront [Customer Storefront]
        A[Dynamic PDP<br>/product/:slug]
        B[Luxury Cart<br>Zustand Drawer]
        C[Order Tracker<br>/account/orders]
    end

    A --> Checkout[Server-Authoritative Checkout<br>/api/checkout & /calculate]
    B --> Checkout
    C --> Checkout

    subgraph Pipeline [Checkout Validation Pipeline]
        Checkout --> DBV[Database Verification<br>Subtotal, GST, Delivery]
        Checkout --> TXL[Transactional Ledger<br>Atomic Stock Deduct]
    end

    DBV --> Mongo[(MongoDB Cluster<br>Products, Variants, Orders, Inventory Logs)]
    TXL --> Mongo

    subgraph PhysicalDigital [Physical-to-Digital Operations]
        Tag[Physical Clothing Tag<br>Customer Camera Scan] --> QRRes[QR Tag Resolution<br>/p/q/:token]
        QRRes --> A
        QRRes <--> Mongo
        Admin[Admin Master Desk<br>/admin & /products] <--> Mongo
        Admin --> ScanPrint[Camera Scanner & Label Print<br>Stock In/Out Actions]
    end


    ---

## ✨ Core Capabilities

### 🛍️ Client Storefront
* **Curated Visual Rails**: Men’s Wardrobe, Women’s Collection, and Kids’ Curations powered by Swiper peek carousels and 3:4 aspect-ratio cards.
* **Frosted Glass Preloader**: Bespoke branded preloader with zero cumulative layout shift (CLS).
* **Faceted Navigation**: Search by silhouette name, dynamic price evaluation, and instant collection categorization.
* **Adaptive Orders Desk**: Responsive client portal providing order status progressions (`Received` → `Delivered`) and printable tax invoices.

### 🛡️ Secure E-Commerce Pipeline
* **Server-Authoritative Pricing**: Browser prices are strictly ignored. The backend queries MongoDB directly to calculate unit prices, luxury GST (12%), and delivery tiers.
* **Normalized Variant Hierarchy**: Full multi-variant support: Product → Color → Size → SKU → Inventory.
* **Atomic Ledger Decrements**: Concurrency-safe inventory deductions with immutable audit logs in `InventoryTransaction`.
* **Centralized JWT Security**: Stateless authentication powered by `jose` without hardcoded fallback secrets.

---

## 📱 Physical-to-Digital QR Engine

Every clothing piece is tied to physical inventory through cryptographically secure
| Component | Technical Implementation | Purpose |
|---|---|---|
| **Generator** | `src/lib/qr.js` | Generates 128-bit unguessable tokens mapped to specific SKUs. |
| **Print Engine** | `QRPreviewModal.jsx` | Print layout styled for thermal tags and standard label sheets. |
| **Scanner Module** | `QRScannerModal.jsx` | Hardware camera stream via `html5-qrcode` with 1-tap stock adjustments. |
| **Public Gateway** | `/p/q/[token]` | Resolves scans, increments telemetry metrics, and forwards to the PDP. |


## 📂 Project Structure

<pre>
radha-outfit-collection/
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   └── seed.js                         # Production inventory & variant catalog seeder
├── setup-admin.cjs                     # Standalone admin role assignment script
├── test-email.mjs                      # SMTP transmission verifier
├── src/
│   ├── middleware.js                   # Edge JWT verification & admin route protection
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.js           # Client & administrator portal authentication
│   │   │   └── register/page.js        # New client account onboarding
│   │   ├── account/
│   │   │   ├── page.js                 # Customer atelier portal dashboard
│   │   │   └── orders/
│   │   │       ├── page.js             # Customer order ledger & tracking runway
│   │   │       └── [id]/page.js        # Tax invoice dossier, OrderQRCode & Barcode
│   │   ├── admin/
│   │   │   ├── page.js                 # Executive Master Command Center & KPIs
│   │   │   ├── orders/page.js          # Live fulfillment desk & dispatch advancement
│   │   │   └── products/page.js        # Garment catalog, category rails & QR tags
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── orders/route.js     # Admin status advancement & order lookup
│   │   │   │   ├── overview/route.js   # Real-time sales, order counts & revenue telemetry
│   │   │   │   └── products/           # Catalog management endpoints
│   │   │   │       ├── route.js        # Garment creation & catalog queries
│   │   │   │       └── [id]/route.js   # Stock toggling & silhouette deletion
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js      # Stateless JWT session cookie issuance
│   │   │   │   ├── logout/route.js     # Session termination & cookie invalidation
│   │   │   │   ├── me/route.js         # Verified user identity & role resolver
│   │   │   │   ├── orders/route.js     # User-specific order history resolver
│   │   │   │   └── register/route.js   # Client registration with password hashing
│   │   │   ├── banners/
│   │   │   │   ├── route.js            # Hero promotional slider query & creation
│   │   │   │   └── [id]/route.js       # Slide visibility toggle & deletion
│   │   │   ├── checkout/
│   │   │   │   ├── route.js            # Server-authoritative checkout & atomic stock deduct
│   │   │   │   └── calculate/route.js  # Real-time subtotal, GST & delivery fee calculation
│   │   │   ├── inventory/route.js      # Stock-in/out manual adjustments & audit logs
│   │   │   ├── orders/route.js         # Client order retrieval
│   │   │   ├── products/route.js       # Storefront public catalog resolver
│   │   │   ├── qr/
│   │   │   │   ├── generate/route.js   # Cryptographic 32-char token generator
│   │   │   │   └── scan/route.js       # Hardware scanner resolution & stock actions
│   │   │   ├── upload/route.js         # Garment & banner media processing endpoint
│   │   │   └── user/                   # Profile & cancellation endpoints
│   │   ├── cart/page.js                # Dedicated full-page luxury cart
│   │   ├── checkout/page.js            # Shipping address input & payment selection
│   │   ├── health/route.js             # Cluster uptime & database heartbeat probe
│   │   ├── p/q/[token]/page.js         # Public physical tag resolution & redirect to PDP
│   │   ├── product/[slug]/page.js      # Dynamic silhouette presentation page (PDP)
│   │   ├── shop/page.js                # Full collection catalog & faceted search
│   │   ├── wishlist/page.js            # Curated client saved garments view
│   │   ├── layout.js                   # Root layout mounting Navbar, CartDrawer & Preloader
│   │   ├── loading.js                  # Frosted glass loader during route transitions
│   │   ├── globals.css                 # Atelier aesthetic design system & scrollbar locks
│   │   ├── robots.js                   # Search index crawler directives
│   │   └── sitemap.js                  # Dynamic XML sitemap generator
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AddProductModal.jsx     # Multi-variant garment authoring modal
│   │   │   ├── BannerManagerModal.jsx  # Hero slider banner authoring modal
│   │   │   └── qr/
│   │   │       ├── QRPreviewModal.jsx  # Thermal tag layout & SVG export generator
│   │   │       └── QRScannerModal.jsx  # Hardware camera feed scanner via html5-qrcode
│   │   ├── auth/
│   │   │   └── AuthModal.jsx           # Slide-over authentication drawer
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx          # Slide-out real-time interactive shopping bag
│   │   ├── common/
│   │   │   └── LuxuryPreloader.jsx     # High-end initial page loading animation
│   │   ├── home/
│   │   │   ├── CategoryCard.jsx        # Editorial card for category showcase
│   │   │   ├── CategoryShowcase.jsx    # Gender & age rail presentation
│   │   │   ├── HeroSlider.jsx          # Flipkart-style promotional banner carousel
│   │   │   └── Newsletter.jsx          # Atelier newsletter subscription form
│   │   ├── layout/
│   │   │   ├── Navbar.jsx              # Frosted glass sticky header & search drawer trigger
│   │   │   └── Footer.jsx              # Brand manifesto, navigation & legal indices
│   │   ├── product/
│   │   │   ├── ProductActions.jsx      # Size selection, quantity counter & bag actions
│   │   │   └── ProductCard.jsx         # 3:4 aspect-ratio storefront silhouette card
│   │   ├── shop/
│   │   │   ├── Pagination.jsx          # Catalog navigation pagination controls
│   │   │   ├── ProductFilters.jsx      # Category, price range & sort-by selectors
│   │   │   └── ShopHeader.jsx          # Filter pill rack & real-time search input
│   │   ├── WishlistDrawer.jsx          # Slide-out saved garments drawer
│   │   └── WishlistHeartButton.jsx     # 1-tap wishlist persistence trigger
│   ├── lib/
│   │   ├── adminAuth.js                # Centralized zero-fallback jose admin session verifier
│   │   ├── auth.js                     # Standard client session extraction helper
│   │   ├── emailTemplates.js           # HTML email styling for transactional dispatches
│   │   ├── inventory.js                # Concurrency-safe atomic stock adjustment engine
│   │   ├── mongodb.js                  # Global cached Mongoose singleton connection
│   │   ├── qr.js                       # Cryptographic token generator & variant linkage
│   │   ├── sendEmail.js                # Nodemailer SMTP transmission service
│   │   └── utils.js                    # Formatting helpers (INR currency, slug sanitizer)
│   ├── models/
│   │   ├── Banner.js                   # Hero slider promotional slide schema
│   │   ├── Cart.js                     # Server-persisted shopping bag schema
│   │   ├── Category.js                 # Catalog rail categorization schema
│   │   ├── InventoryTransaction.js     # Immutable stock-in/out and sale audit ledger
│   │   ├── Order.js                    # Customer order model (supports guest checkout)
│   │   ├── Product.js                  # Multi-variant garment model (Color/Size/SKU/Stock)
│   │   ├── QRCode.js                   # Physical-to-digital QR token registry
│   │   ├── QRScanLog.js                # Physical scan analytics & telemetry logs
│   │   ├── Review.js                   # Garment client testimonial & star rating schema
│   │   └── User.js                     # User profile schema with role management
│   └── store/
│       ├── useCartStore.js             # Client-side persistent cart state (Zustand)
│       └── useWishlistStore.js         # Client-side persistent wishlist state (Zustand)
</pre>


---

## 🔌 API Directory

### Checkout & Stock
* `POST /api/checkout`: Server-side price calculation, order creation, and atomic inventory reservation.
* `POST /api/checkout/calculate`: Live cart pricing, tax breakdown, and shipping fee calculation.
* `POST /api/inventory`: Manual admin adjustments (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`).

### QR Infrastructure
* `POST /api/qr/generate`: Generates an active tag and assigns a unique SKU token.
* `POST /api/qr/scan`: Validates tokens, records scan logs, and enables instant stock changes.
* `GET /p/q/[token]`: Public redirect endpoint routing physical tags to active PDPs.

---

## 🚀 Local Development

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/radha-outfit-collection.git](https://github.com/your-username/radha-outfit-collection.git)
cd radha-outfit-collection
npm install


### 2. Configure Environment (`.env.local`)

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_cluster_connection_string
JWT_SECRET=your_long_cryptographic_secret_key_minimum_32_characters
NEXT_PUBLIC_BASE_URL=http://localhost:3000


### 3. Seed Production Catalog

Populate the database with curated silhouettes, variants, and active QR tokens:

```bash
node scripts/seed.js

4. Launch Development Server
Start the local Next.js development server:

Bash
npm run dev




## 📜 License

Private and proprietary. Developed for **Radha Outfit Collection**. All rights reserved.