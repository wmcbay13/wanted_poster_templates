# Haunted County Design System

The posters combine an Old West wanted notice, a haunted-mansion portrait, a police bulletin and a horror-movie one-sheet. Each template has its own personality, but all ten share the same paper, type, palette and layout skeleton.

## Layout skeleton

Every template stacks the same sections in the same order, top to bottom:

```
┌────────────────────────────────────────────┐
│  HEADER LINE (kicker) ─ sheriff's office   │
│               W A N T E D                  │  headline: auto-fit to width
│            THE CANDY BANDIT                │  sub-headline / family name
│ ══════════════════════════════════════════ │
│  [flank]   ┌──────────────┐   [flank]      │  photo(s): fixed aspect ratio,
│  ornament  │    PHOTO     │   ornament     │  auto-scaled to fill free height
│            └──────────────┘                │
│              GUEST NAME                    │  auto-fit, one line
│           alias "Sticky Fingers"           │
│               WANTED FOR                   │
│      crime text (up to 2 lines)            │
│              ★ REWARD ★                    │
│         1,000 PIECES OF CANDY              │  1 line when possible, else 2
│ ▞▞▞▞▞ ⚠ APPROACH WITH CHOCOLATE ⚠ ▞▞▞▞▞▞▞▞ │  caution-tape warning band
│  LAST SEEN …   CASE NO. …   HEARING …      │
│ ────────────────────────────────────────── │
│  footer text                 sheriff sig   │
└────────────────────────────────────────────┘
```

- **Units:** 1u = 1/50 of the poster width, and everything is sized in u. The same layout therefore scales from Letter to 18×24.
- **Fit pass:** after the fonts load, `PosterRenderer.fit()` shrinks the headline, name, crime, reward and warning until each fits its box. It then binary-searches the largest photo size that keeps the whole column on the page. Taller paper such as Tabloid automatically gets bigger photos.
- **Protected zones:** ornaments go in the margins, the photo flanks, the reward flanks and the frame. They never cover the name or the photo. The only exceptions are the deliberate stamps (CAPTURED / ESCAPED).
- **Safe margin:** the frame starts 2.2u in, which is 0.375 in on Letter. The text column starts at 3.3–4.6u. The burnt edge and torn corners sit outside the safe area by design.

## Palette

| Token | Hex | Role |
|---|---|---|
| Parchment | `#e9d6a8` | Paper base |
| Aged yellow | `#d6b97f` | Mottling and aging |
| Sepia brown | `#5a4632` | Secondary ink |
| Faded black | `#2b2522` | Primary ink |
| Deep burgundy | `#5c1a1b` | Banners and frames |
| Blood red | `#8a0303` | Accents, splatters, stamps |
| Burnt orange | `#c4561d` | Pumpkins, kids' accents |
| Muted olive | `#5b5b2e` | Stems, monsters, accents |

The children's collection pushes orange, purple (`#7b4a8f`) and olive brighter, but stays inside the vintage range.

### Print modes

All colors are CSS custom properties. The mode classes remap them, so no template needs separate artwork:

| Mode | What changes |
|---|---|
| `mode-full` | Colors as designed |
| `mode-sepia` | Every token maps to one brown ladder on cream paper; photos are toned sepia |
| `mode-ink` | White paper; textures, burn and stains removed; ornaments become outlines; photos grayscale; heavy frames thinned |

## Typography

| Role | Font | Notes |
|---|---|---|
| Headline / reward | **Rye** | Western woodblock display |
| Names | **Sancreek** (Rye for kids) | Decorative slab |
| Kids' sub-headlines | **Luckiest Guy**, **Bangers** | Playful cartoon accents |
| Horror accent | **Creepster** | Party Phantom only, used sparingly |
| Body / crime | **Special Elite** | Typewriter |
| Labels / footers | **Old Standard TT** | Newspaper serif, letter-spaced caps, italics |
| Signature | **Mrs Saint Delafield** | Sheriff's ink signature |

## Paper treatment

The aging comes from these layers, listed bottom to top:

1. Parchment color plus a radial vignette (vector gradients).
2. `mottle.jpg`: large aging blotches, blended with multiply.
3. Fold creases at 1/2 width and 1/3 and 2/3 height.
4. Coffee-ring stains and blood splatters (SVG ornaments).
5. Content.
6. `grain.png`: fine grain, multiply.
7. `speck.png`: ink-wear specks over the type.
8. Burnt edge: four jagged vector rings (scorch, char, white paper loss).
9. Optional torn corner (clip-path plus scorched edge line).

The textures are pre-rendered PNGs (`scripts/make-textures.mjs`) and the burn is vector. This keeps PDFs around 1.3 MB instead of 25 MB of rasterized SVG filters.

## Ornament library (`js/ornaments.js`)

The library includes these shapes:

- **Spooky:** bat (plain or cute), pumpkin (with or without a face), ghost (cute, boo, or silhouette), skull, crossbones, tombstone, corner spiderweb (with or without a spider), hanging spider, black cat, candle, moon
- **Horror:** blood splatter (procedural, seeded, optional drips), bloody or chocolate fingerprint
- **Lawman:** sheriff badge (custom text), wax seal (skull or bat emblem, optional ribbon), handcuffs, pocket watch, caution tape, stamps
- **Party:** wrapped candy, candy corn, lollipop, cookie (with a bite), crumbs, whiskey bottle (custom label), cocktail, coffee mug, Zzz, friendly monster, googly eye
- **Ornament:** western corner flourish, center flourish rule, coffee stain, photo tape

Every ornament takes its colors from `--o-*` tokens, so it adapts to all three print modes.

## Frames

| Frame | Used by | Character |
|---|---|---|
| `candy` | Candy Bandit | Orange/purple candy-stripe band |
| `teeth` | Little Monster | Rounded border with monster-teeth edges |
| `stitched` | Cookie Criminal | Stitched/dashed baker's border |
| `kids-western` | Spooky Suspect | Rounded double rule |
| `western` | Serial Snoozer | Double rule with corner flourishes |
| `saloon` | Booze Bandit | Heavy burgundy border, gold inner line |
| `gothic` | Party Phantom | Double rule with flourish, cobwebs |
| `bulletin` | Midnight Menace | Police bulletin bar, caution-tape corners |
| `ornate` | Special editions | Triple frame with corner flourishes |

## Photo frames

| Frame | Description |
|---|---|
| `polaroid` | Instant-photo mat, tape and handwritten caption |
| `googly` | Rounded frame with googly eyes peeking over the top |
| `mugshot` | Height ruler and HCSO case placard |
| `plain` | Double-ruled border |
| `cameo` | Gilded oval portrait, like the haunted mansion's hallway |
| `ornate` | Gilded double frame for the special editions |

The **distressed vintage photo** option adds an inner vignette, scratches and a clipped corner.
