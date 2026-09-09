import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LuxuryPreloader from "@/components/common/LuxuryPreloader";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Radha Outfit Collection (ROC) — Contemporary Wardrobe",
    template: "%s | ROC",
  },
  description: "Minimalist silhouettes meticulously crafted for modern daily life.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} scroll-smooth`}>
      <body className="font-sans flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] antialiased selection:bg-[var(--bg-dark)] selection:text-white">
        <LuxuryPreloader />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}