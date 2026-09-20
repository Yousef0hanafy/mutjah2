import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["live", "deployed", "mvp"]).optional(),
  langs: z.array(z.enum(["ar", "en"])).min(1).optional(),
  headlineAr: z.string().trim().min(1).max(200).optional(),
  headlineEn: z.string().trim().min(1).max(200).optional(),
  descAr: z.string().trim().min(1).max(1200).optional(),
  descEn: z.string().trim().min(1).max(1200).optional(),
  tagsAr: z.array(z.string().trim().min(1).max(60)).max(8).optional(),
  tagsEn: z.array(z.string().trim().min(1).max(60)).max(8).optional(),
  url: z
    .string()
    .trim()
    .url()
    .max(300)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  coverPath: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  published: z.boolean().optional(),
});

/** PATCH /api/admin/projects/[id] — update */
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
    const project = await db.project.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.status !== undefined && { status: d.status }),
        ...(d.langs !== undefined && { langs: JSON.stringify(d.langs) }),
        ...(d.headlineAr !== undefined && { headlineAr: d.headlineAr }),
        ...(d.headlineEn !== undefined && { headlineEn: d.headlineEn }),
        ...(d.descAr !== undefined && { descAr: d.descAr }),
        ...(d.descEn !== undefined && { descEn: d.descEn }),
        ...(d.tagsAr !== undefined && { tagsAr: JSON.stringify(d.tagsAr) }),
        ...(d.tagsEn !== undefined && { tagsEn: JSON.stringify(d.tagsEn) }),
        ...(d.url !== undefined && { url: d.url }),
        ...(d.coverPath !== undefined && { coverPath: d.coverPath }),
        ...(d.published !== undefined && { published: d.published }),
      },
    });
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error("[/api/admin/projects PATCH] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/** DELETE /api/admin/projects/[id] — remove */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    await db.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/projects DELETE] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
