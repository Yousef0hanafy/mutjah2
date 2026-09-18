/**
 * MUTJAH brand asset pipeline
 * Generates: trimmed wordmarks (ink + white), symbol variants, app icons, OG image.
 * One-time script — run with: bun scripts/prepare-brand-assets.mjs
 */
import sharp from "sharp";
import path from "path";
import fs from "fs";

const KB = "/home/z/my-project/upload/KB_extracted/KB";
const OUT = "/home/z/my-project/public/brand";
const WORK = "/home/z/my-project/public/images/work";
const INK = "#10141C";
const BLUE = "#315BFF";
const CORAL = "#FF6247";
const CANVAS = "#F2EFE7";

// Recolor every non-transparent pixel to a solid color, preserving alpha
async function recolor(srcPath, color) {
  const img = sharp(srcPath).trim({ threshold: 8 });
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += info.channels) {
    const a = info.channels === 4 ? out[i + 3] : 255;
    if (info.channels === 4) {
      out[i] = color === "white" ? 255 : 16;
      out[i + 1] = color === "white" ? 255 : 20;
      out[i + 2] = color === "white" ? 255 : 28;
      out[i + 3] = a;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
}

/**
 * Wordmarks render at 34px height (72px retina x2 + margin).
 * Saving at 136px height (4x) with palette quantization keeps them crisp
 * while cutting file size drastically vs full 1805px masters.
 */
const WORDMARK_SAVE_HEIGHT = 136;

async function savePng(buf, file) {
  const out = await sharp(buf)
    .resize({ height: WORDMARK_SAVE_HEIGHT })
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(path.join(OUT, file));
  console.log(`✓ ${file} (${out.width}x${out.height}, ${(out.size / 1024).toFixed(0)}KB)`);
}

async function main() {
  // ---------- Wordmarks ----------
  const enInk = await recolor(`${KB}/logo/logo_mutjah_en_noBG.png`, "ink");
  const enWhite = await recolor(`${KB}/logo/logo_mutjah_en_noBG.png`, "white");
  const arInk = await recolor(`${KB}/logo/logo_mutjah_ar_noBG.png`, "ink");
  const arWhite = await recolor(`${KB}/logo/logo_mutjah_ar_noBG.png`, "white");

  await savePng(enInk, "wordmark-en-ink.png");
  await savePng(enWhite, "wordmark-en-white.png");
  await savePng(arInk, "wordmark-ar-ink.png");
  await savePng(arWhite, "wordmark-ar-white.png");

  // ---------- Symbol (favicon source) ----------
  const symInk = await recolor(`${KB}/logo/favicon.png`, "ink");
  const symWhite = await recolor(`${KB}/logo/favicon.png`, "white");
  const symInkM = await sharp(symInk).metadata();
  const symWhiteM = await sharp(symWhite).metadata();
  console.log(`symbol ink: ${symInkM.width}x${symInkM.height}, white: ${symWhiteM.width}x${symWhiteM.height}`);

  // Pad symbol to square for favicon-style use
  const symInkSq = await sharp(symInk)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  // ---------- App icon: ink rounded square + white symbol ----------
  const radius = 96;
  const mask = Buffer.from(
    `<svg width="512" height="512"><rect x="0" y="0" width="512" height="512" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );
  const iconBase = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 16, g: 20, b: 28, alpha: 1 } },
  })
    .png()
    .toBuffer();
  const symbolForIcon = await sharp(symWhite)
    .resize(300, 300, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await sharp(iconBase)
    .composite([
      { input: symbolForIcon, left: 106, top: 106 },
      { input: mask, blend: "dest-in" },
    ])
    .png()
    .toFile("/home/z/my-project/src/app/icon.png");
  console.log("✓ src/app/icon.png (512x512)");

  // Apple icon (no rounded corners; iOS applies its own mask)
  const symbolApple = await sharp(symWhite)
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: { r: 16, g: 20, b: 28, alpha: 1 } } })
    .composite([{ input: symbolApple, left: 26, top: 26 }])
    .png()
    .toFile("/home/z/my-project/src/app/apple-icon.png");
  console.log("✓ src/app/apple-icon.png (180x180)");

  // ---------- Favicon fallback in public ----------
  await sharp(symInkSq).resize(48, 48).png().toFile(`${OUT}/favicon-48.png`);

  // ---------- OG image 1200x630 ----------
  // Route motif drawn as vector SVG (shapes only — no live text), then wordmarks composited.
  const routeSvg = (w, h, dir = 1) => Buffer.from(`
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs></defs>
    <!-- faint grid dots -->
    ${Array.from({ length: 7 }).map((_, r) =>
      Array.from({ length: 12 }).map((__, c) =>
        `<circle cx="${60 + c * 98}" cy="${40 + r * 88}" r="1.6" fill="#10141C" opacity="0.16"/>`).join("")
    ).join("")}
    <!-- the open route: starts at coral point, travels, turns, resolves into a form -->
    <path d="M ${dir > 0 ? 120 : w - 120} 470
             H ${dir > 0 ? 520 : w - 520}
             Q ${dir > 0 ? 560 : w - 560} 470 ${dir > 0 ? 560 : w - 560} 430
             V ${dir > 0 ? 300 : 300}
             Q ${dir > 0 ? 560 : w - 560} 260 ${dir > 0 ? 600 : w - 600} 260
             H ${dir > 0 ? w - 300 : 300}"
          fill="none" stroke="${BLUE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <!-- starting point (coral) -->
    <circle cx="${dir > 0 ? 120 : w - 120}" cy="470" r="13" fill="${CORAL}"/>
    <circle cx="${dir > 0 ? 120 : w - 120}" cy="470" r="26" fill="none" stroke="${CORAL}" stroke-width="2.5" opacity="0.5"/>
    <!-- gate (open brackets) -->
    <path d="M ${dir > 0 ? 480 : w - 480} 430 v 80" stroke="${CANVAS}" stroke-width="9" stroke-linecap="round" opacity="0.95"/>
    <path d="M ${dir > 0 ? 640 : w - 640} 260 v -80" stroke="${CANVAS}" stroke-width="9" stroke-linecap="round" opacity="0.95"/>
    <!-- working form (resolved module) -->
    <rect x="${dir > 0 ? w - 250 : 120}" y="215" width="130" height="90" rx="14" fill="none" stroke="${CANVAS}" stroke-width="7" opacity="0.95"/>
    <rect x="${dir > 0 ? w - 230 : 140}" y="240" width="90" height="10" rx="5" fill="${CORAL}" opacity="0.9"/>
    <rect x="${dir > 0 ? w - 230 : 140}" y="262" width="60" height="8" rx="4" fill="${CANVAS}" opacity="0.55"/>
  </svg>`);

  const ogW = 1200, ogH = 630;
  const bg = sharp({ create: { width: ogW, height: ogH, channels: 4, background: { r: 16, g: 20, b: 28, alpha: 1 } } });

  // Load trimmed white wordmarks, scale to fit
  const enM = await sharp(enWhite).metadata();
  const arM = await sharp(arWhite).metadata();
  const enOg = await sharp(enWhite).resize(430).png().toBuffer();
  const enOgM = await sharp(enOg).metadata();
  const arOg = await sharp(arWhite).resize(260).png().toBuffer();
  const arOgM = await sharp(arOg).metadata();

  await bg
    .composite([
      { input: routeSvg(ogW, ogH), left: 0, top: 0 },
      // EN wordmark top-left area
      {
        input: enOg,
        left: 84,
        top: 110,
      },
      // divider + AR wordmark under EN
      {
        input: Buffer.from(`<svg width="360" height="6"><rect width="120" height="6" rx="3" fill="${CORAL}"/></svg>`),
        left: 88,
        top: 110 + enOgM.height + 34,
      },
      {
        input: arOg,
        left: 84,
        top: 110 + enOgM.height + 70,
      },
    ])
    .png()
    .toFile("/home/z/my-project/public/og.png");
  console.log("✓ public/og.png (1200x630)");

  // ---------- Portfolio covers (WebP — the KB PNGs are 1.5-2.1MB each) ----------
  const covers = {
    infeworks: `${KB}/project_covers/infeworks.png`,
    hemma: `${KB}/project_covers/hemma.png`,
    qidr: `${KB}/project_covers/qidr.png`,
    elmorabbi: `${KB}/project_covers/elmorabbi.png`,
    "performance-gym": `${KB}/project_covers/performance.png`,
  };
  for (const [name, src] of Object.entries(covers)) {
    const dest = `${WORK}/${name}.webp`;
    const out = await sharp(src)
      .webp({ quality: 82, effort: 6 })
      .toFile(dest);
    console.log(`✓ covers/${name}.webp (${out.width}x${out.height}, ${(out.size / 1024).toFixed(0)}KB)`);
  }
  // Remove legacy PNG covers so public/ doesn't ship dead weight
  for (const name of Object.keys(covers)) {
    const legacy = `${WORK}/${name}.png`;
    if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
  }

  console.log("\nAll brand assets generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
