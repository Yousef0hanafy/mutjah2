"use client";

import { MoveLeft, MoveRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Point, Reveal } from "./primitives";

/**
 * Movement strip — the five concrete transitions every MUTJAH project makes.
 * From the working brand idea: direction becomes valuable when it creates movement.
 */
export function Movement() {
  const { t, dir } = useLanguage();
  const Forward = dir === "rtl" ? MoveLeft : MoveRight;

  return (
    <section aria-labelledby="movement-heading" className="border-y border-sandline/80 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <Reveal className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-ink/60">
            <Point />
            {t.movement.label}
          </span>
          <h2
            id="movement-heading"
            className="max-w-2xl text-2xl font-bold leading-snug text-ink sm:text-[1.7rem]"
          >
            {t.movement.heading}
          </h2>
        </Reveal>

        <ul className="scroll-slim mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
          {t.movement.items.map((item, i) => (
            <Reveal
              key={item.to}
              delay={i * 0.07}
              className="min-w-[240px] snap-start lg:min-w-0"
            >
              <li className="h-full rounded-2xl border border-sandline bg-canvas-soft p-5">
                <p className="flex items-center gap-2 text-sm text-ink/55">
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-coral" />
                  {item.from}
                </p>
                <p className="mt-3 flex items-center gap-2 font-bold leading-snug text-ink">
                  <Forward className="size-4 shrink-0 text-vector" aria-hidden />
                  {item.to}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
