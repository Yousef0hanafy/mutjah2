"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper — visibility never depends on JavaScript.
 *
 * Invariant: the server renders every Reveal FULLY VISIBLE (no inline
 * opacity/transform), so the page is complete and readable even if JS
 * never runs. After mount, only elements lying completely below the
 * viewport get armed (hidden client-side — invisible to the user anyway)
 * and revealed on scroll via IntersectionObserver. Every failure mode
 * degrades to visible content:
 *   - JS disabled / hydration dead  → never armed → visible
 *   - IntersectionObserver missing  → never armed → visible
 *   - IO present but dead           → JsMounted probe flips the global
 *                                     fail-open flag (globals.css)
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  x = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<Element | null>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (reduce) return;
    if (typeof IntersectionObserver === "undefined") return;
    // Arm after the first paint (rAF) so the server-visible state always
    // renders first. Only elements completely below the fold get hidden —
    // zero flash risk, and if anything above fails, content stays visible.
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight && rect.bottom > 0) {
        setArmed(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = as;
  const hidden = armed && !inView;
  const style = hidden
    ? { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0)` }
    : armed
      ? {
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        }
      : undefined;

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={className}
      style={style}
      data-reveal={hidden ? "hidden" : armed ? "revealed" : "idle"}
    >
      {children}
    </Tag>
  );
}

/** The brand point — a coral dot that marks a real start */
export function Point({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full bg-coral", className)}
    />
  );
}

/** Editorial section header: coral point + meta label, then heading + sub */
export function SectionHeading({
  label,
  heading,
  sub,
  align = "start",
  dark = false,
}: {
  label: string;
  heading: string;
  sub?: string;
  align?: "start" | "center";
  dark?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2.5 text-sm font-semibold",
          dark ? "text-canvas/60" : "text-ink/60"
        )}
      >
        <Point />
        {label}
      </span>
      <h2
        className={cn(
          "max-w-3xl text-3xl font-extrabold leading-[1.25] sm:text-4xl lg:text-[2.6rem]",
          dark ? "text-canvas" : "text-ink"
        )}
      >
        {heading}
      </h2>
      {sub ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-8",
            dark ? "text-canvas/60" : "text-ink/65"
          )}
        >
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}
