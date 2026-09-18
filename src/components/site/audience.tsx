"use client";

import { Building2, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useLeadPrefill } from "@/store/lead-prefill";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./primitives";

function goContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export function Audience() {
  const { t } = useLanguage();
  const setPrefill = useLeadPrefill((s) => s.setPrefill);

  return (
    <section id="audience" aria-labelledby="audience-heading" className="border-y border-sandline/70 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          label={t.audience.label}
          heading={t.audience.heading}
          sub={t.audience.sub}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:mt-14">
          {/* Businesses — primary door */}
          <Reveal className="lg:col-span-7">
            <article className="flex h-full flex-col rounded-3xl border border-sandline bg-canvas-soft p-7 sm:p-9">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-canvas">
                <Building2 className="size-[22px]" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                {t.audience.business.title}
              </h3>
              <div className="mt-4 space-y-3 border-s-2 border-vector/60 ps-4">
                <p className="text-[15px] leading-8 text-ink/75">
                  {t.audience.business.msg1}
                </p>
                <p className="text-[15px] leading-8 text-ink/75">
                  {t.audience.business.msg2}
                </p>
              </div>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {t.audience.business.offers.map((offer) => (
                  <li
                    key={offer}
                    className="flex items-start gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-medium text-ink/80"
                  >
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-vector" />
                    {offer}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <Button
                  onClick={() => {
                    setPrefill({ audience: "business" });
                    goContact();
                  }}
                  className="h-12 rounded-xl bg-ink px-7 text-base font-semibold text-canvas hover:bg-vector"
                >
                  {t.audience.business.cta}
                </Button>
              </div>
            </article>
          </Reveal>

          {/* Founders — secondary door */}
          <Reveal delay={0.08} className="lg:col-span-5">
            <article className="flex h-full flex-col rounded-3xl border border-sandline bg-mist-50 p-7 sm:p-9">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-vector text-white">
                <UserRound className="size-[22px]" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                {t.audience.founder.title}
              </h3>
              <p className="mt-4 border-s-2 border-coral/70 ps-4 text-[15px] leading-8 text-ink/75">
                {t.audience.founder.msg}
              </p>
              <ul className="mt-6 grid gap-2.5">
                {t.audience.founder.offers.map((offer) => (
                  <li
                    key={offer}
                    className="flex items-start gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-medium text-ink/80"
                  >
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-coral" />
                    {offer}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <Button
                  onClick={() => {
                    setPrefill({ audience: "founder" });
                    goContact();
                  }}
                  variant="outline"
                  className="h-12 rounded-xl border-ink/20 bg-white px-7 text-base font-semibold text-ink hover:border-vector hover:text-vector"
                >
                  {t.audience.founder.cta}
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
