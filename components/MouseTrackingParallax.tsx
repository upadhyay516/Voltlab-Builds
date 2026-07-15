"use client";

import { useEffect, useRef, useState } from "react";

// Wraps content so it visibly tilts and shifts toward the cursor as it
// moves over it — an interactive 3D depth effect. Disabled automatically
// when the person prefers reduced motion, and has no effect on touch
// devices (there's no cursor to track).
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
  const [pos, setPos] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    function handleMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Only react while the cursor is actually over this element
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        setPos({ x: 0, y: 0, rx: 0, ry: 0 });
        return;
      }
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const offsetX = (e.clientX - rect.left - cx) / cx; // -1 to 1
      const offsetY = (e.clientY - rect.top - cy) / cy; // -1 to 1

      setPos({
        x: offsetX * 20 * intensity,
        y: offsetY * 20 * intensity,
        ry: offsetX * 10 * intensity, // rotate toward cursor horizontally
        rx: -offsetY * 10 * intensity, // rotate toward cursor vertically
      });
    }

    function handleLeave() {
      setPos({ x: 0, y: 0, rx: 0, ry: 0 });
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [intensity, reducedMotion]);

  return (
    <div ref={containerRef} className={className} style={{ perspective: "800px" }}>
      <div
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) rotateX(${pos.rx}deg) rotateY(${pos.ry}deg)`,
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
