import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const faqSchema = z.object({
  qAr: z.string().trim().min(3).max(300),
  qEn: z.string().trim().min(3).max(300),
  aAr: z.string().trim().min(10).max(2000),
  aEn: z.string().trim().min(10).max(2000),
  published: z.boolean().default(true),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const faqs = await db.faqItem.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ ok: true, faqs });
  } catch (err) {
    console.error("[/api/admin/faqs GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const parsed = faqSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const last = await db.faqItem.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const faq = await db.faqItem.create({
      data: { ...d, order: (last?.order ?? -1) + 1 },
    });
    return NextResponse.json({ ok: true, faq }, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/faqs POST] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
