"use client";

import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { DirectionField } from "./direction-field";

/**
 * Hero — the first impression.
 * Editorial type over the Direction Field: a living grid of compass needles
 * that point at the visitor (and roam on their own when idle). The old static
 * route diagram graduated into the interactive RouteLab section below.
 */
export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" data-animate className="relative overflow-hidden">
      {/* the living field */}
      <DirectionField />

      {/* restrained dotted grid — static texture under the field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dotgrid text-ink/[0.05] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_38%,black,transparent)]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-4 pb-20 pt-36 sm:px-6 sm:pt-44 lg:px-8 lg:pb-28 lg:pt-52">
        <p
          className="hero-rise flex items-center gap-2.5 text-[13px] font-semibold text-ink/55 sm:text-sm"
          style={{ animationDelay: "0.05s" }}
        >
          <span aria-hidden className="size-2 rounded-full bg-coral" />
          {t.hero.eyebrow}
        </p>

        <h1
          className="hero-rise mt-6 max-w-4xl text-[2.7rem] font-extrabold leading-[1.16] tracking-tight text-ink sm:text-7xl sm:leading-[1.1] lg:text-[5.1rem] lg:leading-[1.06]"
          style={{ animationDelay: "0.12s" }}
        >
          <span className="block">{t.hero.titleA}</span>
          <span className="block text-vector">{t.hero.titleB}</span>
        </h1>

        <p
          className="hero-rise mt-7 max-w-2xl text-base leading-8 text-ink/65 sm:text-lg sm:leading-9"
          style={{ animationDelay: "0.2s" }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="hero-rise mt-10 flex flex-wrap items-center gap-3"
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
          className="hero-rise mt-12 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm font-medium text-ink/55"
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
    </section>
  );
}
