/**
 * MUTJAH admin auth — single-owner, zero-dependency session auth.
 * - Passwords: scrypt (node:crypto), format scrypt$<salt>$<hash>
 * - Sessions:  HMAC-SHA256 signed token <payloadB64>.<sigB64>, 7-day expiry
 * - Cookie:    mutjah_admin_session, httpOnly, sameSite=lax, secure in prod
 *
 * Every /api/admin route must call requireAdmin() first.
 */
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "mutjah_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET missing in .env");
  if (s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters long for security");
  }
  if (process.env.NODE_ENV === "production" && s.includes("replace-with-random")) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a secure, unique secret in production");
  }
  return s;
}

/* ── Passwords ────────────────────────────────────────────────────────────── */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ── Session token ────────────────────────────────────────────────────────── */

type SessionPayload = { sub: string; email: string; exp: number };

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(admin: { id: string; email: string }): string {
  const payload: SessionPayload = {
    sub: admin.id,
    email: admin.email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expectedSig = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ── Server-side session helpers ──────────────────────────────────────────── */

export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Returns a 401 response when unauthenticated; otherwise returns the session. */
export async function requireAdmin(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

/** Set/clear the session cookie (use inside route handlers). */
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/* ── Login rate limiting: 5 attempts / 15 min / IP (Serverless-persistent via DB) ── */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function loginRateLimited(ip: string): Promise<boolean> {
  const key = `admin-login:${ip}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WINDOW_MS);

  try {
    const existing = await db.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt < now) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });
      return false;
    }

    const updated = await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return updated.count > MAX_ATTEMPTS;
  } catch (err) {
    console.error("[loginRateLimited] DB error:", err);
    return false;
  }
}

export async function loginSucceeded(ip: string): Promise<void> {
  const key = `admin-login:${ip}`;
  try {
    await db.rateLimit.deleteMany({
      where: { key },
    });
  } catch (err) {
    console.error("[loginSucceeded] DB cleanup error:", err);
  }
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ id: string; email: string } | null> {
  const admin = await db.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!admin) return null;
  if (!verifyPassword(password, admin.passwordHash)) return null;
  return { id: admin.id, email: admin.email };
}
