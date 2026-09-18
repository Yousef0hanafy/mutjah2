"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { sections } from "@/lib/i18n/dictionary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function Wordmark({ className }: { className?: string }) {
  const { locale } = useLanguage();
  const src =
    locale === "ar" ? "/brand/wordmark-ar-ink.png" : "/brand/wordmark-en-ink.png";
  return (
    <Image
      src={src}
      alt="MUTJAH مُتَّجَه"
      width={locale === "ar" ? 90 : 169}
      height={34}
      priority
      className={cn("h-9 w-auto", className)}
    />
  );
}

export function Header() {
  const { t, toggle, locale } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-animate
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-sandline/80 bg-canvas/85 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label="MUTJAH — الرئيسية"
          className="flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vector"
        >
          <Wordmark />
        </a>

        {/* Desktop nav */}
        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-7 lg:flex">
          {sections
            .filter((s) => s.id !== "contact")
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group relative py-2 text-[15px] font-medium text-ink/75 transition-colors hover:text-ink"
              >
                {t.nav[s.key]}
                <span
                  aria-hidden
                  className="absolute bottom-0 start-0 h-0.5 w-full origin-start scale-x-0 rounded-full bg-vector transition-transform duration-300 group-hover:scale-x-100"
                />
              </a>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={t.nav.switchAria}
            className="font-meta h-9 min-w-12 px-3 text-sm font-bold text-ink/70 hover:bg-ink/5 hover:text-ink"
          >
            {t.nav.switchLabel}
          </Button>
          <Button
            asChild
            size="sm"
            className="hidden h-10 rounded-xl bg-ink px-5 text-sm font-semibold text-canvas shadow-sm transition-colors hover:bg-vector sm:inline-flex"
          >
            <a href="#contact">{t.nav.cta}</a>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t.nav.openMenu}
                className="size-10 rounded-xl border-ink/15 bg-white/60 lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={locale === "ar" ? "right" : "left"}
              className="w-[300px] bg-canvas"
            >
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">MUTJAH</SheetTitle>
                <SheetDescription className="sr-only">
                  {locale === "ar" ? "قائمة التنقل الرئيسية" : "Main navigation menu"}
                </SheetDescription>
                <div className="mt-2 px-4">
                  <Wordmark />
                </div>
              </SheetHeader>
              <nav aria-label="قائمة الجوال" className="mt-8 flex flex-col gap-1">
                {sections.map((s) => (
                  <SheetClose key={s.id} asChild>
                    <a
                      href={`#${s.id}`}
                      className="rounded-xl px-4 py-3 text-lg font-semibold text-ink/80 transition-colors hover:bg-mist-50 hover:text-ink"
                    >
                      {t.nav[s.key]}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <Button className="mt-6 h-12 w-full rounded-xl bg-ink text-base font-semibold text-canvas hover:bg-vector">
                  {t.nav.cta}
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
