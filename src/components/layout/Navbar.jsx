"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  Heart,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevCount = useRef(0);

  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const cart = useCartStore((state) => state.cart || state.items || []);
  const openWishlist = useWishlistStore((state) => state.openWishlist || state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items || []);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let total = 0;
    if (cart && cart.length > 0) {
      total = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    } else {
      try {
        const guestCart = JSON.parse(localStorage.getItem("atelier_guest_cart") || "[]");
        total = guestCart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      } catch {
        total = 0;
      }
    }
    setCartCount(total);

    if (total > prevCount.current && prevCount.current !== 0) {
      setCartPulse(true);
      const pulseTimeout = setTimeout(() => setCartPulse(false), 500);
      return () => clearTimeout(pulseTimeout);
    }
    prevCount.current = total;
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/shop" },
    { label: "Women", href: "/shop?category=women" },
    { label: "Men", href: "/shop?category=men" },
    { label: "Kids", href: "/shop?category=kids" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href.split("?")[0]);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full px-2 sm:px-4 md:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "pt-1.5 sm:pt-2 pb-1" : "pt-2.5 sm:pt-3.5 pb-1.5"
        } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-3 sm:px-5 py-1.5 sm:py-2.5 flex items-center justify-between border ${
            isScrolled
              ? "bg-[#FAFAFC]/95 backdrop-blur-xl border-black/[0.07] shadow-[0_8px_30px_-6px_rgba(12,13,17,0.08)] ring-1 ring-black/[0.02]"
              : "bg-white/80 backdrop-blur-md border-black/[0.05] shadow-[0_2px_16px_-4px_rgba(12,13,17,0.03)]"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 sm:gap-2.5 shrink-0 select-none active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0C0D11] text-white flex items-center justify-center shadow-xs">
              <span className="font-serif font-black text-xs">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-xs sm:text-sm uppercase text-[#0C0D11] leading-none">
                ROC
              </span>
              <span className="hidden sm:inline-block text-[8px] font-mono uppercase tracking-[0.2em] text-[#8E92A2] mt-0.5">
                Atelier
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-black/[0.02] rounded-full border border-black/[0.03]">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3.5 lg:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                    active
                      ? "bg-[#0C0D11] text-white shadow-xs"
                      : "text-[#585C6D] hover:text-[#0C0D11] hover:bg-black/[0.035]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 text-[#0C0D11]">
            <Link
              href="/shop"
              className="p-2 rounded-full text-[#4A4D59] hover:text-[#0C0D11] hover:bg-black/[0.04] transition-all active:scale-90"
              aria-label="Search Collection"
            >
              <Search className="w-4 h-4" />
            </Link>

            {mounted && user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#0C0D11] text-white hover:bg-[#1E2028] transition-all"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="hidden sm:flex items-center space-x-0.5">
                <Link
                  href="/account"
                  className="text-[11px] font-bold uppercase tracking-wider text-[#0C0D11] hover:text-blue-600 transition-colors px-2 py-1"
                >
                  {user.name?.split(" ")[0]}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#8E92A2] hover:text-rose-600 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`p-2 rounded-full text-[#4A4D59] hover:text-[#0C0D11] hover:bg-black/[0.04] transition-all hidden sm:inline-block active:scale-90 ${
                  pathname === "/login" ? "bg-black/[0.05] ring-1 ring-black/10" : ""
                }`}
                aria-label="Sign In"
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => openWishlist && openWishlist()}
              className="relative p-2 rounded-full text-[#4A4D59] hover:text-rose-600 hover:bg-rose-50/70 transition-all active:scale-90"
              aria-label="View Saved Garments"
            >
              <Heart className="w-4 h-4" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-white text-[8px] font-mono font-bold items-center justify-center">
                    {wishlistItems.length}
                  </span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (openCartDrawer) {
                  openCartDrawer();
                } else {
                  window.location.href = "/cart";
                }
              }}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#0C0D11] text-white hover:bg-[#1C1E26] transition-all font-bold text-xs active:scale-95 ${
                cartPulse ? "animate-cart-pulse ring-2 ring-black/20" : ""
              }`}
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" />
              <span className="hidden sm:inline tracking-wide font-medium">Bag</span>
              {mounted && cartCount > 0 && (
                <span
                  className={`px-1 sm:px-1.5 py-0.2 min-w-[16px] h-3.5 sm:h-4 rounded-full bg-white text-[#0C0D11] text-[8px] sm:text-[9px] font-mono font-black flex items-center justify-center transition-transform duration-300 ${
                    cartPulse ? "scale-125" : "scale-100"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-full text-[#0C0D11] hover:bg-black/[0.05] transition-all active:scale-90"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <WishlistDrawer />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#0C0D11]/40 backdrop-blur-xs transition-opacity duration-300 ease-out"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-[85%] max-w-xs bg-[#FAFAFC] h-full shadow-2xl flex flex-col p-5 sm:p-6 z-10 border-l border-black/[0.06] transition-transform duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0C0D11] text-white text-xs font-serif font-bold flex items-center justify-center">
                  R
                </span>
                <span className="font-extrabold text-xs tracking-wider uppercase text-[#0C0D11]">
                  Radha Atelier
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-[#4A4D59] hover:bg-black/[0.05] active:scale-90"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex flex-col space-y-1 pt-4 overflow-y-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      active
                        ? "bg-[#0C0D11] text-white"
                        : "text-[#585C6D] hover:bg-black/[0.035] hover:text-[#0C0D11]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (openWishlist) openWishlist();
                }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide text-[#585C6D] hover:bg-rose-50/80 hover:text-rose-700 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Saved Pieces
                </span>
                {wishlistItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide bg-blue-50 text-blue-600"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <div className="pt-4 border-t border-black/[0.06] mt-2 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.05] text-[#0C0D11] font-bold text-xs"
                    >
                      Account ({user.name})
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="px-3.5 py-1 text-left text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#0C0D11] text-white text-center font-bold text-xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.06] text-[#0C0D11] text-center font-bold text-xs"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </nav>

            <div className="mt-auto pt-4 border-t border-black/[0.06] text-[9px] text-[#8E92A2] flex flex-col space-y-0.5">
              <span className="font-bold tracking-wider text-[#0C0D11]">RADHA ATELIER</span>
              <span>© {new Date().getFullYear()} Contemporary Couture</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}