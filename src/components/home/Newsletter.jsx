"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[var(--text-primary)]">
          Stay in the loop.
        </h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)] font-light leading-relaxed">
          Sign up to receive private invitations to seasonal releases, editorial narratives, and subscriber-only previews.
        </p>

        {subscribed ? (
          <p className="mt-6 text-xs uppercase tracking-widest text-[var(--text-primary)] font-medium">
            Thank you for subscribing.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-grow px-4 py-3 text-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:border-[var(--text-primary)] focus:outline-none transition-colors rounded-[var(--radius-sm)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs uppercase tracking-widest font-medium bg-[var(--accent-dark)] text-[var(--bg-surface)] hover:opacity-90 transition-opacity rounded-[var(--radius-sm)]"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}