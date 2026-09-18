import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  icon: z.string().trim().min(1).max(40).optional(),
  titleAr: z.string().trim().min(1).max(160).optional(),
  titleEn: z.string().trim().min(1).max(160).optional(),
  needAr: z.string().trim().min(3).max(400).optional(),
  needEn: z.string().trim().min(3).max(400).optional(),
  descAr: z.string().trim().min(3).max(1200).optional(),
  descEn: z.string().trim().min(3).max(1200).optional(),
  deliverablesAr: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
  deliverablesEn: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
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
    const service = await db.serviceItem.update({
      where: { id },
      data: {
        ...(d.icon !== undefined && { icon: d.icon }),
        ...(d.titleAr !== undefined && { titleAr: d.titleAr }),
        ...(d.titleEn !== undefined && { titleEn: d.titleEn }),
        ...(d.needAr !== undefined && { needAr: d.needAr }),
        ...(d.needEn !== undefined && { needEn: d.needEn }),
        ...(d.descAr !== undefined && { descAr: d.descAr }),
        ...(d.descEn !== undefined && { descEn: d.descEn }),
        ...(d.deliverablesAr !== undefined && { deliverablesAr: JSON.stringify(d.deliverablesAr) }),
        ...(d.deliverablesEn !== undefined && { deliverablesEn: JSON.stringify(d.deliverablesEn) }),
        ...(d.published !== undefined && { published: d.published }),
      },
    });
    return NextResponse.json({ ok: true, service });
  } catch (err) {
    console.error("[/api/admin/services PATCH] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const { id } = await params;
    await db.serviceItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/services DELETE] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
