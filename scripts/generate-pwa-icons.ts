import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
  const rootDir = process.cwd();
  const svgPath = path.join(rootDir, "public", "logo.svg");
  const outputDir = path.join(rootDir, "public", "icons");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // Background color matching the site's dark canvas: #0B0E14
  const bg = { r: 11, g: 14, b: 20, alpha: 1 };

  console.log("Generating PWA icons...");

  // 1. icon-192.png (192x192, logo ~140x140)
  const logo192 = await sharp(svgBuffer)
    .resize(140, 140)
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logo192, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "icon-192.png"));
  console.log("✓ Generated icon-192.png");

  // 2. icon-512.png (512x512, logo ~380x380)
  const logo512 = await sharp(svgBuffer)
    .resize(380, 380)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logo512, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "icon-512.png"));
  console.log("✓ Generated icon-512.png");

  // 3. icon-maskable-512.png (512x512, safe-zone logo ~310x310)
  const logoMaskable = await sharp(svgBuffer)
    .resize(310, 310)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logoMaskable, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "icon-maskable-512.png"));
  console.log("✓ Generated icon-maskable-512.png");

  // 4. apple-touch-icon.png (180x180, logo ~130x130)
  const logoApple = await sharp(svgBuffer)
    .resize(130, 130)
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logoApple, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png");

  console.log("All PWA icons generated successfully!");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
