import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const serviceSchema = z.object({
  icon: z.string().trim().min(1).max(40).default("globe"),
  titleAr: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  needAr: z.string().trim().min(3).max(400),
  needEn: z.string().trim().min(3).max(400),
  descAr: z.string().trim().min(3).max(1200),
  descEn: z.string().trim().min(3).max(1200),
  deliverablesAr: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  deliverablesEn: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  published: z.boolean().default(true),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const services = await db.serviceItem.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ ok: true, services });
  } catch (err) {
    console.error("[/api/admin/services GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const parsed = serviceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const last = await db.serviceItem.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const service = await db.serviceItem.create({
      data: {
        ...d,
        deliverablesAr: JSON.stringify(d.deliverablesAr),
        deliverablesEn: JSON.stringify(d.deliverablesEn),
        order: (last?.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ ok: true, service }, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/services POST] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
