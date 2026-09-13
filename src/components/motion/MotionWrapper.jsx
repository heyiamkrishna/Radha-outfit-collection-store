"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Universal editorial viewport reveal system
 * @param {'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right'} variant
 */
export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.12,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const currentElem = elementRef.current;
    if (currentElem) observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [threshold]);

  const getVariantStyles = () => {
    switch (variant) {
      case "fade-in":
        return isVisible
          ? "opacity-100"
          : "opacity-0";
      case "scale-in":
        return isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-[0.97]";
      case "slide-left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-6";
      case "slide-right":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-6";
      case "fade-up":
      default:
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6";
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all will-change-[transform,opacity] ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Stagger parent container for card grids and sequential lists
 */
export function StaggerGroup({ children, staggerMs = 80, className = "" }) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollReveal key={index} delay={index * staggerMs} variant="fade-up">
              {child}
            </ScrollReveal>
          ))
        : children}
    </div>
  );
}