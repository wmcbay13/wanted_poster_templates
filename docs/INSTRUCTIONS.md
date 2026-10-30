# Personalizing & Printing Your Posters

## 1. Open the studio

```bash
npm run serve
```

Then open <http://localhost:8080>. Any modern browser works; Chrome or Edge gives the most faithful print output. Your work autosaves in that browser. Uploaded photos can be too large for browser storage; if the studio warns you, use **Save guest list** to keep a file.

## 2. Make one poster per guest

| Step | What to do |
|---|---|
| **Add the guest** | Click **+ Add guest** in the left column. Use ⧉ to duplicate a guest, which is handy when several guests share a template. |
| **1 · Choose a template** | Click a thumbnail. Children's templates are bright and silly. Adult templates are darker, with blood splatters and sarcasm. Special editions take two suspects (Partners in Crime) or 2–6 (Most Wanted Family). |
| **2 · Suspect details & photo** | Enter the **Name** and an optional **Nickname / alias**. Then either **Upload photo** or click one of the 10 Halloween portraits (silhouette, pumpkin head, ghost, vampire, witch, skeleton, mummy, monster, black cat, werewolf). **Use placeholder** puts the `[UPLOAD PHOTO]` box back. |
| **Position the photo** | Drag the photo in the preview to reposition it, and scroll on it to zoom. The Zoom / Left-right / Up-down sliders do the same thing. The photo frame keeps the same size whatever image you upload, and the image is cropped to fill it. |
| **3 · Charges & reward** | Each field has a ▾ preset menu with the [library](LIBRARY.md), grouped Children / Adults / Couples / Families, or you can type your own text. Long text shrinks automatically to fit. **Reset text to template defaults** restores the template's own wording. |
| **4 · Stamps & extras** | Toggle the red **CAPTURED** stamp, an **ESCAPED** stamp, a **DO NOT APPROACH** stamp, a highlighted **LAST SEEN** label, a case number, the sheriff's signature, and the party date and location. |
| **5 · Print settings** | Choose the paper size and color version, and turn the distressed photo frame, torn paper corner and safe-margin guide on or off. These settings apply to every guest. |

Fields left empty show their bracketed placeholder on the poster, such as `[INSERT GUEST NAME]` or `[ENTER CRIME]`. Optional lines like the alias, last seen and footer simply disappear.

## 3. Export

| Button | Result |
|---|---|
| **Print / Save PDF** | Opens the print dialog for the current poster. Choose **Save as PDF** for a print-ready file, or send it straight to a printer. |
| **Print all guests** | One page per guest, in the order of the guest list. |
| **Download PNG (300 DPI)** | High-resolution image: 2550×3300 px for Letter, 3300×5100 for Tabloid, 5400×7200 for 18×24. Needs the studio opened through `npm run serve`. |
| **Save guest list / Load guest list** | A `.json` file containing every guest, photos included. Use it to back up your work, move to another computer, or batch-render. |

In the print dialog, use these settings:

- **Margins:** None. The posters already include a 0.375 in safe margin.
- **Scale:** 100% / Actual size. Don't use "Fit to page".
- **Background graphics:** On. The page requests this automatically in Chrome, Edge and Safari.
- **Paper size:** must match the size chosen in the studio. In the print dialog, pick Letter, Tabloid / Ledger, or 18×24.

## 4. Batch rendering (optional)

```bash
npm install
npm run render -- wanted-poster-guests.json                       # PDF + PNG per guest into exports/out
npm run render -- wanted-poster-guests.json --formats pdf --size tabloid --mode ink
```

Files are named `<guest>-<template>-<size>-<mode>.pdf/.png`.

## 5. Printing tips

- **Home printers:** Letter works on any printer. Choose **Sepia** for a uniform aged look, or **Ink-saving B&W** to use the least ink. That version drops the paper color and textures but keeps the type, frames and line art.
- **Copy shops:** send the PDF. Tabloid (11×17) and 18×24 posters should be printed "actual size" on matte or uncoated stock, which looks more authentic than gloss.
- **Extra aging:** after printing, lightly crumple the sheet, then flatten it. A wet tea bag dabbed on and left to dry adds real stains.
- **Display:** pin the posters up with thumbtacks, or tape them at a slight angle, so they look like they were nailed to a saloon wall.

## 6. Customizing the templates themselves

- **Wording and presets:** edit `js/library.js`.
- **Default text, ornaments and frame per template:** edit `js/templates.js`. The comment at the top explains the ornament placement fields.
- **Colors and fonts:** edit the tokens in `css/design-system.css`. Per-template overrides are in `css/templates.css`.

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the full design rules.
