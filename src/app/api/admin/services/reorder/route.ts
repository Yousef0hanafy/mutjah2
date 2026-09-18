import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const reorderSchema = z.object({
  items: z
    .array(z.object({ id: z.string().min(1), order: z.number().int().min(0).max(999) }))
    .min(1)
    .max(100),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const parsed = reorderSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
    }
    await db.$transaction(
      parsed.data.items.map((it) =>
        db.serviceItem.update({ where: { id: it.id }, data: { order: it.order } })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/services/reorder] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
