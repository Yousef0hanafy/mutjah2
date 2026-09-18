"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/language-provider";
import { SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

/**
 * The engagement flow visualized as the Open Route:
 * five stations on one line — the last stop resolves into a "working form" square.
 */
export function Process() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  return (
    <section
      id="process"
      data-animate
      aria-labelledby="process-heading"
      className="relative overflow-hidden bg-ink text-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid text-canvas/[0.05] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          label={t.process.label}
          heading={t.process.heading}
          sub={t.process.sub}
          dark
        />

        {/* Desktop route */}
        <div className="relative mt-16 hidden lg:block">
          <motion.span
            aria-hidden
            className="absolute start-[10px] end-[10px] top-[7px] h-0.5 origin-right bg-canvas/15"
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "right" }}
          />
          <ol className="relative grid grid-cols-5 gap-6">
            {t.process.steps.map((step, i) => {
              const isLast = i === t.process.steps.length - 1;
              return (
                <motion.li
                  key={step.title}
                  initial={reduce ? {} : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.25 + i * 0.18 }}
                  className="flex flex-col"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mb-6 block size-[15px]",
                      i === 0
                        ? "rounded-full bg-coral ring-[5px] ring-ink"
                        : isLast
                          ? "rotate-45 rounded-[4px] bg-vector ring-[5px] ring-ink"
                          : "rounded-full bg-vector ring-[5px] ring-ink"
                    )}
                  />
                  <span className="font-meta text-sm font-bold text-canvas/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-canvas">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-7 text-canvas/55">{step.desc}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Mobile vertical route */}
        <ol className="relative mt-12 flex flex-col gap-10 lg:hidden">
          <span
            aria-hidden
            className="absolute bottom-2 end-[7px] top-2 w-0.5 bg-canvas/15"
          />
          {t.process.steps.map((step, i) => {
            const isLast = i === t.process.steps.length - 1;
            return (
              <motion.li
                key={step.title}
                initial={reduce ? {} : { opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative pe-10"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute end-0 top-1 block size-[15px]",
                    i === 0
                      ? "rounded-full bg-coral ring-[5px] ring-ink"
                      : isLast
                        ? "rotate-45 rounded-[4px] bg-vector ring-[5px] ring-ink"
                        : "rounded-full bg-vector ring-[5px] ring-ink"
                  )}
                />
                <span className="font-meta text-sm font-bold text-canvas/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-canvas">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-canvas/55">{step.desc}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
