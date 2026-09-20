import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const leadSchema = z.object({
  name: z.string().trim().min(2, "name_too_short").max(80),
  email: z
    .string()
    .trim()
    .email("invalid_email")
    .max(160)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  company: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  scope: z
    .enum(["focused", "medium", "full", "undecided"])
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  message: z.string().trim().min(10, "message_too_short").max(2000),
  audienceType: z.enum(["business", "founder"]),
  needType: z.enum(["website", "product", "system", "automation", "support", "unsure"]),
  locale: z.enum(["ar", "en"]).default("ar"),
  /** Honeypot — must stay empty; bots fill it */
  website: z.string().optional().default(""),
});

/** Database-backed persistent rate limiter for leads: 5 submissions per 15 minutes per IP */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQS = 5;

async function leadRateLimited(ip: string): Promise<boolean> {
  const key = `lead:${ip}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  try {
    const existing = await db.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt < now) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });
      return false;
    }

    const updated = await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return updated.count > RATE_LIMIT_MAX_REQS;
  } catch (err) {
    console.error("[leadRateLimited] DB error:", err);
    return false;
  }
}

/* ── Lead notification (optional) ──────────────────────────────────────────
 * Set LEAD_WEBHOOK_URL to receive every new lead instantly via any service
 * that accepts a POST (Make.com, n8n, Zapier, Discord, Slack, Telegram relay…).
 * From Make/n8n you can forward to your Gmail / WhatsApp / Telegram.
 * Optionally set LEAD_WEBHOOK_SECRET to have it sent as "x-lead-secret" header.
 * If unset, notifications are skipped silently — leads are always stored in DB.
 * ──────────────────────────────────────────────────────────────────────── */
type LeadPayload = {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  audienceType: string;
  needType: string;
  scope: string | null;
  message: string;
  locale: string;
};

function formatLeadText(l: LeadPayload): string {
  const need: Record<string, { ar: string; en: string }> = {
    website: { ar: "موقع أو حضور رقمي", en: "Website / digital presence" },
    product: { ar: "منتج أو منصة", en: "Product / platform" },
    system: { ar: "نظام داخلي", en: "Internal system" },
    automation: { ar: "أتمتة أو ذكاء اصطناعي", en: "Automation / applied AI" },
    support: { ar: "دعم أو تطوير قائم", en: "Support / ongoing development" },
    unsure: { ar: "لست متأكدًا بعد", en: "Not sure yet" },
  };
  const audience: Record<string, { ar: string; en: string }> = {
    business: { ar: "شركة أو نشاط تجاري", en: "Business" },
    founder: { ar: "مؤسس أو محترف", en: "Founder / professional" },
  };
  const ar = l.locale !== "en";
  const lines = [
    ar ? "🚀 عميل محتمل جديد من موقع مُتَّجَه" : "🚀 New lead from the MUTJAH website",
    `— ${ar ? "الاسم" : "Name"}: ${l.name}`,
    l.company ? `— ${ar ? "الشركة/النشاط" : "Company"}: ${l.company}` : null,
    l.email ? `— ${ar ? "البريد" : "Email"}: ${l.email}` : null,
    l.phone ? `— ${ar ? "هاتف/واتساب" : "Phone/WhatsApp"}: ${l.phone}` : null,
    `— ${ar ? "من هو" : "Audience"}: ${audience[l.audienceType]?.[ar ? "ar" : "en"] ?? l.audienceType}`,
    `— ${ar ? "ما الذي يحتاج أن يتحرك" : "Need"}: ${need[l.needType]?.[ar ? "ar" : "en"] ?? l.needType}`,
    l.scope ? `— ${ar ? "الحجم" : "Scope"}: ${l.scope}` : null,
    `— ${ar ? "الرسالة" : "Message"}: ${l.message}`,
  ].filter(Boolean);
  return lines.join("\n");
}

async function notifyLead(lead: LeadPayload): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET
          ? { "x-lead-secret": process.env.LEAD_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({ text: formatLeadText(lead), lead }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    // Never let a notification failure affect the lead submission
    console.error("[/api/leads] webhook notify failed:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (await leadRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Honeypot triggered — pretend success, store nothing
    if (data.website && data.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    await db.lead.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        company: data.company ?? null,
        audienceType: data.audienceType,
        needType: data.needType,
        scope: data.scope ?? null,
        message: data.message,
        locale: data.locale,
        source: "homepage",
      },
    });

    // Use Next.js after() to guarantee background webhook delivery on serverless without delaying response
    after(async () => {
      await notifyLead({
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        company: data.company ?? null,
        audienceType: data.audienceType,
        needType: data.needType,
        scope: data.scope ?? null,
        message: data.message,
        locale: data.locale,
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/leads] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
