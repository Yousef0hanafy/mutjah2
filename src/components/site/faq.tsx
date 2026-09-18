"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/lib/i18n/language-provider";
import { dictionaries } from "@/lib/i18n/dictionary";
import { Reveal, SectionHeading } from "./primitives";
import type { FaqItemData } from "@/lib/admin/types";

function faqFromDictionary(): FaqItemData[] {
  return dictionaries.ar.faq.items.map((f, i) => ({
    id: `dict-faq-${i}`,
    qAr: f.q,
    qEn: dictionaries.en.faq.items[i]?.q ?? f.q,
    aAr: f.a,
    aEn: dictionaries.en.faq.items[i]?.a ?? f.a,
  }));
}

export function Faq({ faqs }: { faqs?: FaqItemData[] }) {
  const { t, locale } = useLanguage();
  const items = faqs && faqs.length > 0 ? faqs : faqFromDictionary();

  return (
    <section id="faq" data-animate aria-labelledby="faq-heading" className="bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          label={t.faq.label}
          heading={t.faq.heading}
          align="center"
        />

        <Reveal className="mt-10 lg:mt-14">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {items.map((item, i) => {
              const q = locale === "ar" ? item.qAr : item.qEn;
              const a = locale === "ar" ? item.aAr : item.aEn;
              return (
                <AccordionItem
                  key={item.id}
                  value={`q-${i}`}
                  className="rounded-2xl border border-sandline bg-canvas-soft px-5 transition-colors data-[state=open]:border-vector/40 sm:px-6"
                >
                  <AccordionTrigger className="py-5 text-start text-base font-bold text-ink hover:no-underline sm:text-[17px] [&>svg]:size-5 [&>svg]:text-vector">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-[15px] leading-8 text-ink/65">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
