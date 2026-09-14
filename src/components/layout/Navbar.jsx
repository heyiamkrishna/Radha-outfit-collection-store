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
  Sparkles,
  ChevronRight,
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
    { label: "Atelier", href: "/about" },
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

  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full px-2.5 sm:px-5 md:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "pt-2 sm:pt-2.5 pb-1.5" : "pt-3 sm:pt-4 pb-2"
        } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border ${
            isScrolled
              ? "bg-[#FAFBFD]/90 backdrop-blur-2xl border-black/[0.08] shadow-[0_12px_36px_-8px_rgba(12,13,17,0.07)] ring-1 ring-black/[0.02]"
              : "bg-white/80 backdrop-blur-xl border-black/[0.05] shadow-[0_4px_20px_-6px_rgba(12,13,17,0.03)]"
          }`}
        >
          {/* ── 1. LOGO & ATELIER IDENTITY ── */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 shrink-0 select-none active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0C0D11] text-white flex items-center justify-center shadow-xs group-hover:bg-[#1E2028] transition-colors">
              <span className="font-serif font-black text-xs sm:text-sm tracking-tight">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black tracking-tight text-xs sm:text-sm uppercase text-[#0C0D11] leading-none">
                Radha Outfit
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-[0.25em] text-[#8E92A2] -mt-0.5">
                Couture • Atelier
              </span>
            </div>
          </Link>

          {/* ── 2. DESKTOP NAVIGATION PILL CAPSULE ── */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-black/[0.02] rounded-full border border-black/[0.03]">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3.5 lg:px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                    active
                      ? "bg-[#0C0D11] text-white shadow-2xs"
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

          {/* ── 3. ACTIONS PANEL ── */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 text-[#0C0D11]">
            {/* Search */}
            <Link
              href="/shop"
              className="p-2 rounded-full text-[#4A4D59] hover:text-[#0C0D11] hover:bg-black/[0.04] transition-all active:scale-90"
              aria-label="Search Collection"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Admin Console Shortcut */}
            {mounted && user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-mono font-black uppercase tracking-widest bg-[#0C0D11] text-white hover:bg-[#1E2028] shadow-2xs transition-all active:scale-95"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Console</span>
              </Link>
            )}

            {/* User Account / Auth */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-0.5">
                <Link
                  href="/account"
                  className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors px-2.5 py-1 rounded-full hover:bg-black/[0.04]"
                >
                  {user.name?.split(" ")[0]}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#8E92A2] hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
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

            {/* Wishlist Trigger */}
            <button
              type="button"
              onClick={() => openWishlist && openWishlist()}
              className="relative p-2 rounded-full text-[#4A4D59] hover:text-rose-600 hover:bg-rose-50/70 transition-all active:scale-90 cursor-pointer"
              aria-label="View Saved Garments"
            >
              <Heart className="w-4 h-4" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 animate-in zoom-in-50 duration-150">
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-white text-[8px] font-mono font-bold items-center justify-center ring-2 ring-white">
                    {wishlistCount}
                  </span>
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={() => {
                if (openCartDrawer) {
                  openCartDrawer();
                } else {
                  window.location.href = "/cart";
                }
              }}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#0C0D11] text-white hover:bg-[#1C1E26] transition-all font-mono font-bold text-xs active:scale-95 shadow-2xs cursor-pointer ${
                cartPulse ? "ring-2 ring-black/20 scale-105" : ""
              }`}
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/95" />
              <span className="hidden sm:inline tracking-wider uppercase text-[10.5px]">Bag</span>
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

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-full text-[#0C0D11] hover:bg-black/[0.05] transition-all active:scale-90 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── WISHLIST DRAWER MODAL ── */}
      <WishlistDrawer />

      {/* ── RESPONSIVE MOBILE ATELIER CANVAS ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-[#0C0D11]/60 backdrop-blur-xs transition-opacity duration-300 ease-out"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Canvas */}
          <div className="relative w-[85%] max-w-xs bg-[#FAFBFD] h-full shadow-2xl flex flex-col justify-between p-5 sm:p-6 z-10 border-l border-black/[0.06] transition-transform duration-300 animate-in slide-in-from-right">
            <div>
              {/* Top Brand Stripe */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0C0D11] text-white text-xs font-serif font-bold flex items-center justify-center shadow-xs">
                    R
                  </span>
                  <div className="flex flex-col">
                    <span className="font-serif font-black text-xs tracking-tight uppercase text-[#0C0D11]">
                      Radha Outfit
                    </span>
                    <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#8E92A2] -mt-0.5">
                      Collection
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-[#4A4D59] hover:bg-black/[0.05] active:scale-90 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1 pt-4 overflow-y-auto">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                        active
                          ? "bg-[#0C0D11] text-white shadow-2xs"
                          : "text-[#585C6D] hover:bg-black/[0.035] hover:text-[#0C0D11]"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-white" : "text-neutral-300"}`} />
                    </Link>
                  );
                })}

                {/* Saved Pieces Item */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (openWishlist) openWishlist();
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider text-[#585C6D] hover:bg-rose-50/80 hover:text-rose-700 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Saved Pieces
                  </span>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9.5px] font-mono font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Admin Console Pill */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3B7BF6]" /> Admin Console
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </nav>
            </div>

            {/* Mobile Footer Auth Section */}
            <div className="pt-4 border-t border-black/[0.06] space-y-2.5">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-black/[0.06] text-[#0C0D11] font-mono font-bold text-xs uppercase shadow-2xs"
                  >
                    <span>{user.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#8E92A2]" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 text-center text-xs font-mono uppercase text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full bg-[#0C0D11] text-white text-center font-mono font-bold text-xs uppercase tracking-wider shadow-2xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full bg-white border border-black/[0.08] text-[#0C0D11] text-center font-mono font-bold text-xs uppercase tracking-wider"
                  >
                    Register
                  </Link>
                </div>
              )}

              <div className="pt-2 text-[8px] font-mono text-[#8E92A2] uppercase tracking-widest text-center">
                Radha Outfit Collection • Contemporary Atelier
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}