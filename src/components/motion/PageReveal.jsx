"use client";

import { usePathname } from "next/navigation";

export default function PageReveal({ children }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-luxury-fade flex-grow flex flex-col w-full"
    >
      {children}
    </div>
  );
}