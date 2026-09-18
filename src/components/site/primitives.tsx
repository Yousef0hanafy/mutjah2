"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Scroll-reveal wrapper — reveals once, respects reduced motion */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
