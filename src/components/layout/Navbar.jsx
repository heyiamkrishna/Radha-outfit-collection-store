"use client";

import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  // Cart & Wishlist Store Hooks
  const openDrawer = useCartStore((state) => state.openDrawer);
  const cart = useCartStore((state) => state.cart || state.items || []);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items || []);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);

    // Read authenticated session state
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    // Sync cart quantity
    try {
      if (cart && cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("atelier_guest_cart") || "[]"
        );
        const totalQty = guestCart.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        setCartCount(totalQty);
      }
    } catch (_) {}

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, cart]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/shop" },
    { label: "Collection", href: "/shop?category=women" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-3 sm:px-6 md:px-12 pt-3 pb-2 transition-all">
        <div
          className={`max-w-7xl mx-auto rounded-[24px] sm:rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            isScrolled
              ? "bg-white/90 backdrop-blur-xl border-[#E8EBF2] shadow-[0_8px_25px_rgba(16,24,40,0.06)]"
              : "bg-white/75 backdrop-blur-md border-[#E8EBF2]/70"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-full bg-[#0C0D11] text-white text-xs font-bold flex items-center justify-center shadow-xs">
              R
            </span>
            <span className="font-extrabold tracking-tight text-sm uppercase text-[#0C0D11] whitespace-nowrap">
              ROC
              <span className="hidden sm:inline-block font-normal text-xs text-[#8E92A2] ml-1.5 normal-case">
                Radha Outfit Collection
              </span>
            </span>
          </Link>

          {/* Center Links (Desktop only) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    active
                      ? "bg-[#0C0D11] text-white shadow-xs"
                      : "text-[#4A4D59] hover:text-[#0C0D11] hover:bg-[#F4F5F9]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 text-[#0C0D11]">
            {/* Search Button */}
            <Link
              href="/shop"
              className="p-2 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] transition-colors"
              aria-label="Search Collection"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A4D59]" />
            </Link>

            {/* Admin Desk Shortcut (Only rendered for Admins) */}
            {mounted && user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0C0D11] text-white hover:bg-[#3B7BF6] transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Admin Atelier</span>
              </Link>
            )}

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  href="/account"
                  className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#0C0D11] hover:text-[#3B7BF6] transition-colors px-2"
                >
                  {user.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-[#F4F5F9] hover:bg-rose-50 text-[#8E92A2] hover:text-rose-600 transition-colors hidden sm:inline-block cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`p-2 rounded-full bg-[#F4F5F9] hover:bg-[#E8EBF2] transition-colors hidden sm:inline-block ${
                  pathname === "/login" ? "ring-1 ring-[#0C0D11]" : ""
                }`}
                aria-label="Sign In"
              >
                <User className="w-4 h-4 text-[#4A4D59]" />
              </Link>
            )}

            {/* Wishlist Heart Trigger Button */}
            <button
              type="button"
              onClick={toggleWishlist}
              className="relative p-2 rounded-full bg-[#F4F5F9] hover:bg-rose-50 text-[#4A4D59] hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="View Saved Garments"
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              onClick={(e) => {
                if (window.innerWidth >= 640 && openDrawer) {
                  e.preventDefault();
                  openDrawer();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#EBF1FD] text-[#3B7BF6] hover:bg-[#dfe9fb] transition-colors font-bold text-xs"
              aria-label="Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Bag</span>
              {mounted && cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#3B7BF6] text-white text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full bg-[#F4F5F9] text-[#0C0D11] hover:bg-[#E8EBF2] transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Wishlist Drawer */}
      <WishlistDrawer />

      {/* Mobile Drawer (Slides in from the right) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#0C0D11]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col p-6 z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#E8EBF2]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#0C0D11] text-white text-xs font-bold flex items-center justify-center">
                  R
                </span>
                <span className="font-extrabold text-xs tracking-tight uppercase text-[#0C0D11]">
                  ROC Navigation
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#F4F5F9] text-[#4A4D59] hover:text-[#0C0D11]"
                aria-label="Close Navigation Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-2 pt-6">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                      active
                        ? "bg-[#0C0D11] text-white"
                        : "text-[#4A4D59] hover:bg-[#F4F5F9] hover:text-[#0C0D11]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                );
              })}

              {/* Wishlist Link for Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleWishlist();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide text-[#4A4D59] hover:bg-[#F4F5F9] hover:text-[#0C0D11] transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Saved Pieces
                </span>
                {wishlistItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-mono">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Mobile Admin Link */}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide bg-blue-50 text-[#3B7BF6]"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Operations
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* User Account / Auth Actions */}
              <div className="pt-6 border-t border-[#E8EBF2] mt-4 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-[#F4F5F9] text-[#0C0D11] font-bold text-xs"
                    >
                      Account ({user.name})
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="px-4 py-2 text-left text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-2xl bg-[#0C0D11] text-white text-center font-bold text-xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-2xl bg-[#F4F5F9] text-[#0C0D11] text-center font-bold text-xs"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Bottom Meta */}
            <div className="mt-auto pt-6 border-t border-[#E8EBF2] text-[10px] text-[#8E92A2] flex flex-col space-y-1">
              <span className="font-bold text-[#0C0D11]">
                RADHA OUTFIT COLLECTION (ROC)
              </span>
              <span>© {new Date().getFullYear()} All Rights Reserved.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}