/**
 * MUTJAH site configuration.
 * ─────────────────────────────
 * Update `url`, `email` and `whatsapp` when the domain & contact channels are live.
 * The WhatsApp floating button and email links render ONLY when these values are set,
 * so the site never shows broken contact channels.
 */
export const siteConfig = {
  name: "MUTJAH",
  arabicName: "مُتَّجَه",
  /** Production origin — used for canonical URLs, sitemap, robots & OG */
  url: "https://mutjah.com",
  /** Public contact email — leave "" to hide from UI */
  email: "hello@mutjah.com",
  /** WhatsApp number in international format without "+", e.g. "201012345678" — leave "" to hide */
  whatsapp: "201100475722",
  /** Social channels — leave "" to hide from footer & structured data */
  linkedin: "https://www.linkedin.com/company/mutjah",
  facebook: "https://www.facebook.com/profile.php?id=61594637333936",
  ogImage: "/og.png",
} as const;
