"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Lock, Mail, User, ShieldCheck, AlertCircle } from "lucide-react";

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

    // Strict @gmail.com Check
    if (!validateGmail(formData.email)) {
      setEmailError("Only email addresses ending in @gmail.com are accepted.");
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
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-[32px] sm:rounded-[36px] p-7 sm:p-10 shadow-[0_15px_40px_-10px_rgba(16,24,40,0.06)] border border-[#E8EBF2]">
        
        {/* Header */}
        <div className="text-center space-y-2 pb-6 border-b border-[#F4F5F9]">
          <div className="w-10 h-10 rounded-full bg-[#0C0D11] text-white text-xs font-extrabold flex items-center justify-center mx-auto shadow-xs">
            R
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#EBF1FD] text-[#3B7BF6]">
            Membership
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C0D11] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-[#8E92A2] max-w-xs mx-auto">
            Join the ROC Atelier using your verified Google Gmail account.
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100/80 text-rose-600 text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4A4D59] uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#F4F5F9] border border-transparent focus:border-[#0C0D11] text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2]"
              />
              <User className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4A4D59] uppercase tracking-wider">
              Gmail Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={handleEmailChange}
                placeholder="jane@gmail.com"
                className={`w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#F4F5F9] border text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2] ${
                  emailError
                    ? "border-rose-400 bg-rose-50/30 ring-2 ring-rose-500/10"
                    : "border-transparent focus:border-[#0C0D11]"
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${emailError ? "text-rose-500" : "text-[#8E92A2]"}`} />
            </div>

            {/* Beauty Error Badge */}
            {emailError && (
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-rose-500 font-medium animate-in slide-in-from-top-1 duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4A4D59] uppercase tracking-wider">
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
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#F4F5F9] border border-transparent focus:border-[#0C0D11] text-xs text-[#0C0D11] outline-none transition-all placeholder:text-[#8E92A2]"
              />
              <Lock className="w-4 h-4 text-[#8E92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-full bg-[#0C0D11] hover:bg-[#3B7BF6] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create Account"} <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F4F5F9] text-center">
          <p className="text-xs text-[#8E92A2]">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-bold text-[#0C0D11] hover:text-[#3B7BF6] transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#8E92A2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
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