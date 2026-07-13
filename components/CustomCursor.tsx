"use client";

import { useEffect, useRef, useState } from "react";

// Small neon dot + lagging outline ring that replaces the OS cursor on
// desktop/mouse devices. Grows on hoverable elements (links, buttons,
// inputs) for a bit of tactile feedback. Automatically disables itself
// on touch devices so it never gets in the way on mobile.
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || reducedMotion) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement;
      setHovering(!!target.closest("a, button, input, textarea, select, [role='button'], .cursor-pointer"));
    };

    const onLeave = () => setVisible(false);

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [visible]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${hovering ? "is-hovering" : ""} ${visible ? "is-visible" : ""}`}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${hovering ? "is-hovering" : ""} ${visible ? "is-visible" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}
