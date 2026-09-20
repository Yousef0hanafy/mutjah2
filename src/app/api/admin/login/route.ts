import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  loginRateLimited,
  loginSucceeded,
  setSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (await loginRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
    }

    const email = (body.email ?? "").trim();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_credentials" },
        { status: 400 }
      );
    }

    const admin = await verifyAdminCredentials(email, password);
    // Generic error for wrong email OR password — no account enumeration
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "invalid_credentials" },
        { status: 401 }
      );
    }

    await loginSucceeded(ip);
    await setSessionCookie(createSessionToken(admin));
    return NextResponse.json({ ok: true, email: admin.email });
  } catch (err) {
    console.error("[/api/admin/login] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
