"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Point, Reveal, SectionHeading } from "./primitives";
import type { TestimonialData } from "@/lib/admin/types";

/**
 * Testimonials — rendered only when real, published testimonials exist
 * (honest-claims policy: no invented proof, section stays hidden until then).
 */
export function Testimonials({ testimonials }: { testimonials?: TestimonialData[] }) {
  const { t, locale } = useLanguage();
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      data-animate
      aria-labelledby="testimonials-heading"
      className="bg-mist-50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          label={t.testimonials.label}
          heading={t.testimonials.heading}
          sub={t.testimonials.sub}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {testimonials.map((item, i) => {
            const quote = locale === "ar" ? item.quoteAr : item.quoteEn;
            const role = locale === "ar" ? item.roleAr : item.roleEn;
            return (
              <Reveal key={item.id} delay={i * 0.06} className="h-full">
                <figure className="flex h-full flex-col rounded-3xl border border-sandline bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/8 sm:p-7">
                  <span
                    aria-hidden
                    className="text-5xl font-black leading-none text-coral/60"
                  >
                    {locale === "ar" ? "»" : "\u201C"}
                  </span>
                  <blockquote className="mt-4 flex-1 text-[15px] font-semibold leading-8 text-ink/85">
                    {quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-sandline/70 pt-5">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-mist-50">
                      {item.avatarPath ? (
                        <Image
                          src={item.avatarPath}
                          alt={item.name}
                          width={88}
                          height={88}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-base font-black text-ink/40">
                          {item.name.trim().charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-ink">
                        {item.name}
                      </span>
                      {(role || item.company) && (
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink/50">
                          <Point className="bg-coral" />
                          <span className="truncate">
                            {[role, item.company].filter(Boolean).join(" — ")}
                          </span>
                        </span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
