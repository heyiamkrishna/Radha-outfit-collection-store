"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/shop");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-6 py-16 bg-[#FAF9F6]">
      {/* Centered Minimalist Card */}
      <div className="w-full max-w-md bg-white border border-[var(--border-subtle)] rounded-2xl p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] font-medium">
            Atelier Account
          </span>
          <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)] mt-1">
            Welcome Back
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-light mt-1.5">
            Sign in to access your bag, saved pieces, and orders.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50/60 border border-red-200 rounded-[var(--radius-sm)] flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@atelier.com"
              className="w-full text-xs px-3.5 py-2.5 bg-[#FAF9F6]/50 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                Password
              </label>
              <a
                href="#"
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 bg-[#FAF9F6]/50 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[var(--accent-dark)] text-white text-xs uppercase tracking-[0.15em] font-medium rounded-[var(--radius-sm)] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[var(--text-primary)] font-medium hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}