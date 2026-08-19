import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#FFF7ED"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F97316"/>
      <stop offset="1" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="12" fill="url(#acc)"/>
  <rect x="80" y="96" width="128" height="128" rx="30" fill="url(#acc)"/>
  <text x="144" y="190" font-family="Arial, sans-serif" font-size="70" font-weight="800" fill="#FFFFFF" text-anchor="middle">XF</text>
  <text x="80" y="320" font-family="Arial, sans-serif" font-size="76" font-weight="800" fill="#111827">Xclusiv Freight</text>
  <text x="80" y="384" font-family="Arial, sans-serif" font-size="36" fill="#4B5563">Logistics &amp; Document Management</text>
  <circle cx="92" cy="452" r="10" fill="#F97316"/>
  <text x="124" y="464" font-family="Arial, sans-serif" font-size="30" fill="#4B5563">Offline-first load instructions for your fleet</text>
  <circle cx="92" cy="516" r="10" fill="#F97316"/>
  <text x="124" y="528" font-family="Arial, sans-serif" font-size="30" fill="#4B5563">Scan diesel slips, tolls &amp; POD signatures in seconds</text>
  <circle cx="92" cy="580" r="10" fill="#F97316"/>
  <text x="124" y="592" font-family="Arial, sans-serif" font-size="30" fill="#4B5563">WhatsApp &amp; email trip reports straight to the office</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.join(PUBLIC_DIR, "og-image.png"));

const favicon = `
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#F97316"/>
  <text x="32" y="45" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" text-anchor="middle">XF</text>
</svg>`;

await sharp(Buffer.from(favicon)).png().toFile(path.join(PUBLIC_DIR, "favicon.png"));

const out = path.join(PUBLIC_DIR, "og-image.png");
const meta = await sharp(out).metadata();
console.log(`Generated og-image.png (${meta.width}x${meta.height}) and favicon.png in public/`);