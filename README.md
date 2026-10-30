# Halloween WANTED Poster Templates

Ten vintage "WANTED" poster templates for a Halloween party, plus a browser studio for personalizing them for each guest and exporting print-ready files.

![All ten templates](exports/samples/collection.jpg)

| Children's Collection | Adult Collection | Special Edition |
|---|---|---|
| 1. The Candy Bandit | 5. The Serial Snoozer ("Dead or Asleep") | 9. Partners in Crime (2 suspects) |
| 2. The Little Monster | 6. The Booze Bandit | 10. The Most Wanted Family (2–6 suspects) |
| 3. The Cookie Criminal | 7. The Party Phantom | |
| 4. The Spooky Suspect | 8. The Midnight Menace | |

## Quick start

```bash
npm install          # only needed for batch rendering (puppeteer-core)
npm run serve        # then open http://localhost:8080
```

1. Pick a template.
2. Type the guest's name and alias.
3. Upload a photo or choose a Halloween portrait.
4. Choose a crime, reward and warning from the presets, or write your own.
5. Click **Print / Save PDF** or **Download PNG (300 DPI)**.

Full walkthrough: [docs/INSTRUCTIONS.md](docs/INSTRUCTIONS.md).

You can open `index.html` straight from disk for editing and PDF printing. PNG export needs the local server, because browsers block file access from `file://` pages.

## What's included

| Path | Contents |
|---|---|
| `index.html` | **Wanted Poster Studio**, the editor: guest list, live preview, presets, photo positioning, exports |
| `exports/samples/` | Completed sample posters for all 10 templates, as print-ready PDFs and JPG previews |
| `exports/samples/sepia/`, `ink-saver/` | The same samples in the sepia and ink-saving black-and-white versions |
| `exports/samples/tabloid/`, `poster/` | 11×17 and 18×24 examples |
| `exports/templates/` | Blank versions with `[INSERT GUEST NAME]` / `[UPLOAD PHOTO]` placeholders, for filling in by hand |
| `docs/LIBRARY.md` | 30 crimes, 20 rewards and 15 warning labels |
| `docs/DESIGN_SYSTEM.md` | Palette, typography, ornaments and layout rules |
| `scripts/render.mjs` | Batch renderer: PDF and 300 DPI PNG for a whole guest list |

## Print formats

![Sepia and ink-saving versions](exports/samples/color-modes.jpg)

- **Sizes:** US Letter 8.5×11, Tabloid 11×17, and Large Poster 18×24, all in portrait orientation.
- **Color versions:** Full color; Sepia / vintage; Ink-saving B&W, which uses white paper, outline art and no tonal fills.
- **PDF:** vector text and artwork, with photos and textures embedded at 300 DPI. Every poster keeps a 0.375 in safe margin.
- **PNG:** 300 DPI, so Letter comes out at 2550 × 3300 px.

## Batch rendering a whole party

In the studio, click **Save guest list** to get `wanted-poster-guests.json`, then run:

```bash
npm run render -- wanted-poster-guests.json --formats pdf,png --out exports/out
npm run render -- wanted-poster-guests.json --size tabloid --mode sepia
npm run samples      # rebuild everything in exports/samples and exports/templates
```

The renderer looks for Chromium or Chrome in the usual locations. Set `CHROME_PATH` if yours lives elsewhere.

## Project layout

```
css/design-system.css   color + type tokens, print-mode overrides
css/poster.css          shared poster structure (sized in poster units)
css/templates.css       frame styles + per-template personality
js/templates.js         the 10 template definitions (data only)
js/ornaments.js         SVG ornament library (bats, skulls, badges, splatters, ...)
js/portraits.js         Halloween character portraits used in place of photos
js/library.js           crimes, rewards, warnings, headlines, footers
js/render.js            shared renderer used by the studio and the batch script
js/editor.js            studio UI
js/export.js            PNG + print exports
assets/textures/        pre-rendered paper textures (scripts/make-textures.mjs)
vendor/                 locally hosted fonts (SIL OFL) and html-to-image (MIT)
```

Fonts are Rye, Sancreek, Special Elite, Creepster, Luckiest Guy, Bangers, Old Standard TT and Mrs Saint Delafield, all from Google Fonts under the SIL Open Font License.
