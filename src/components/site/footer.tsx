"use client";

import Image from "next/image";
import { Facebook, Linkedin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { sections } from "@/lib/i18n/dictionary";
import { siteConfig } from "@/lib/site-config";
import type { ContactInfo } from "@/lib/admin/types";
import { Point } from "./primitives";

export function Footer({ contact }: { contact?: ContactInfo }) {
  const { t, locale } = useLanguage();
  const year = new Date().getFullYear();
  const email = contact?.email ?? siteConfig.email;
  const whatsapp = contact?.whatsapp ?? siteConfig.whatsapp;

  return (
    <footer data-animate className="mt-auto bg-ink text-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Image
              src={locale === "ar" ? "/brand/wordmark-ar-white.png" : "/brand/wordmark-en-white.png"}
              alt="MUTJAH مُتَّجَه"
              width={locale === "ar" ? 90 : 169}
              height={34}
              className="h-9 w-auto"
            />
            <p className="mt-5 max-w-sm text-sm leading-8 text-canvas/60">
              {t.footer.descriptor}
            </p>
            <p className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-canvas/80">
              <Point />
              {t.footer.tagline}
            </p>
            {siteConfig.linkedin || siteConfig.facebook ? (
              <div className="mt-7 flex items-center gap-2.5">
                {siteConfig.linkedin && (
                  <a
                    href={siteConfig.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MUTJAH on LinkedIn"
                    className="grid size-10 place-items-center rounded-full border border-canvas/15 text-canvas/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-canvas/90 hover:bg-canvas hover:text-ink"
                  >
                    <Linkedin className="size-[18px]" aria-hidden />
                  </a>
                )}
                {siteConfig.facebook && (
                  <a
                    href={siteConfig.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="MUTJAH on Facebook"
                    className="grid size-10 place-items-center rounded-full border border-canvas/15 text-canvas/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-canvas/90 hover:bg-canvas hover:text-ink"
                  >
                    <Facebook className="size-[18px]" aria-hidden />
                  </a>
                )}
              </div>
            ) : null}
          </div>

          {/* Links */}
          <nav aria-label={t.footer.navTitle} className="md:col-span-2">
            <h3 className="text-sm font-bold text-canvas/40">{t.footer.navTitle}</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-canvas/70 transition-colors hover:text-canvas"
                  >
                    {t.nav[s.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-canvas/40">{t.footer.servicesTitle}</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {t.services.items.map((s) => (
                <li key={s.id}>
                  <a
                    href="#services"
                    className="text-sm text-canvas/70 transition-colors hover:text-canvas"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-bold text-canvas/40">{t.footer.contactTitle}</h3>
            <p className="mt-4 text-sm leading-7 text-canvas/60">{t.footer.contactMsg}</p>
            <p className="mt-4 text-sm leading-7 text-canvas/60">{t.footer.location}</p>
            <div className="mt-4 flex flex-col gap-2">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="font-meta text-sm text-canvas/70 transition-colors hover:text-canvas"
                  dir="ltr"
                >
                  {email}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-canvas/70 transition-colors hover:text-canvas"
                >
                  WhatsApp: <span dir="ltr">+{whatsapp}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-canvas/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-canvas/45">
            © {year} MUTJAH · مُتَّجَه — {t.footer.rights}
          </p>
          <p className="flex items-center gap-2 text-xs text-canvas/45">
            <span aria-hidden className="size-1.5 rounded-full bg-coral/80" />
            {t.footer.crafted}
          </p>
        </div>
      </div>
    </footer>
  );
}
