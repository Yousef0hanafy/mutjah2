/**
 * MUTJAH app icons — generated from the brand symbol in src/app/icon.png
 * (white mark on the ink rounded square). Run: bun scripts/generate-pwa-icons.ts
 *
 * Outputs
 *  - public/icons/icon-192.png, icon-512.png   full-bleed ink square + mark (manifest "any")
 *  - public/icons/icon-maskable-512.png        mark inside the maskable safe zone
 *  - public/icons/apple-touch-icon.png, src/app/apple-icon.png  180px, full-bleed (iOS rounds it)
 *  - public/favicon.ico                        16/32/48 of the rounded icon (visible on light and dark tabs)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const SOURCE = path.join(root, "src", "app", "icon.png");
const INK = { r: 16, g: 20, b: 28, alpha: 1 };

/** The white mark as a white image whose alpha follows its brightness over the ink background. */
async function extractMark(): Promise<Buffer> {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const a = data[i + 3] === 0 ? 0 : Math.max(0, Math.min(255, Math.round(((lum - 20) / (254 - 20)) * 255)));
    out[o] = out[o + 1] = out[o + 2] = 255;
    out[o + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toBuffer();
}

async function squareIcon(mark: Buffer, size: number, markRatio: number, file: string) {
  const markPx = Math.round(size * markRatio);
  const resized = await sharp(mark).resize(markPx, markPx, { fit: "inside" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(file);
  console.log(`✓ ${path.relative(root, file)} (${size}px)`);
}

/** Minimal ICO writer: PNG-compressed entries (supported by every current browser). */
async function writeIco(sizes: number[], file: string) {
  const pngs = await Promise.all(sizes.map((s) => sharp(SOURCE).resize(s, s).png().toBuffer()));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  const entries = Buffer.alloc(16 * sizes.length);
  let offset = 6 + entries.length;
  sizes.forEach((s, i) => {
    const e = i * 16;
    entries.writeUInt8(s >= 256 ? 0 : s, e);
    entries.writeUInt8(s >= 256 ? 0 : s, e + 1);
    entries.writeUInt8(0, e + 2);
    entries.writeUInt8(0, e + 3);
    entries.writeUInt16LE(1, e + 4);
    entries.writeUInt16LE(32, e + 6);
    entries.writeUInt32LE(pngs[i].length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync(file, Buffer.concat([header, entries, ...pngs]));
  console.log(`✓ ${path.relative(root, file)} (${sizes.join("/")})`);
}

async function main() {
  const outDir = path.join(root, "public", "icons");
  fs.mkdirSync(outDir, { recursive: true });
  const mark = await extractMark();

  await squareIcon(mark, 192, 0.6, path.join(outDir, "icon-192.png"));
  await squareIcon(mark, 512, 0.6, path.join(outDir, "icon-512.png"));
  await squareIcon(mark, 512, 0.46, path.join(outDir, "icon-maskable-512.png"));
  await squareIcon(mark, 180, 0.6, path.join(outDir, "apple-touch-icon.png"));
  await squareIcon(mark, 180, 0.6, path.join(root, "src", "app", "apple-icon.png"));
  await writeIco([16, 32, 48], path.join(root, "public", "favicon.ico"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
