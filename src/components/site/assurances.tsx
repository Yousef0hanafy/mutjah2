"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { Point, Reveal } from "./primitives";

/**
 * Assurances — four things the visitor can rely on, every one of them already
 * a stated MUTJAH practice (written scope, honest project status, ownership,
 * human-approved AI). No numbers, no claims we cannot back.
 */
export function Assurances() {
  const { t } = useLanguage();

  return (
    <section data-animate aria-labelledby="assurances-heading" className="bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <Reveal>
          <h2
            id="assurances-heading"
            className="flex items-center gap-2.5 text-sm font-semibold text-ink/60"
          >
            <Point />
            {t.assurances.label}
          </h2>
        </Reveal>

        <ul className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {t.assurances.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.05}>
              <div className="border-t-2 border-ink/10 pt-4">
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink/65">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
