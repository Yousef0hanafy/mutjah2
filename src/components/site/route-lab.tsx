"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  const [idx, setIdx] = useState(0);
  const rtl = dir === "rtl";
  const mx = (x: number) => (rtl ? W - x : x);

  const item = t.movement.items[idx];

  // Spacious 960px canvas with zero overlapping:
  // Lower level Y=250, Upper level Y=125, Vertical separation = 125px
  const d = rtl
    ? `M 850 250 H 550 C 490 250 490 125 430 125 H 230`
    : `M 110 250 H 410 C 470 250 470 125 530 125 H 730`;

  const startX = rtl ? 850 : 110;
  const gate1x = rtl ? 680 : 280;
  const gate2x = rtl ? 350 : 610;
  const cardX = rtl ? 20 : 730;
  const dockX = rtl ? 230 : 730;

  const draw = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] as const },
  };

  const fade = (delay = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.45, delay },
  });

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

        <Reveal className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#10141C]/80 to-[#10141C] p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 end-[6%] size-72 rounded-full bg-coral/10 blur-[100px]"
          />

          {/* ── Desktop: The Holographic Vector Highway ─────────────── */}
          <div className="relative hidden sm:block">
            <svg
              viewBox="0 25 960 330"
              className="h-auto w-full select-none"
              role="img"
              aria-label={`${t.routeLab.startTag}: ${item.from} — ${t.routeLab.endTag}: ${item.to}`}
            >
              <defs>
                {/* Luminous Multi-stop Vector Gradient */}
                <linearGradient
                  id="neonGradient"
                  x1={rtl ? "100%" : "0%"}
                  y1="100%"
                  x2={rtl ? "0%" : "100%"}
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FF6247" />
                  <stop offset="45%" stopColor="#315BFF" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>

                {/* Ambient Laser Halo Filter */}
                <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Holographic Pod Background */}
                <linearGradient id="podBackground" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1B2232" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0E131E" stopOpacity="0.98" />
                </linearGradient>

                {/* Holographic Pod Border */}
                <linearGradient id="podBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#315BFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF6247" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Layer 1: Ambient Neon Glow Conduit */}
              <path
                d={d}
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth={18}
                strokeLinecap="round"
                opacity={0.22}
                filter="url(#neonGlowFilter)"
              />

              {/* Layer 2: Main Vector Beam */}
              <motion.path
                key={`route-${idx}`}
                d={d}
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...draw}
              />

              {/* Layer 3: Inner Laser Core Line */}
              <path
                d={d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.65}
              />

              {/* Layer 4: Aerodynamic Traveling Laser Comet */}
              <g key={`pulse-${idx}`}>
                <g>
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    rotate="auto"
                    path={d}
                  />
                  {/* Streaming neon light-tail */}
                  <line
                    x1={-22}
                    y1={0}
                    x2={0}
                    y2={0}
                    stroke="url(#neonGradient)"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                  {/* Ambient photon glow */}
                  <circle
                    cx={0}
                    cy={0}
                    r={8}
                    fill="#FF6247"
                    opacity={0.45}
                    filter="url(#neonGlowFilter)"
                  />
                  {/* Leading white core */}
                  <circle cx={0} cy={0} r={3} fill="#FFFFFF" />
                </g>
              </g>

              {/* ── Station 0: Origin (نقطة البداية) ── */}
              <g>
                {/* Radar ring pulse */}
                <circle cx={startX} cy={250} r={24} fill="none" stroke="#FF6247" strokeWidth={1.5} opacity={0.35}>
                  <animate attributeName="r" values="18;28;18" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.12;0.4" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={startX} cy={250} r={11} fill="#FF6247" opacity={0.25} />
                <circle cx={startX} cy={250} r={6} fill="#FF6247" />

                {/* Badge: نقطة البداية */}
                <rect
                  x={startX - 48}
                  y={180}
                  width={96}
                  height={22}
                  rx={11}
                  fill="#FF6247"
                  fillOpacity={0.16}
                  stroke="#FF6247"
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <text
                  x={startX}
                  y={195}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill="#FF8A75"
                  style={{ fontFamily: "var(--font-alexandria), sans-serif" }}
                >
                  {t.routeLab.startTag}
                </text>

                {/* Current State Title */}
                <motion.text
                  key={`from-${idx}`}
                  x={startX}
                  y={225}
                  textAnchor="middle"
                  fontSize={17}
                  fontWeight={800}
                  fill="#FFFFFF"
                  style={{ fontFamily: "var(--font-alexandria), sans-serif" }}
                  {...fade()}
                >
                  {item.from}
                </motion.text>
              </g>

              {/* ── Gate 01: Lower Run (التوضيح والتأطير) ── */}
              <g>
                <line
                  x1={gate1x}
                  y1={220}
                  x2={gate1x}
                  y2={280}
                  stroke="#315BFF"
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.85}
                />
                <circle cx={gate1x} cy={250} r={5} fill="#FFFFFF" />

                {/* 01 Badge */}
                <rect
                  x={gate1x - 18}
                  y={290}
                  width={36}
                  height={18}
                  rx={9}
                  fill="#315BFF"
                  fillOpacity={0.3}
                  stroke="#315BFF"
                  strokeOpacity={0.7}
                  strokeWidth={1}
                />
                <text
                  x={gate1x}
                  y={303}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#93C5FD"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  01
                </text>
                <text
                  x={gate1x}
                  y={326}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={700}
                  fill="#FFFFFF"
                  style={{ fontFamily: "var(--font-alexandria), sans-serif" }}
                >
                  {t.routeLab.gateA}
                </text>
              </g>

              {/* ── Gate 02: Upper Run (البناء والهندسة) ── */}
              <g>
                <line
                  x1={gate2x}
                  y1={95}
                  x2={gate2x}
                  y2={155}
                  stroke="#818CF8"
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.85}
                />
                <circle cx={gate2x} cy={125} r={5} fill="#FFFFFF" />

                {/* 02 Badge */}
                <rect
                  x={gate2x - 18}
                  y={35}
                  width={36}
                  height={18}
                  rx={9}
                  fill="#818CF8"
                  fillOpacity={0.25}
                  stroke="#818CF8"
                  strokeOpacity={0.7}
                  strokeWidth={1}
                />
                <text
                  x={gate2x}
                  y={48}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#C7D2FE"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  02
                </text>
                <text
                  x={gate2x}
                  y={72}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={700}
                  fill="#FFFFFF"
                  style={{ fontFamily: "var(--font-alexandria), sans-serif" }}
                >
                  {t.routeLab.gateB}
                </text>
              </g>

              {/* ── Terminal Docking Port & Destination Pod ── */}
              <g>
                {/* Illuminated Docking Terminal Port */}
                <circle
                  cx={dockX}
                  cy={125}
                  r={7}
                  fill="#10141C"
                  stroke="#818CF8"
                  strokeWidth={2.5}
                />
                <circle cx={dockX} cy={125} r={3} fill="#FFFFFF" />

                {/* Hybrid HTML Glass Pod */}
                <foreignObject
                  x={cardX}
                  y={77}
                  width={210}
                  height={96}
                  className="overflow-visible"
                >
                  <div
                    dir={dir}
                    className="flex h-[96px] w-[210px] flex-col justify-between rounded-2xl border border-indigo-500/40 bg-[#121722]/95 p-3.5 shadow-[0_12px_30px_rgba(49,91,255,0.28)] backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <span className="relative flex size-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="truncate">{t.routeLab.liveStatus}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                        {t.routeLab.endTag}
                      </span>
                    </div>

                    <motion.div
                      key={`to-${idx}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="text-sm font-extrabold text-white leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-alexandria), sans-serif" }}
                    >
                      {item.to}
                    </motion.div>
                  </div>
                </foreignObject>
              </g>
            </svg>
          </div>

          {/* ── Mobile: Vertical Stepper ───────────────────────────── */}
          <div className="relative sm:hidden space-y-2.5">
            <div className="rounded-2xl border border-coral/40 bg-coral/15 p-4 backdrop-blur-md">
              <span className="inline-block rounded-full bg-coral/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-coral">
                {t.routeLab.startTag}
              </span>
              <p className="mt-1.5 text-base font-bold text-white">{item.from}</p>
            </div>

            <div className="relative mx-auto h-9 w-px bg-vector/40">
              <motion.span
                key={`mp1-${idx}`}
                aria-hidden
                className="absolute -start-[3px] top-0 size-[7px] rounded-full bg-coral shadow-[0_0_8px_#FF6247]"
                animate={{ y: [0, 36] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <span className="text-sm font-semibold text-white/90">{t.routeLab.gateA}</span>
              <span className="font-meta text-xs font-bold text-vector bg-vector/20 px-2 py-0.5 rounded-md">01</span>
            </div>
            <div aria-hidden className="mx-auto h-5 w-px bg-vector/30" />
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <span className="text-sm font-semibold text-white/90">{t.routeLab.gateB}</span>
              <span className="font-meta text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-md">02</span>
            </div>

            <div className="relative mx-auto h-9 w-px bg-indigo-500/40">
              <motion.span
                key={`mp2-${idx}`}
                aria-hidden
                className="absolute -start-[3px] top-0 size-[7px] rounded-full bg-indigo-400 shadow-[0_0_8px_#818CF8]"
                animate={{ y: [0, 36] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-[#161D2B] p-4 shadow-lg shadow-indigo-950/40">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300">
                  {t.routeLab.endTag}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.routeLab.liveStatus}
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-white">{item.to}</p>
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
                    "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 active:scale-95",
                    i === idx
                      ? "border-coral bg-gradient-to-r from-coral to-coral-600 text-white shadow-[0_0_24px_rgba(255,98,71,0.45)] ring-2 ring-coral/30"
                      : "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
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
