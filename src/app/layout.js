import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import LuxuryPreloader from "@/components/common/LuxuryPreloader";
import PageReveal from "@/components/motion/PageReveal";

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
  title: "Radha Outfit Collection | Contemporary D2C Atelier",
  description: "Curated contemporary couture and tailored luxury silhouettes.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} scroll-smooth`}>
      <body className="font-sans flex flex-col min-h-screen bg-[#FAFAFC] text-[#0C0D11] antialiased selection:bg-[#0C0D11] selection:text-white">
        <LuxuryPreloader />
        <Navbar />
        <PageReveal>
          <main className="flex-grow">{children}</main>
        </PageReveal>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}