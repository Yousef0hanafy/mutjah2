import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "id",
  "date",
  "name",
  "email",
  "phone",
  "company",
  "audienceType",
  "needType",
  "scope",
  "message",
  "locale",
  "source",
  "status",
];

/** GET /api/admin/leads/export — CSV download */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    const rows = leads.map((l) =>
      [
        l.id,
        l.createdAt.toISOString(),
        l.name,
        l.email,
        l.phone,
        l.company,
        l.audienceType,
        l.needType,
        l.scope,
        l.message,
        l.locale,
        l.source,
        l.status,
      ]
        .map(csvCell)
        .join(",")
    );
    // BOM so Excel opens Arabic text correctly
    const csv = "\uFEFF" + HEADERS.join(",") + "\n" + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="mutjah-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[/api/admin/leads/export] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
