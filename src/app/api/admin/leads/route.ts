import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const VALID_STATUSES = new Set(["new", "contacted", "qualified", "closed"]);

/** GET /api/admin/leads?status=new — list leads (newest first) */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const status = req.nextUrl.searchParams.get("status");
    const leads = await db.lead.findMany({
      where: status && VALID_STATUSES.has(status) ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    console.error("[/api/admin/leads GET] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
