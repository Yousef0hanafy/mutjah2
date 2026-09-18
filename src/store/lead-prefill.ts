"use client";

import { create } from "zustand";
import type { AudienceType, NeedType } from "@/lib/i18n/dictionary";

/**
 * Pre-selection for the lead wizard.
 * Audience-path CTAs set these values, then scroll to #contact,
 * so the visitor arrives at a form that already understands them.
 */
type LeadPrefillState = {
  audience: AudienceType | null;
  need: NeedType | null;
  /** increments each time a CTA pre-fills, so the wizard can reset to step 1 highlight */
  nonce: number;
  setPrefill: (v: { audience?: AudienceType | null; need?: NeedType | null }) => void;
};

export const useLeadPrefill = create<LeadPrefillState>((set) => ({
  audience: null,
  need: null,
  nonce: 0,
  setPrefill: ({ audience, need }) =>
    set((s) => ({ audience, need, nonce: s.nonce + 1 })),
}));
