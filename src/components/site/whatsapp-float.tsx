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
      className="group fixed bottom-5 end-5 z-40 flex size-13 items-center justify-center rounded-full bg-ink text-canvas shadow-xl shadow-ink/25 transition-all duration-300 hover:scale-105 hover:bg-vector active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vector"
    >
      {/* Subtle living beacon ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 animate-ping rounded-full bg-coral/30 opacity-75 [animation-duration:3s]"
      />
      <MessageCircle className="relative size-6 transition-transform duration-300 group-hover:scale-110" aria-hidden />
      <span className="pointer-events-none absolute end-full me-3 hidden whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-canvas shadow-md opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        {t.whatsapp.label}
      </span>
    </a>
  );
}
