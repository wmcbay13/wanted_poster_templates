#!/usr/bin/env node
/*
 * Batch renderer: headless Chromium -> print-ready PDF / 300 DPI PNG / JPG preview.
 *
 *   node scripts/render.mjs guests.json [--out exports/out] [--formats pdf,png,jpg]
 *                                       [--size letter|tabloid|poster] [--mode full|sepia|ink]
 *   node scripts/render.mjs scripts/samples.json --samples
 *
 * guests.json is the "Save guest list" file from the editor ({ guests: [state, ...] })
 * or a plain array of poster states. --size / --mode override every poster.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SIZES = { letter: [8.5, 11], tabloid: [11, 17], poster: [18, 24] };
const PRINT_DPI = 300;
const PREVIEW_WIDTH = 1000;

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      o[k] = v ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
    } else o._.push(a);
  }
  return o;
}

const slug = (s) => String(s || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'poster';

function findChrome() {
  const c = [process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe'];
  const hit = c.find((p) => p && fs.existsSync(p));
  if (!hit) throw new Error('Chrome/Chromium not found. Set CHROME_PATH=/path/to/chrome');
  return hit;
}

async function renderOne(page, state, outBase, formats) {
  const [w, h] = SIZES[state.size || 'letter'];
  const W = Math.round(w * 96), H = Math.round(h * 96);
  const written = [];
  const draw = async (dpr) => {
    await page.setViewport({ width: W, height: H, deviceScaleFactor: dpr });
    await page.evaluate((s) => window.renderState(s), state);
  };
  if (formats.includes('pdf')) {
    await draw(1);
    await page.pdf({ path: `${outBase}.pdf`, width: `${w}in`, height: `${h}in`, printBackground: true, preferCSSPageSize: true, pageRanges: '1' });
    written.push(`${outBase}.pdf`);
  }
  if (formats.includes('png')) {
    await draw(PRINT_DPI / 96);
    await page.screenshot({ path: `${outBase}.png`, clip: { x: 0, y: 0, width: W, height: H }, type: 'png' });
    written.push(`${outBase}.png`);
  }
  if (formats.includes('jpg')) {
    await draw(PREVIEW_WIDTH / W);
    await page.screenshot({ path: `${outBase}.jpg`, clip: { x: 0, y: 0, width: W, height: H }, type: 'jpeg', quality: 80 });
    written.push(`${outBase}.jpg`);
  }
  return written;
}

async function main() {
  const o = args(process.argv.slice(2));
  const input = o._[0];
  if (!input) {
    console.error('usage: node scripts/render.mjs <guests.json> [--out dir] [--formats pdf,png,jpg] [--size letter] [--mode full]\n       node scripts/render.mjs scripts/samples.json --samples');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(input, 'utf8'));
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(pathToFileURL(path.join(root, 'render.html')).href, { waitUntil: 'load' });

  const jobs = [];
  if (o.samples) {
    const only = o.only ? String(o.only).split(',') : null;
    for (const s of data.samples) {
      if (only && !only.some((x) => s.file.includes(x))) continue;
      const st = { ...s.state, size: 'letter' };
      jobs.push({ state: { ...st, mode: 'full' }, out: `exports/samples/${s.file}`, formats: ['pdf', 'jpg'] });
      jobs.push({ state: { ...st, mode: 'sepia' }, out: `exports/samples/sepia/${s.file}-sepia`, formats: ['pdf', 'jpg'] });
      jobs.push({ state: { ...st, mode: 'ink' }, out: `exports/samples/ink-saver/${s.file}-ink`, formats: ['pdf', 'jpg'] });
      jobs.push({ state: { template: st.template, size: 'letter', mode: 'full', fields: { headline: st.fields?.headline }, suspects: [], enh: {} }, out: `exports/templates/${s.file}-blank`, formats: ['pdf', 'jpg'] });
      if (!o['no-png']) jobs.push({ state: { ...st, mode: 'full' }, out: `exports/out/${s.file}-letter-300dpi`, formats: ['png'] });
      for (const [size, files] of Object.entries(data.largeSizes || {})) {
        if (files.includes(s.file)) jobs.push({ state: { ...st, size, mode: 'full' }, out: `exports/samples/${size}/${s.file}-${size}`, formats: ['pdf', 'jpg'] });
      }
    }
  } else {
    const list = Array.isArray(data) ? data : data.guests || [data];
    const formats = String(o.formats || 'pdf,png').split(',');
    const used = new Set();
    for (const st0 of list) {
      const st = { ...st0, size: o.size || st0.size || data.size || 'letter', mode: o.mode || st0.mode || data.mode || 'full' };
      let base = `${slug(st.suspects?.[0]?.name || st.fields?.familyName || st.template)}-${st.template}-${st.size}-${st.mode}`;
      let n = 2;
      while (used.has(base)) base = `${base}-${n++}`;
      used.add(base);
      jobs.push({ state: st, out: path.join(o.out || 'exports/out', base), formats });
    }
  }

  for (const j of jobs) {
    const outBase = path.resolve(root, j.out);
    fs.mkdirSync(path.dirname(outBase), { recursive: true });
    const files = await renderOne(page, j.state, outBase, j.formats);
    files.forEach((f) => console.log('wrote', path.relative(root, f)));
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
