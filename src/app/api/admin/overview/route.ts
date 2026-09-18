import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

/** Dashboard counts for the admin overview tab. */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const [projects, publishedProjects, testimonials, faqItems, services, leads, newLeads] =
      await Promise.all([
        db.project.count(),
        db.project.count({ where: { published: true } }),
        db.testimonial.count(),
        db.faqItem.count(),
        db.serviceItem.count(),
        db.lead.count(),
        db.lead.count({ where: { status: "new" } }),
      ]);

    const lastLead = await db.lead.findFirst({
      orderBy: { createdAt: "desc" },
      select: { name: true, createdAt: true, status: true },
    });

    return NextResponse.json({
      ok: true,
      stats: {
        projects,
        publishedProjects,
        testimonials,
        faqItems,
        services,
        leads,
        newLeads,
        lastLead,
      },
    });
  } catch (err) {
    console.error("[/api/admin/overview] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
