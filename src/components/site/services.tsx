"use client";

import { AppWindow, Bot, Database, Globe, LayoutGrid, Settings, Sparkles, Workflow } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { dictionaries } from "@/lib/i18n/dictionary";
import { Button } from "@/components/ui/button";
import { Point, Reveal, SectionHeading } from "./primitives";
import type { ServiceItemData } from "@/lib/admin/types";

const ICONS: Record<string, React.ElementType> = {
  globe: Globe,
  website: Globe,
  product: AppWindow,
  "layout-grid": LayoutGrid,
  system: Database,
  database: Database,
  automation: Workflow,
  bot: Bot,
  sparkles: Sparkles,
  settings: Settings,
};

function servicesFromDictionary(): ServiceItemData[] {
  return dictionaries.ar.services.items.map((s, i) => {
    const e = dictionaries.en.services.items[i];
    return {
      id: s.id,
      icon: s.id === "website" ? "globe" : s.id === "product" ? "layout-grid" : s.id === "system" ? "database" : "bot",
      titleAr: s.title,
      titleEn: e?.title ?? s.title,
      needAr: s.need,
      needEn: e?.need ?? s.need,
      descAr: s.desc,
      descEn: e?.desc ?? s.desc,
      deliverablesAr: s.deliverables,
      deliverablesEn: e?.deliverables ?? s.deliverables,
    };
  });
}

export function Services({ services }: { services?: ServiceItemData[] }) {
  const { t, locale } = useLanguage();
  const items = services && services.length > 0 ? services : servicesFromDictionary();

  return (
    <section id="services" aria-labelledby="services-heading" className="bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          label={t.services.label}
          heading={t.services.heading}
          sub={t.services.sub}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14">
          {items.map((service, i) => {
            const Icon = ICONS[service.icon] ?? Sparkles;
            const title = locale === "ar" ? service.titleAr : service.titleEn;
            const need = locale === "ar" ? service.needAr : service.needEn;
            const desc = locale === "ar" ? service.descAr : service.descEn;
            const deliverables = locale === "ar" ? service.deliverablesAr : service.deliverablesEn;
            return (
              <Reveal key={service.id} delay={i * 0.06}>
                <article className="group flex h-full flex-col rounded-3xl border border-sandline bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-lg hover:shadow-ink/5 sm:p-7">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-mist text-ink transition-colors duration-300 group-hover:bg-vector group-hover:text-white">
                      <Icon className="size-[22px]" aria-hidden />
                    </span>
                    <h3 className="text-xl font-bold text-ink sm:text-[1.35rem]">
                      {title}
                    </h3>
                  </div>

                  <p className="mt-5 rounded-xl bg-canvas-soft px-4 py-3 text-sm leading-7 text-ink/70">
                    <span className="font-semibold text-coral-600">
                      {t.services.needLabel}{" "}
                    </span>
                    {need}
                  </p>

                  <p className="mt-4 text-[15px] leading-8 text-ink/75">{desc}</p>

                  <div className="mt-auto pt-6">
                    <p className="font-meta text-xs font-bold uppercase tracking-wider text-ink/40">
                      {t.services.includesLabel}
                    </p>
                    <ul className="mt-3 grid gap-2.5">
                      {deliverables.map((d) => (
                        <li key={d} className="flex items-start gap-2.5 text-sm text-ink/75">
                          <span
                            aria-hidden
                            className="mt-[7px] size-1.5 shrink-0 rounded-full bg-vector"
                          />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Support band */}
        <Reveal delay={0.1}>
          <div className="mt-5 flex flex-col gap-6 rounded-3xl bg-ink p-6 text-canvas sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold sm:text-2xl">{t.services.support.title}</h3>
              <p className="mt-3 text-sm leading-8 text-canvas/65 sm:text-[15px]">
                {t.services.support.desc}
              </p>
            </div>
            <Button
              asChild
              className="h-12 shrink-0 rounded-xl bg-vector px-6 text-base font-semibold text-white hover:bg-vector-600"
            >
              <a href="#contact">{t.services.support.cta}</a>
            </Button>
          </div>
        </Reveal>

        <Reveal className="mt-10 flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-10 bg-ink/20" />
          <p className="text-sm font-semibold text-ink/55">{t.services.note}</p>
          <span aria-hidden className="h-px w-10 bg-ink/20" />
        </Reveal>
      </div>
    </section>
  );
}
