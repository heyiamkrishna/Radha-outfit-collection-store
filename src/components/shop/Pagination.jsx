"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ totalPages, currentPage }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigateToPage = (targetPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", targetPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav className="mt-16 pt-8 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2">
      <button
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--border-hover)] text-[var(--text-primary)]"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
        <button
          key={pg}
          onClick={() => navigateToPage(pg)}
          className={`w-8 h-8 text-xs rounded-[var(--radius-sm)] border transition-all ${
            pg === currentPage
              ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-white"
              : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          {pg}
        </button>
      ))}

      <button
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--border-hover)] text-[var(--text-primary)]"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}