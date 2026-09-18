"use client";

import Image from "next/image";
import { ArrowUpLeft, ArrowUpRight, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { dictionaries } from "@/lib/i18n/dictionary";
import { Point, Reveal, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";
import type { WorkProjectData } from "@/lib/admin/types";

/* ── Dictionary fallback (used when the DB has no published projects) ─────── */

const COVERS: Record<string, { src: string; w: number; h: number }> = {
  infeworks: { src: "/images/work/infeworks.webp", w: 1672, h: 941 },
  hemma: { src: "/images/work/hemma.webp", w: 1672, h: 941 },
  qidr: { src: "/images/work/qidr.webp", w: 1672, h: 941 },
  elmorabbi: { src: "/images/work/elmorabbi.webp", w: 1672, h: 941 },
  "performance-gym": { src: "/images/work/performance-gym.webp", w: 1672, h: 941 },
};

function projectsFromDictionary(): WorkProjectData[] {
  const ar = dictionaries.ar.work.projects;
  const en = dictionaries.en.work.projects;
  return ar.map((p) => {
    const e = en.find((x) => x.id === p.id);
    const cover = COVERS[p.id];
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      langs: p.langs ?? ["ar", "en"],
      headlineAr: p.headline,
      headlineEn: e?.headline ?? p.headline,
      descAr: p.desc,
      descEn: e?.desc ?? p.desc,
      tagsAr: p.tags ?? [],
      tagsEn: e?.tags ?? p.tags ?? [],
      url: p.url ?? null,
      coverPath: cover?.src ?? null,
    };
  });
}

/* ── Card ─────────────────────────────────────────────────────────────────── */

function StatusChip({ status, label }: { status: WorkProjectData["status"]; label: string }) {
  return (
    <span
      className={cn(
        "absolute start-3 top-3 z-10 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-sm",
        status === "live" && "bg-vector/95 text-white",
        status === "deployed" && "bg-ink/85 text-canvas",
        status === "mvp" && "border border-ink/10 bg-white/90 text-ink"
      )}
    >
      {label}
    </span>
  );
}

function LangBadges({ langs }: { langs: readonly string[] }) {
  const { t } = useLanguage();
  const label =
    langs.length === 2
      ? t.work.bilingual
      : langs[0] === "ar"
        ? t.work.arabic
        : t.work.english;
  return (
    <span className="rounded-full border border-ink/10 bg-canvas-soft px-2.5 py-1 text-[11px] font-semibold text-ink/60">
      {label}
    </span>
  );
}

function ProjectCard({
  project,
  featured = false,
  delay = 0,
}: {
  project: WorkProjectData;
  featured?: boolean;
  delay?: number;
}) {
  const { t, dir, locale } = useLanguage();
  const Visit = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  const headline = locale === "ar" ? project.headlineAr : project.headlineEn;
  const desc = locale === "ar" ? project.descAr : project.descEn;
  const tags = locale === "ar" ? project.tagsAr : project.tagsEn;
  const cover = project.coverPath;

  return (
    <Reveal delay={delay} className="h-full">
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-3xl border border-sandline bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/8",
          featured && "lg:row-span-1"
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <StatusChip status={project.status} label={t.work.statuses[project.status]} />
          {cover ? (
            <Image
              src={cover}
              alt={`${project.name} — ${headline}`}
              width={1672}
              height={941}
              sizes={featured ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 32vw"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-mist-50">
              <Point className="scale-150" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-ink sm:text-xl">{project.name}</h3>
            <LangBadges langs={project.langs} />
          </div>
          <p className="mt-2 font-bold leading-relaxed text-ink/85">{headline}</p>
          <p className="mt-2 text-sm leading-7 text-ink/60">{desc}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="tags">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-mist-50 px-2.5 py-1 text-[11px] font-semibold text-ink/65"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-sandline/70 pt-4">
            <span className="font-meta text-[10px] font-semibold uppercase tracking-wide text-ink/40">
              {t.work.role}
            </span>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-vector transition-colors hover:text-vector-600"
                aria-label={`${t.work.visit}: ${project.name}`}
              >
                {t.work.visit}
                <Visit className="size-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */

export function Work({ projects }: { projects?: WorkProjectData[] }) {
  const { t } = useLanguage();
  const items = projects && projects.length > 0 ? projects : projectsFromDictionary();

  return (
    <section id="work" data-animate aria-labelledby="work-heading" className="bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading label={t.work.label} heading={t.work.heading} sub={t.work.sub} />

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:mt-14">
          {items.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                i === 0 ? "lg:col-span-7" : i === 1 ? "lg:col-span-5" : "lg:col-span-4"
              )}
            >
              <ProjectCard project={p} featured={i === 0} delay={i * 0.06} />
            </div>
          ))}
        </div>

        <Reveal className="mt-8">
          <p className="flex items-start gap-3 rounded-2xl border border-sandline bg-mist-50 p-4 text-sm leading-7 text-ink/70 sm:p-5">
            <Info className="mt-1 size-4 shrink-0 text-coral" aria-hidden />
            <span>{t.work.disclaimer}</span>
          </p>
        </Reveal>

        <Reveal className="mt-6 flex items-center gap-2.5 text-sm text-ink/50">
          <Point className="bg-vector" />
          <span className="font-meta">
            {items.map((p) => p.name).join(" · ")}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
