"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useLeadPrefill } from "@/store/lead-prefill";
import { servicePath, slugForServiceId } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./primitives";

/**
 * "Where do you start?" — the movement you can pick.
 *
 * The visitor picks the state closest to theirs; the route runs from that state
 * through the first three real stations of the process (clarify → shape → build)
 * to its outcome, and ends at the service that gets them there — with the form
 * pre-set to that need. Server-rendered fully visible (first state selected);
 * motion only plays after the visitor changes the selection.
 */
export function StartRoute() {
  const { t, locale, dir } = useLanguage();
  const setPrefill = useLeadPrefill((s) => s.setPrefill);
  const [idx, setIdx] = useState(0);
  const [touched, setTouched] = useState(false);

  const items = t.movement.items;
  const item = items[idx];
  const stations = t.process.steps.slice(0, 3);
  const slug = slugForServiceId(item.need);
  const service = t.services.items.find((s) => s.id === item.need);
  const Forward = dir === "rtl" ? ArrowLeft : ArrowRight;

  const appear = (delay: number) =>
    touched
      ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay } }
      : { initial: false as const };

  const pick = (i: number) => {
    setIdx(i);
    setTouched(true);
  };

  const startHere = () => {
    setPrefill({ need: item.need });
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="route"
      data-animate
      aria-labelledby="route-heading"
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
          id="route-heading"
          label={t.movement.label}
          heading={t.movement.heading}
          sub={t.routeLab.sub}
          dark
        />

        {/* ── Pick: the five states are the picker ── */}
        <Reveal className="mt-10">
          <p id="route-pick-label" className="text-sm font-semibold text-canvas/50">
            {t.routeLab.pickLabel}
          </p>
          <ul
            aria-labelledby="route-pick-label"
            className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3"
          >
            {items.map((it, i) => {
              const active = i === idx;
              return (
                <li key={it.from} className={cn(i === items.length - 1 && "col-span-2 sm:col-span-1")}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-full w-full flex-col items-start gap-1.5 rounded-2xl border p-4 text-start transition-all duration-300 active:scale-[0.98]",
                      active
                        ? "border-coral bg-coral/[0.12] shadow-[0_14px_34px_-18px_rgba(255,98,71,0.7)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                    )}
                  >
                    <span className="flex items-center gap-2 text-[15px] font-bold text-white">
                      <span
                        aria-hidden
                        className={cn("size-1.5 shrink-0 rounded-full", active ? "bg-coral" : "bg-white/30")}
                      />
                      {it.from}
                    </span>
                    <span className={cn("text-[13px] leading-6", active ? "text-canvas/75" : "text-canvas/45")}>
                      {it.to}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* ── The route: start → three stations → outcome ── */}
        <Reveal className="mt-6">
          <div
            aria-live="polite"
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 sm:p-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
              {/* start */}
              <motion.div
                key={`start-${idx}`}
                {...appear(0)}
                className="rounded-2xl border border-coral/40 bg-coral/[0.1] p-4 lg:w-56 lg:shrink-0"
              >
                <span className="text-[11px] font-bold text-coral">{t.routeLab.startTag}</span>
                <p className="mt-1.5 text-lg font-extrabold text-white">{item.from}</p>
              </motion.div>

              {/* stations */}
              <ol className="relative flex flex-col gap-3 ps-6 lg:flex-1 lg:flex-row lg:items-start lg:justify-around lg:gap-2 lg:self-center lg:px-0">
                <span
                  aria-hidden
                  className="absolute bottom-2 start-[9px] top-2 w-px bg-gradient-to-b from-coral via-vector to-indigo-400 lg:inset-x-0 lg:bottom-auto lg:top-[9px] lg:h-px lg:w-auto lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l"
                />
                {stations.map((st, i) => (
                  <motion.li
                    key={`${st.title}-${idx}`}
                    {...appear(0.12 + i * 0.12)}
                    className="relative flex items-center gap-3 lg:flex-col lg:gap-2"
                  >
                    <span className="relative z-10 -ms-6 grid size-[18px] shrink-0 place-items-center rounded-full border-2 border-vector bg-ink lg:ms-0">
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <span className="flex items-baseline gap-2 lg:flex-col lg:items-center lg:gap-0.5">
                      <span className="font-meta text-[11px] font-bold text-vector">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-bold text-white/90">{st.title}</span>
                    </span>
                  </motion.li>
                ))}
              </ol>

              {/* outcome */}
              <motion.div
                key={`end-${idx}`}
                {...appear(0.5)}
                className="rounded-2xl border border-indigo-400/40 bg-[#161D2B] p-4 lg:w-56 lg:shrink-0"
              >
                <span className="text-[11px] font-bold text-indigo-300">{t.routeLab.endTag}</span>
                <p className="mt-1.5 text-lg font-extrabold text-white">{item.to}</p>
              </motion.div>
            </div>

            {/* ── Where the route ends: the service, and the next step ── */}
            <motion.div
              key={`svc-${idx}`}
              {...appear(0.62)}
              className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="max-w-2xl">
                <p className="text-[12px] font-bold text-canvas/45">{t.routeLab.serviceTag}</p>
                <p className="mt-1 text-xl font-extrabold text-white">
                  {slug ? t.servicePages[slug].title : t.routeLab.unsureTitle}
                </p>
                <p className="mt-1.5 text-sm leading-7 text-canvas/60">
                  {slug ? service?.desc : t.routeLab.unsureDesc}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {slug && (
                  <Link
                    href={servicePath(locale, slug)}
                    className="group inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-bold text-white transition-colors hover:border-white/40"
                  >
                    {t.servicePage.learnMore}
                    <Forward className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
                  </Link>
                )}
                <Button
                  asChild
                  className="h-12 rounded-xl bg-canvas px-6 text-base font-semibold text-ink transition-colors hover:bg-coral hover:text-white"
                >
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      startHere();
                    }}
                  >
                    {t.routeLab.cta}
                    <ArrowDown className="size-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
