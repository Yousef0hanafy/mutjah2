import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).nullable().optional(),
  roleAr: z.string().trim().max(160).nullable().optional(),
  roleEn: z.string().trim().max(160).nullable().optional(),
  quoteAr: z.string().trim().min(10).max(800),
  quoteEn: z.string().trim().min(10).max(800),
  avatarPath: z.string().trim().max(300).nullable().optional(),
  published: z.boolean().default(true),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const testimonials = await db.testimonial.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ ok: true, testimonials });
  } catch (err) {
    console.error("[/api/admin/testimonials GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const parsed = testimonialSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const last = await db.testimonial.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const testimonial = await db.testimonial.create({
      data: {
        name: d.name,
        company: d.company ?? null,
        roleAr: d.roleAr ?? null,
        roleEn: d.roleEn ?? null,
        quoteAr: d.quoteAr,
        quoteEn: d.quoteEn,
        avatarPath: d.avatarPath ?? null,
        published: d.published,
        order: (last?.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ ok: true, testimonial }, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/testimonials POST] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
