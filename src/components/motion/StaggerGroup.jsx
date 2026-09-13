"use client";

import React, { useEffect, useRef, useState } from "react";

export default function StaggerGroup({
  children,
  className = "",
  staggerMs = 70,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translate3d(0, 0, 0)" : "translate3d(0, 22px, 0)",
              transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms`,
              willChange: "transform, opacity",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}