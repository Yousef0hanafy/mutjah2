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
  email: "youssefhanafy325@gmail.com",
  /** WhatsApp number in international format without "+", e.g. "201012345678" — leave "" to hide */
  whatsapp: "201100475722",
  ogImage: "/og.png",
} as const;
