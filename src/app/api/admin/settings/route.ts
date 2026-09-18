import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const settingsSchema = z.object({
  contact_email: z.string().trim().email().max(160).or(z.literal("")).optional(),
  contact_whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9]*$/, "whatsapp must be digits only, international format")
    .max(20)
    .or(z.literal(""))
    .optional(),
  social_linkedin: z.string().trim().url().max(300).or(z.literal("")).optional(),
  social_facebook: z.string().trim().url().max(300).or(z.literal("")).optional(),
  social_instagram: z.string().trim().url().max(300).or(z.literal("")).optional(),
});

const ALLOWED_KEYS = new Set([
  "contact_email",
  "contact_whatsapp",
  "social_linkedin",
  "social_facebook",
  "social_instagram",
]);

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const rows = await db.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[/api/admin/settings GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const parsed = settingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const entries = Object.entries(parsed.data).filter(
      ([key]) => ALLOWED_KEYS.has(key)
    );
    for (const [key, value] of entries) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/settings PUT] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
