"use client";

import { MoveLeft, MoveRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";
import { Point, Reveal } from "./primitives";

/**
 * Movement strip — the five concrete transitions every MUTJAH project makes.
 * From the working brand idea: direction becomes valuable when it creates movement.
 */
export function Movement() {
  const { t, dir } = useLanguage();
  const Forward = dir === "rtl" ? MoveLeft : MoveRight;

  return (
    <section data-animate aria-labelledby="movement-heading" className="border-y border-sandline/80 bg-white">
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

        {/*
          The five transitions — a compact route, never scrollable.
          Mobile: full-width cards · sm: 2-col grid · lg: the 5-station row.
          The last transition ("digital presence → working asset") is the
          destination, so it gets the dark ink card — mirroring the final
          square station in the Process route.
        */}
        <ul className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {t.movement.items.map((item, i) => {
            const isLast = i === t.movement.items.length - 1;
            return (
              <Reveal
                as="li"
                key={item.to}
                delay={i * 0.07}
                className={cn(
                  "group rounded-2xl border p-4 transition-all duration-300 sm:p-5",
                  isLast
                    ? "border-ink bg-ink text-canvas shadow-[0_22px_48px_-26px_rgba(16,20,28,0.65)] sm:col-span-2 lg:col-span-1"
                    : "border-sandline bg-canvas-soft hover:-translate-y-1 hover:border-vector/45 hover:shadow-[0_16px_36px_-20px_rgba(16,20,28,0.3)]",
                )}
              >
                {isLast ? (
                  <div className="flex h-full items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:justify-start">
                    <p className="flex items-center gap-2.5 text-sm leading-6 text-canvas/60 lg:items-start">
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-coral lg:mt-[9px]"
                      />
                      {item.from}
                    </p>
                    <div className="flex items-center gap-2.5 lg:mt-4 lg:border-t lg:border-dashed lg:border-canvas/15 lg:pt-3.5">
                      <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-vector text-white shadow-[0_8px_20px_-8px_rgba(49,91,255,0.9)]"
                      >
                        <Forward className="size-3.5" />
                      </span>
                      <p className="text-[15px] font-bold leading-snug text-canvas">
                        {item.to}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="flex items-start gap-2 text-sm leading-6 text-ink/55">
                      <span
                        aria-hidden
                        className="mt-[9px] size-1.5 shrink-0 rounded-full bg-coral"
                      />
                      {item.from}
                    </p>
                    <div className="mt-3 flex items-center gap-2.5 border-t border-dashed border-sandline pt-3">
                      <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-vector/10 text-vector transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                      >
                        <Forward className="size-3.5" />
                      </span>
                      <p className="text-[15px] font-bold leading-snug text-ink">
                        {item.to}
                      </p>
                    </div>
                  </>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
