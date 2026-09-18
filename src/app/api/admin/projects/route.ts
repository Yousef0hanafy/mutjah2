import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  status: z.enum(["live", "deployed", "mvp"]).default("deployed"),
  langs: z.array(z.enum(["ar", "en"])).min(1).default(["ar", "en"]),
  headlineAr: z.string().trim().min(1).max(200),
  headlineEn: z.string().trim().min(1).max(200),
  descAr: z.string().trim().min(1).max(1200),
  descEn: z.string().trim().min(1).max(1200),
  tagsAr: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  tagsEn: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  url: z.string().trim().url().max(300).nullable().optional(),
  coverPath: z.string().trim().max(300).nullable().optional(),
  published: z.boolean().default(true),
});

/** GET /api/admin/projects — list all (including drafts), ordered */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const projects = await db.project.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    console.error("[/api/admin/projects GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

/** POST /api/admin/projects — create */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const parsed = projectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const last = await db.project.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const project = await db.project.create({
      data: {
        name: d.name,
        status: d.status,
        langs: JSON.stringify(d.langs),
        headlineAr: d.headlineAr,
        headlineEn: d.headlineEn,
        descAr: d.descAr,
        descEn: d.descEn,
        tagsAr: JSON.stringify(d.tagsAr),
        tagsEn: JSON.stringify(d.tagsEn),
        url: d.url ?? null,
        coverPath: d.coverPath ?? null,
        published: d.published,
        order: (last?.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/projects POST] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
