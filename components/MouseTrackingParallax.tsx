"use client";

import { useEffect, useRef, useState } from "react";

// Wraps content so it subtly shifts toward/away from the cursor as it
// moves — an interactive depth effect. Disabled automatically when the
// person prefers reduced motion (checked once on mount).
export default function MouseTrackingParallax({
  children,
  intensity = 1,
  className = "",
}: {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let ticking = false;

    function handleMove(e: MouseEvent) {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const offsetX = (e.clientX - rect.left - cx) / cx;
          const offsetY = (e.clientY - rect.top - cy) / cy;
          setPos({ x: offsetX * 12 * intensity, y: offsetY * 12 * intensity });
        }
        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [intensity, reducedMotion]);

  return (
    <div ref={containerRef} className={className}>
      <div
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: "transform 0.3s ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
