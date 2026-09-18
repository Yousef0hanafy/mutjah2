"use client";

import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { siteConfig } from "@/lib/site-config";
import type { ContactInfo } from "@/lib/admin/types";

/**
 * Floating WhatsApp action — rendered only when the number is configured,
 * so the site never shows a broken contact channel.
 */
export function WhatsAppFloat({ contact }: { contact?: ContactInfo }) {
  const { t } = useLanguage();
  const whatsapp = contact?.whatsapp ?? siteConfig.whatsapp;
  if (!whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.aria}
      className="group fixed bottom-5 end-5 z-40 flex size-13 items-center justify-center rounded-full bg-ink text-canvas shadow-lg shadow-ink/25 transition-all duration-300 hover:bg-vector focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vector"
    >
      <MessageCircle className="size-6" aria-hidden />
      <span className="pointer-events-none absolute end-full me-3 hidden whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-canvas opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        {t.whatsapp.label}
      </span>
    </a>
  );
}
