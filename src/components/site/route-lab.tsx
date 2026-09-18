"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./primitives";

const W = 880;
const VECTOR = "#315BFF";
const CORAL = "#FF6247";

/**
 * RouteLab — the message you can play.
 *
 * The visitor picks a starting state (a vague need, an idea, manual work…)
 * and the brand route draws itself from that state through the two gates
 * (clarify → build) into a working asset, with a coral pulse traveling it.
 * Content is server-rendered fully visible; drawing/traveling are pure
 * enhancement (fail-open CSS + static fallback cover JS failure).
 */
export function RouteLab() {
  const { t, dir } = useLanguage();
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const rtl = dir === "rtl";
  const mx = (x: number) => (rtl ? W - x : x);

  const item = t.movement.items[idx];

  // LTR geometry — start node (120,210) → S-jog → destination card edge (610,90).
  // Mirrored for RTL so the journey always follows the reading direction
  // (RTL readers travel right → left, like the Process route).
  const d = rtl
    ? `M ${mx(120)} 210 H ${mx(410)} Q ${mx(450)} 210 ${mx(450)} 170 V 130 Q ${mx(450)} 90 ${mx(490)} 90 H ${mx(610)}`
    : `M 120 210 H 410 Q 450 210 450 170 V 130 Q 450 90 490 90 H 610`;

  const gate1x = mx(320); // lower run
  const gate2x = mx(550); // upper run
  const startX = mx(120);
  // rect spans [610..820] in LTR; mirrored to [60..270] in RTL
  const cardX = rtl ? W - 820 : 610;
  const cardCx = mx(715);

  const draw = reduce
    ? {}
    : {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] as const },
      };

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.45, delay },
        };

  return (
    <section
      id="route"
      data-animate
      aria-labelledby="route-lab-heading"
      className="relative overflow-hidden bg-ink text-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid text-canvas/[0.05] [mask-image:radial-gradient(ellipse_65%_70%_at_50%_45%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-[8%] size-80 rounded-full bg-vector/15 blur-[110px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          label={t.routeLab.label}
          heading={t.routeLab.heading}
          sub={t.routeLab.sub}
          dark
        />

        <Reveal className="relative mt-12 overflow-hidden rounded-3xl border border-canvas/10 bg-white/[0.03] p-4 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 end-[6%] size-72 rounded-full bg-coral/10 blur-[100px]"
          />

          {/* ── Desktop: the route scene ─────────────────────────── */}
          <div className="relative hidden sm:block">
            <svg
              viewBox="0 30 880 290"
              className="h-auto w-full"
              role="img"
              aria-label={`${t.routeLab.startTag}: ${item.from} — ${t.routeLab.endTag}: ${item.to}`}
            >
              {/* route halo + route */}
              <path
                d={d}
                fill="none"
                stroke={VECTOR}
                strokeWidth={13}
                strokeLinecap="round"
                opacity={0.16}
              />
              <motion.path
                key={`route-${idx}`}
                d={d}
                fill="none"
                stroke={VECTOR}
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...draw}
              />

              {/* traveling pulse */}
              {!reduce && (
                <g key={`pulse-${idx}`}>
                  <circle r={10} fill={CORAL} opacity={0.25}>
                    <animateMotion dur="2.8s" repeatCount="indefinite" path={d} />
                  </circle>
                  <circle r={5} fill={CORAL}>
                    <animateMotion dur="2.8s" repeatCount="indefinite" path={d} />
                  </circle>
                </g>
              )}

              {/* start node */}
              <circle cx={startX} cy={210} r={17} fill="none" stroke={CORAL} strokeWidth={1.5} opacity={0.4} />
              <circle cx={startX} cy={210} r={8.5} fill={CORAL} />
              <text
                x={startX}
                y={158}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="var(--canvas)"
                opacity={0.45}
                style={{ fontFamily: "var(--font-manrope), var(--font-alexandria), sans-serif" }}
              >
                {t.routeLab.startTag}
              </text>
              <text
                key={`from-${idx}`}
                x={startX}
                y={185}
                textAnchor="middle"
                fontSize={16}
                fontWeight={600}
                fill="var(--canvas)"
                {...fade()}
              >
                {item.from}
              </text>

              {/* gate 1 — lower run */}
              <line x1={gate1x} y1={184} x2={gate1x} y2={236} stroke="var(--canvas)" strokeWidth={6} strokeLinecap="round" opacity={0.55} />
              <text x={gate1x} y={262} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--canvas)" opacity={0.4}
                style={{ fontFamily: "var(--font-manrope), var(--font-alexandria), sans-serif" }}>
                01
              </text>
              <text x={gate1x} y={282} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--canvas)" opacity={0.8}>
                {t.routeLab.gateA}
              </text>

              {/* gate 2 — upper run */}
              <line x1={gate2x} y1={64} x2={gate2x} y2={116} stroke="var(--canvas)" strokeWidth={6} strokeLinecap="round" opacity={0.55} />
              <text x={gate2x} y={40} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--canvas)" opacity={0.4}
                style={{ fontFamily: "var(--font-manrope), var(--font-alexandria), sans-serif" }}>
                02
              </text>
              <text x={gate2x} y={58} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--canvas)" opacity={0.8}>
                {t.routeLab.gateB}
              </text>

              {/* destination card */}
              <text x={cardCx} y={46} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--canvas)" opacity={0.45}
                style={{ fontFamily: "var(--font-manrope), var(--font-alexandria), sans-serif" }}>
                {t.routeLab.endTag}
              </text>
              <rect x={cardX} y={58} width={210} height={64} rx={16} fill="#FFFFFF" />
              <motion.text
                key={`to-${idx}`}
                x={cardCx}
                y={96}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill="var(--ink)"
                {...fade()}
              >
                {item.to}
              </motion.text>
            </svg>
          </div>

          {/* ── Mobile: vertical stepper (same story, crisp text) ── */}
          <div className="relative sm:hidden">
            <div className="rounded-2xl border border-coral/40 bg-coral/10 p-4">
              <p className="font-meta text-[11px] font-bold uppercase tracking-wider text-coral/90">
                {t.routeLab.startTag}
              </p>
              <p className="mt-1 text-base font-bold text-canvas">{item.from}</p>
            </div>

            <div className="relative mx-auto h-9 w-px bg-canvas/20">
              {!reduce && (
                <motion.span
                  key={`mp1-${idx}`}
                  aria-hidden
                  className="absolute -start-[3px] top-0 size-[7px] rounded-full bg-coral"
                  animate={{ y: [0, 36] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            <div className="flex items-center gap-3 py-1.5">
              <span className="font-meta text-xs font-bold text-canvas/40">01</span>
              <span className="text-sm font-semibold text-canvas/85">{t.routeLab.gateA}</span>
            </div>
            <div aria-hidden className="mx-auto h-6 w-px bg-canvas/20" />
            <div className="flex items-center gap-3 py-1.5">
              <span className="font-meta text-xs font-bold text-canvas/40">02</span>
              <span className="text-sm font-semibold text-canvas/85">{t.routeLab.gateB}</span>
            </div>

            <div className="relative mx-auto h-9 w-px bg-canvas/20">
              {!reduce && (
                <motion.span
                  key={`mp2-${idx}`}
                  aria-hidden
                  className="absolute -start-[3px] top-0 size-[7px] rounded-full bg-coral"
                  animate={{ y: [0, 36] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            <div className="rounded-2xl bg-canvas p-4">
              <p className="font-meta text-[11px] font-bold uppercase tracking-wider text-ink/45">
                {t.routeLab.endTag}
              </p>
              <p className="mt-1 text-base font-bold text-ink">{item.to}</p>
            </div>
          </div>

          {/* ── State picker ─────────────────────────────────────── */}
          <div className="relative mt-8 border-t border-canvas/10 pt-7">
            <p className="text-sm font-semibold text-canvas/50">{t.routeLab.tryLabel}</p>
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {t.movement.items.map((it, i) => (
                <button
                  key={it.from}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-pressed={i === idx}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                    i === idx
                      ? "border-coral bg-coral text-white shadow-[0_10px_26px_-12px_rgba(255,98,71,0.8)]"
                      : "border-canvas/20 text-canvas/65 hover:border-canvas/50 hover:text-canvas"
                  )}
                >
                  {it.from}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-7 text-canvas/55">{t.routeLab.caption}</p>
          <Button
            asChild
            className="h-12 shrink-0 rounded-xl bg-canvas px-7 text-base font-semibold text-ink transition-colors hover:bg-coral hover:text-white"
          >
            <a href="#contact">{t.routeLab.cta}</a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
