import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * POST /api/admin/upload — multipart image upload (project covers, avatars).
 *
 * Converts any accepted raster image to optimized WebP, then stores it:
 * - On Vercel (BLOB_READ_WRITE_TOKEN present): Vercel Blob → public URL (serverless FS is read-only)
 * - Everywhere else: /public/uploads with a random name (never user-controlled → no traversal)
 *
 * Response: { ok: true, path } | { ok: false, error }
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const uploadType = form.get("type"); // "avatar" | "cover"

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ ok: false, error: "bad_type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let sharpPipeline = sharp(buffer).rotate(); // respect EXIF orientation

    if (uploadType === "avatar") {
      sharpPipeline = sharpPipeline
        .resize({ width: 320, height: 320, fit: "cover", position: "center" })
        .webp({ quality: 80, effort: 5 });
    } else {
      sharpPipeline = sharpPipeline
        .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 });
    }

    let webp: Buffer;
    try {
      webp = await sharpPipeline.toBuffer();
    } catch (imageErr) {
      console.error("[/api/admin/upload POST] image processing error:", imageErr);
      return NextResponse.json({ ok: false, error: "invalid_image" }, { status: 400 });
    }

    const prefix = uploadType === "avatar" ? "avatar" : "cover";
    const name = `${prefix}-${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.webp`;

    // Vercel serverless: read-only filesystem → use Blob storage when configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${name}`, webp, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
      });
      return NextResponse.json({ ok: true, path: blob.url }, { status: 201 });
    }

    // Guard: serverless read-only filesystem check in production
    if (process.env.NODE_ENV === "production" && (process.env.VERCEL || process.env.VERCEL_ENV)) {
      console.error("[/api/admin/upload POST] BLOB_READ_WRITE_TOKEN is missing on Vercel deployment!");
      return NextResponse.json(
        { ok: false, error: "blob_token_missing" },
        { status: 500 }
      );
    }

    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(UPLOADS_DIR, name), webp);
    return NextResponse.json({ ok: true, path: `/uploads/${name}` }, { status: 201 });
  } catch (err) {
    console.error("[/api/admin/upload POST] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
