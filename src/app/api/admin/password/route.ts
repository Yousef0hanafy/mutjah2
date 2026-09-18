import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin, verifyAdminCredentials } from "@/lib/admin/auth";

export const runtime = "nodejs";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(10, "new_password_too_short")
    .max(200)
    .regex(/[A-Za-z]/, "needs a letter")
    .regex(/[0-9]/, "needs a digit"),
});

/** POST /api/admin/password — change the admin password */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const parsed = passwordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_failed", issues: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 }
      );
    }
    const admin = await verifyAdminCredentials(guard.session.email, parsed.data.currentPassword);
    if (!admin) {
      return NextResponse.json({ ok: false, error: "wrong_password" }, { status: 403 });
    }
    await db.adminUser.update({
      where: { id: guard.session.sub },
      data: { passwordHash: hashPassword(parsed.data.newPassword) },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/password] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
