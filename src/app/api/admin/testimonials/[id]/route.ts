import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  company: z.string().trim().max(120).nullable().optional(),
  roleAr: z.string().trim().max(160).nullable().optional(),
  roleEn: z.string().trim().max(160).nullable().optional(),
  quoteAr: z.string().trim().min(10).max(800).optional(),
  quoteEn: z.string().trim().min(10).max(800).optional(),
  avatarPath: z.string().trim().max(300).nullable().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.company !== undefined && { company: d.company }),
        ...(d.roleAr !== undefined && { roleAr: d.roleAr }),
        ...(d.roleEn !== undefined && { roleEn: d.roleEn }),
        ...(d.quoteAr !== undefined && { quoteAr: d.quoteAr }),
        ...(d.quoteEn !== undefined && { quoteEn: d.quoteEn }),
        ...(d.avatarPath !== undefined && { avatarPath: d.avatarPath }),
        ...(d.published !== undefined && { published: d.published }),
      },
    });
    return NextResponse.json({ ok: true, testimonial });
  } catch (err) {
    console.error("[/api/admin/testimonials PATCH] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/testimonials DELETE] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
