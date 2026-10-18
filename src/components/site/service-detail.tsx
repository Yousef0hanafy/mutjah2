"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, Building2, ChevronDown, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { serviceMeta, servicePath, serviceSlugs, type ServiceSlug } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Point, Reveal, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

const COVERS: Record<string, string> = {
  infeworks: "/images/work/infeworks.webp",
  hemma: "/images/work/hemma.webp",
  qidr: "/images/work/qidr.webp",
  elmorabbi: "/images/work/elmorabbi.webp",
  "performance-gym": "/images/work/performance-gym.webp",
};

/**
 * One service page, told as a route: where you start → where we arrive → the stations
 * (rendered by <Process/> in the page) → work that got there → questions → the form.
 * All copy comes from `servicePages` in the dictionary; projects from `work.projects`.
 */
export function ServiceDetail({ slug }: { slug: ServiceSlug }) {
  const { t, homeHref } = useLanguage();
  const page = t.servicePages[slug];
  const labels = t.servicePage;
  const service = t.services.items.find((s) => s.id === serviceMeta[slug].need);

  return (
    <>
      {/* ── Direction: title, the movement, the answer first ── */}
      <section id="top" data-animate className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dotgrid text-ink/[0.05] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_38%,black,transparent)]"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-20">
          <nav aria-label={labels.services} className="hero-rise text-[13px] font-semibold text-ink/50">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={homeHref} className="transition-colors hover:text-ink">
                  {labels.home}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <a href={`${homeHref}#services`} className="transition-colors hover:text-ink">
                  {labels.services}
                </a>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink/75">
                {page.title}
              </li>
            </ol>
          </nav>

          <h1
            className="hero-rise mt-6 max-w-4xl text-[2.4rem] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-6xl sm:leading-[1.1]"
            style={{ animationDelay: "0.08s" }}
          >
            {page.title}
          </h1>
          <p
            className="hero-rise mt-4 flex items-center gap-3 text-xl font-bold text-vector sm:text-2xl"
            style={{ animationDelay: "0.14s" }}
          >
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-coral" />
            {page.direction}
          </p>
          <p
            className="hero-rise mt-6 max-w-3xl text-base leading-8 text-ink/70 sm:text-lg sm:leading-9"
            style={{ animationDelay: "0.2s" }}
          >
            {page.answer}
          </p>

          <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.26s" }}>
            <Button
              asChild
              className="h-12 rounded-xl bg-ink px-7 text-base font-semibold text-canvas shadow-sm transition-all duration-200 hover:bg-vector hover:shadow-lg hover:shadow-vector/25 active:scale-95"
            >
              <a href="#contact">{labels.cta}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-12 rounded-xl border-ink/15 bg-white/60 px-7 text-base font-semibold text-ink transition-all duration-200 hover:border-vector hover:bg-white hover:text-vector active:scale-95"
            >
              <a href="#work">
                {labels.seeWork}
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Where do you start? ── */}
      <section data-animate aria-labelledby="start-heading" className="border-y border-sandline/80 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <h2 id="start-heading" className="flex items-center gap-2.5 text-sm font-semibold text-ink/60">
              <Point />
              {labels.startLabel}
            </h2>
          </Reveal>
          {service && (
            <Reveal>
              <p className="mt-4 max-w-3xl text-2xl font-bold leading-snug text-ink sm:text-[1.7rem]">
                {service.need}
              </p>
            </Reveal>
          )}
          <ul className="mt-9 grid gap-3.5 sm:grid-cols-3">
            {page.starts.map((start, i) => (
              <Reveal as="li" key={start} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-sandline bg-canvas-soft p-5 text-[15px] font-semibold leading-7 text-ink/80">
                  <span aria-hidden className="mb-3 block size-1.5 rounded-full bg-coral" />
                  {start}
                </div>
              </Reveal>
            ))}
          </ul>
          <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
            {[
              { Icon: Building2, label: labels.forCompanies, text: page.forCompanies },
              { Icon: UserRound, label: labels.forIndividuals, text: page.forIndividuals },
            ].map(({ Icon, label, text }, i) => (
              <Reveal key={label} delay={0.1 + i * 0.06}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-ink/10 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mist text-ink">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink/50">{label}</p>
                    <p className="mt-1 text-[15px] font-semibold leading-7 text-ink">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where we arrive ── */}
      <section data-animate aria-labelledby="build-heading" className="bg-canvas">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading id="build-heading" label={labels.buildLabel} heading={labels.buildHeading} sub={service?.desc} />
          {service && (
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.deliverables.map((d, i) => (
                <Reveal as="li" key={d} delay={i * 0.04}>
                  <div className="flex h-full items-center gap-3 rounded-2xl border border-sandline bg-white px-5 py-4 text-[15px] font-semibold text-ink/80">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-vector" />
                    {d}
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
          {page.principles.length > 0 && (
            <Reveal className="mt-10">
              <div className="rounded-3xl bg-ink p-6 text-canvas sm:p-8">
                <h3 className="text-lg font-bold sm:text-xl">{labels.principlesLabel}</h3>
                <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                  {page.principles.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[15px] leading-7 text-canvas/75">
                      <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-coral" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}

/** Related work, questions and the other services — rendered after the shared <Process/> route. */
export function ServiceDetailTail({ slug }: { slug: ServiceSlug }) {
  const { t, locale, dir } = useLanguage();
  const page = t.servicePages[slug];
  const labels = t.servicePage;
  const Forward = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Visit = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  const projects = page.work.flatMap((w) => {
    const project = t.work.projects.find((p) => p.id === w.id);
    return project ? [{ ...project, text: w.text }] : [];
  });

  return (
    <>
      {/* ── From our work ── */}
      <section id="work" data-animate aria-labelledby="service-work-heading" className="bg-canvas">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading id="service-work-heading" label={labels.workLabel} heading={labels.workHeading} />
          <div className={cn("mt-10 grid gap-5", projects.length > 1 && "md:grid-cols-2 lg:grid-cols-3")}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sandline bg-white transition-all duration-500 hover:-translate-y-1 hover:border-vector/30 hover:shadow-xl hover:shadow-ink/10">
                  {COVERS[p.id] && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <span
                        className={cn(
                          "absolute start-3 top-3 z-10 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-sm",
                          p.status === "live" && "bg-vector/95 text-white",
                          p.status === "deployed" && "bg-ink/85 text-canvas",
                          p.status === "mvp" && "border border-ink/10 bg-white/90 text-ink"
                        )}
                      >
                        {t.work.statuses[p.status]}
                      </span>
                      <Image
                        src={COVERS[p.id]}
                        alt={`${p.name} — ${p.headline}`}
                        width={1672}
                        height={941}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-extrabold text-ink sm:text-xl">{p.name}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-ink/70">{p.text}</p>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-vector transition-colors hover:text-ink"
                      >
                        {labels.visit}
                        <Visit className="size-4" aria-hidden />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before you move: plain questions and answers (readable without JS) ── */}
      <section data-animate aria-labelledby="service-faq-heading" className="border-t border-sandline/80 bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <h2
              id="service-faq-heading"
              className="flex items-center gap-2.5 text-2xl font-bold text-ink sm:text-[1.7rem]"
            >
              <Point />
              {labels.faqLabel}
            </h2>
          </Reveal>
          <div className="mt-8 divide-y divide-sandline rounded-3xl border border-sandline">
            {page.faq.map((item) => (
              <details key={item.q} className="group px-5 py-4 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-base font-bold text-ink sm:text-[17px]">
                  <h3>{item.q}</h3>
                  <ChevronDown
                    className="size-5 shrink-0 text-ink/40 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-[15px] leading-8 text-ink/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other services ── */}
      <nav aria-label={labels.otherServices} className="bg-canvas">
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2.5 text-sm font-semibold text-ink/60">
            <Point />
            {labels.otherServices}
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {serviceSlugs
              .filter((s) => s !== slug)
              .map((s) => (
                <li key={s}>
                  <Link
                    href={servicePath(locale, s)}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-sandline bg-white px-5 py-4 text-[15px] font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-vector/40"
                  >
                    {t.servicePages[s].title}
                    <Forward
                      className="size-4 text-ink/40 transition-colors group-hover:text-vector"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
