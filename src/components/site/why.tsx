"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { Point, Reveal, SectionHeading } from "./primitives";

export function Why() {
  const { t } = useLanguage();

  return (
    <section id="why" data-animate aria-labelledby="why-heading" className="bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading label={t.why.label} heading={t.why.heading} />

        {/* Differentiation pull-quote */}
        <Reveal className="mt-10 lg:mt-12">
          <blockquote className="relative overflow-hidden rounded-3xl border border-sandline bg-white p-8 sm:p-12">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 start-6 size-24 rounded-full bg-mist/70"
            />
            <div className="relative flex items-start gap-4">
              <Point className="mt-3 size-3" />
              <p className="max-w-3xl text-2xl font-extrabold leading-[1.5] text-ink sm:text-[2rem] sm:leading-[1.5]">
                {t.why.quote}
              </p>
            </div>
          </blockquote>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
          {t.why.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <article className="border-t-2 border-ink/10 pt-5">
                <span className="font-meta text-sm font-extrabold text-coral">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-8 text-ink/65">{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
