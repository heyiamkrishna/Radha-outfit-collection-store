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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0C0D11",
};

export const metadata = {
  title: {
    default: "Radha Outfit Collection | Haute Couture & Ready-to-Wear",
    template: "%s | Radha Outfit Collection",
  },
  description: "Exclusive handcrafted silhouettes, luxury wedding couture, and bespoke modern essentials.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} scroll-smooth`}>
      <body className="font-sans flex flex-col min-h-screen bg-[#FAFAFC] text-[#0C0D11] antialiased selection:bg-[#0C0D11] selection:text-white">
        <LuxuryPreloader />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}