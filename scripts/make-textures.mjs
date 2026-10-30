#!/usr/bin/env node
/*
 * Generates the paper texture PNGs in assets/textures/ from SVG noise.
 * Pre-rendered textures keep PDFs small: SVG filters get rasterized per page
 * at 300 DPI, but an image is embedded once.
 *   mottle.jpg  - large-scale aging blotches on white (multiply)
 *   grain.png   - seamless fine grain tile (dark specks on transparent, multiply)
 *   speck.png   - seamless ink-wear tile (cream specks on transparent)
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets/textures');
fs.mkdirSync(out, { recursive: true });

const tex = {
  mottle: { w: 850, h: 1100, svg: `
    <filter id="f" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".0042" numOctaves="5" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .26  0 0 0 2.4 -1.05"/>
    </filter>
    <rect width="100%" height="100%" fill="#fff"/><rect width="100%" height="100%" filter="url(#f)"/>
    <filter id="g" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="3"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .6  0 0 0 0 .45  0 0 0 0 .3  0 0 0 4 -2.6"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" opacity=".5"/>` },
  grain: { w: 600, h: 600, svg: `
    <filter id="f" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .23  0 0 0 0 .14  0 0 0 0 .06  0 0 0 3.6 -1.95"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#f)"/>` },
  speck: { w: 600, h: 600, svg: `
    <filter id="f" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="5" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .95  0 0 0 0 .9  0 0 0 0 .8  0 0 0 6 -3.95"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#f)"/>` },
};

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true });
const page = await browser.newPage();
for (const [name, t] of Object.entries(tex)) {
  await page.setViewport({ width: t.w, height: t.h, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}">${t.svg}</svg></body></html>`);
  const file = name === 'mottle' ? `${name}.jpg` : `${name}.png`; // mottle has no transparency
  await page.screenshot({ path: path.join(out, file), omitBackground: name !== 'mottle', clip: { x: 0, y: 0, width: t.w, height: t.h }, ...(name === 'mottle' ? { type: 'jpeg', quality: 85 } : {}) });
  console.log('wrote', `assets/textures/${file}`);
}
await browser.close();
