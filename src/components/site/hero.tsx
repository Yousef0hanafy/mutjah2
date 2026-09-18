"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";

const W = 640;
const H = 460;

/**
 * The Open Route — brand signature visual.
 * Point → Route → Gate → Working Form, drawn once per direction change.
 * No arrowheads, one route only, labels always tied to real elements.
 */
function HeroRoute() {
  const { dir, t } = useLanguage();
  const reduce = useReducedMotion();
  const rtl = dir === "rtl";
  // mirror helper
  const mx = (x: number) => (rtl ? W - x : x);

  const point = { x: mx(596), y: 372 };
  const routeD = rtl
    ? `M 44 372 H 304 Q 344 372 344 332 V 204 Q 344 164 384 164 H 512`
    : `M 596 372 H 336 Q 296 372 296 332 V 204 Q 296 164 256 164 H 128`;
  const gate1x = mx(430);
  const gate2x = mx(196);
  const formX = mx(120); // rect end anchor (right edge in LTR)
  const rectX = rtl ? 520 : 44;

  const ease = [0.22, 1, 0.36, 1] as const;
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 1.1, delay, ease },
        };
  const appear = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease },
        };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${t.hero.route.point} ← ${t.hero.route.gate} ← ${t.hero.route.form}`}
    >
      {/* start point */}
      <motion.circle
        key="point"
        cx={point.x}
        cy={point.y}
        r={9}
        fill="#FF6247"
        {...(reduce
          ? {}
          : {
              initial: { scale: 0 },
              animate: { scale: 1 },
              transition: { duration: 0.45, ease },
            })}
        style={{ transformOrigin: `${point.x}px ${point.y}px` }}
      />
      <motion.circle
        cx={point.x}
        cy={point.y}
        r={18}
        fill="none"
        stroke="#FF6247"
        strokeWidth={1.5}
        opacity={0.45}
        {...appear(0.15)}
      />

      {/* the route */}
      <motion.path
        d={routeD}
        fill="none"
        stroke="#315BFF"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.3)}
      />

      {/* gate 1 — decision */}
      <motion.line
        x1={gate1x}
        y1={344}
        x2={gate1x}
        y2={400}
        stroke="#10141C"
        strokeWidth={7}
        strokeLinecap="round"
        {...(reduce
          ? {}
          : {
              initial: { pathLength: 0 },
              animate: { pathLength: 1 },
              transition: { duration: 0.4, delay: 0.95, ease },
            })}
      />
      {/* gate 2 — scope */}
      <motion.line
        x1={gate2x}
        y1={136}
        x2={gate2x}
        y2={192}
        stroke="#10141C"
        strokeWidth={7}
        strokeLinecap="round"
        {...(reduce
          ? {}
          : {
              initial: { pathLength: 0 },
              animate: { pathLength: 1 },
              transition: { duration: 0.4, delay: 1.35, ease },
            })}
      />

      {/* working form */}
      <motion.rect
        x={rectX}
        y={120}
        width={76}
        height={88}
        rx={14}
        fill="#FFFFFF"
        stroke="#10141C"
        strokeWidth={5}
        {...appear(1.75)}
      />
      <motion.rect
        x={rectX + 16}
        y={148}
        width={44}
        height={9}
        rx={4.5}
        fill="#FF6247"
        {...appear(1.95)}
      />
      <motion.rect
        x={rectX + 16}
        y={168}
        width={30}
        height={7}
        rx={3.5}
        fill="#10141C"
        opacity={0.35}
        {...appear(2.05)}
      />

      {/* metadata labels */}
      <motion.text
        x={point.x}
        y={416}
        textAnchor="middle"
        fontSize={15}
        fontWeight={600}
        fill="#10141C"
        opacity={0.55}
        {...appear(0.4)}
      >
        {t.hero.route.point}
      </motion.text>
      <motion.text
        x={gate1x}
        y={326}
        textAnchor="middle"
        fontSize={15}
        fontWeight={600}
        fill="#10141C"
        opacity={0.55}
        {...appear(1.1)}
      >
        {t.hero.route.gate}
      </motion.text>
      <motion.text
        x={rectX + 38}
        y={100}
        textAnchor="middle"
        fontSize={15}
        fontWeight={600}
        fill="#10141C"
        opacity={0.55}
        {...appear(1.9)}
      >
        {t.hero.route.form}
      </motion.text>
    </svg>
  );
}

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" data-animate className="relative overflow-hidden">
      {/* restrained dotted grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid text-ink/[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-40 lg:px-8">
        <div className="flex flex-col items-start">
          <p
            className="hero-rise flex items-center gap-2.5 text-[13px] font-semibold text-ink/55 sm:text-sm"
            style={{ animationDelay: "0.05s" }}
          >
            <span aria-hidden className="size-2 rounded-full bg-coral" />
            {t.hero.eyebrow}
          </p>

          <h1
            className="hero-rise mt-5 text-[2.45rem] font-extrabold leading-[1.22] tracking-tight text-ink sm:text-6xl lg:text-[3.9rem]"
            style={{ animationDelay: "0.12s" }}
          >
            <span className="block">{t.hero.titleA}</span>
            <span className="block text-vector">{t.hero.titleB}</span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-xl text-base leading-8 text-ink/65 sm:text-lg sm:leading-9"
            style={{ animationDelay: "0.2s" }}
          >
            {t.hero.subtitle}
          </p>

          <div
            className="hero-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.28s" }}
          >
            <Button
              asChild
              className="h-12 rounded-xl bg-ink px-7 text-base font-semibold text-canvas shadow-sm transition-colors hover:bg-vector"
            >
              <a href="#contact">{t.hero.ctaPrimary}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl border-ink/15 bg-white/60 px-7 text-base font-semibold text-ink transition-colors hover:border-vector hover:text-vector"
            >
              <a href="#work">
                {t.hero.ctaSecondary}
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </Button>
          </div>

          <ul
            className="hero-rise mt-11 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm font-medium text-ink/55"
            style={{ animationDelay: "0.4s" }}
            aria-label={t.hero.chips.join(" · ")}
          >
            {t.hero.chips.map((chip) => (
              <li key={chip} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-vector/70" />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hero-rise mx-auto w-full max-w-xl lg:max-w-none"
          style={{ animationDelay: "0.25s" }}
        >
          <HeroRoute />
        </div>
      </div>
    </section>
  );
}
