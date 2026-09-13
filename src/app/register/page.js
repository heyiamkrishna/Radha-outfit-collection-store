"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Lock, Mail, User, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateGmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(trimmed);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, email: val }));
    if (emailError) setEmailError("");
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!validateGmail(formData.email)) {
      setEmailError("Only personal Google accounts ending in @gmail.com are accepted.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-3.5 sm:px-6 py-10 sm:py-16 overflow-hidden selection:bg-[#0C0D11] selection:text-white">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-10 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-blue-100/35 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-rose-100/25 via-amber-50/20 to-transparent rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 shadow-[0_20px_50px_-15px_rgba(12,13,17,0.05)] border border-white/90 ring-1 ring-black/[0.03]">
        {/* Header */}
        <div className="text-center space-y-2 pb-5 border-b border-black/[0.05]">
          <div className="w-10 h-10 rounded-full bg-[#0C0D11] text-white text-xs font-serif font-black flex items-center justify-center mx-auto shadow-xs">
            R
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-blue-50 text-[#3B7BF6] border border-blue-100/60">
            <Sparkles className="w-2.5 h-2.5" /> Patron Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#0C0D11] tracking-tight">
            Create Account
          </h1>
          <p className="text-[11px] sm:text-xs text-[#8E92A2] max-w-xs mx-auto">
            Join the ROC Atelier using your verified Google account.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#4A4D59] uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#FAFAFC] focus:bg-white border border-black/[0.07] focus:border-[#0C0D11] text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2]"
              />
              <User className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#4A4D59] uppercase tracking-wider block">
              Gmail Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={handleEmailChange}
                placeholder="client@gmail.com"
                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#FAFAFC] border text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2] ${
                  emailError
                    ? "border-rose-400 bg-rose-50/30 ring-2 ring-rose-500/10"
                    : "border-black/[0.07] focus:bg-white focus:border-[#0C0D11]"
                }`}
              />
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  emailError ? "text-rose-500" : "text-[#8E92A2]"
                }`}
              />
            </div>

            {emailError && (
              <div className="pt-0.5 flex items-center gap-1.5 text-[10.5px] text-rose-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#4A4D59] uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#FAFAFC] focus:bg-white border border-black/[0.07] focus:border-[#0C0D11] text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2]"
              />
              <Lock className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 sm:py-4 rounded-full bg-[#0C0D11] hover:bg-[#1E2028] text-white text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Registering..." : "Create Account"}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-black/[0.05] text-center">
          <p className="text-xs text-[#8E92A2]">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-bold text-[#0C0D11] hover:text-[#3B7BF6] transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10.5px] font-mono text-[#8E92A2]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy & Personal Data Protected</span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0C0D11] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}