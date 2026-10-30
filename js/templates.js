/*
 * The ten poster templates. Pure data: renderPoster() in js/render.js reads it.
 *
 * Ornament placement: { o: ornament name, args: {...}, a: anchor corner
 * ('tl' | 'tr' | 'bl' | 'br'), x / y: offset from that corner in poster units
 * (1u = width / 50), w: width in u, r: rotation, flip: 'x' | 'y' | 'xy',
 * layer: 'back' (under text) | 'front', op: opacity, ink: false to hide in
 * ink-saver mode }.
 * Ornaments live in the margins, the photo flanks and the frame, never on
 * top of the name or photo.
 */
(function (global) {
  'use strict';

  const SHERIFF = "The Haunted County Sheriff's Office";

  const T = [
    /* ------------------------------------------------ CHILDREN */
    {
      id: 'candy-bandit', no: 1, name: 'The Candy Bandit', collection: 'kids',
      frame: 'candy', photoFrame: 'polaroid', layout: 'single',
      defaults: {
        kicker: SHERIFF, headline: 'WANTED', subhead: 'The Candy Bandit',
        crime: 'Suspected of stealing Halloween candy!',
        reward: '1,000 PIECES OF CANDY', rewardNote: '',
        warning: 'Approach With Chocolate', lastSeen: 'Near the candy bowl',
        footer: 'Report Sightings to the Haunted Sheriff',
      },
      flanks: { fw: 9, left: [{ o: 'pumpkin' }, { o: 'candycorn', w: 4 }], right: [{ o: 'lollipop', w: 5.5 }, { o: 'candy', args: { color: 'purple' } }] },
      ornaments: [
        { o: 'bat', args: { cute: true }, a: 'tl', x: 3.2, y: 13.2, w: 7, r: -12 },
        { o: 'bat', args: { cute: true }, a: 'tr', x: 3, y: 12.6, w: 6, r: 14 },
        { o: 'candy', a: 'bl', x: 2.6, y: 2.4, w: 6.5, r: -20 },
        { o: 'candy', args: { color: 'purple' }, a: 'br', x: 4.6, y: 3.4, w: 6.5, r: 18 },
        { o: 'stain', a: 'tr', x: 6, y: 20, w: 10, layer: 'back', op: .55, ink: false },
      ],
      texture: { seed: 3, torn: 'br' },
    },
    {
      id: 'little-monster', no: 2, name: 'The Little Monster', collection: 'kids',
      frame: 'teeth', photoFrame: 'googly', layout: 'single',
      defaults: {
        kicker: SHERIFF, headline: 'WANTED', subhead: 'Little Monster',
        crime: 'Causing Mischief After Bedtime',
        reward: '500 GUMMY WORMS', rewardNote: '',
        warning: 'May Cause Giggles', lastSeen: 'Hiding under the bed',
        footer: 'Proceed at Your Own Risk',
      },
      flanks: { fw: 9.5, left: [{ o: 'monster', args: { color: 'green' } }, { o: 'eye', w: 3.5, args: { dx: -5, dy: 4 } }], right: [{ o: 'monster', args: { color: 'purple', lookLeft: true } }, { o: 'ghost', w: 5.5, args: { cute: true } }] },
      ornaments: [
        { o: 'ghost', args: { cute: true }, a: 'tl', x: 3.5, y: 12.8, w: 6, r: -10 },
        { o: 'ghost', args: { cute: true, boo: true }, a: 'tr', x: 3.5, y: 12.4, w: 6, r: 10 },
        { o: 'eye', a: 'bl', x: 3.4, y: 3.4, w: 3, args: { dx: 6, dy: -3 } },
        { o: 'eye', a: 'bl', x: 6.2, y: 2.6, w: 2.4, args: { dx: 4, dy: -6 } },
        { o: 'eye', a: 'br', x: 3.4, y: 3.2, w: 3.2, args: { dx: -6, dy: -2 } },
        { o: 'stain', a: 'bl', x: 4, y: 20, w: 9, layer: 'back', op: .5, ink: false },
      ],
      texture: { seed: 8 },
    },
    {
      id: 'cookie-criminal', no: 3, name: 'The Cookie Criminal', collection: 'kids',
      frame: 'stitched', photoFrame: 'mugshot', layout: 'single',
      defaults: {
        kicker: 'Haunted County Police Bulletin', headline: 'WANTED', subhead: 'Cookie Criminal',
        crime: 'Last Seen With Crumbs on Their Face',
        reward: 'ONE GIANT COOKIE', rewardNote: '',
        warning: 'Known Snack Thief', lastSeen: 'Near the cookie jar',
        footer: 'Last Seen Near the Candy Bowl',
      },
      flanks: { fw: 9, left: [{ o: 'fingerprint', args: { color: 'choc', seed: 4 }, w: 6.5, cap: 'Exhibit A' }], right: [{ o: 'cookie', w: 8 }, { o: 'candycorn', w: 3.6 }] },
      ornaments: [
        { o: 'cookie', args: { seed: 2, bite: false }, a: 'tl', x: 3.2, y: 12.8, w: 6, r: 15 },
        { o: 'cookie', args: { seed: 8 }, a: 'tr', x: 3.2, y: 12.8, w: 6, r: -30 },
        { o: 'crumbs', a: 'tr', x: 2.5, y: 18, w: 8, layer: 'back' },
        { o: 'crumbs', args: { seed: 4 }, a: 'bl', x: 3, y: 19, w: 8, layer: 'back' },
        { o: 'candy', a: 'br', x: 2.6, y: 2.6, w: 5.6, r: -15 },
        { o: 'fingerprint', args: { color: 'choc', seed: 11 }, a: 'bl', x: 3.4, y: 2.8, w: 3.4, r: -20, op: .7 },
      ],
      texture: { seed: 5, torn: 'tl' },
    },
    {
      id: 'spooky-suspect', no: 4, name: 'The Spooky Suspect', collection: 'kids',
      frame: 'kids-western', photoFrame: 'polaroid', layout: 'single',
      defaults: {
        kicker: SHERIFF, headline: 'WANTED', subhead: 'Spooky Suspect',
        crime: 'Disturbing the Peace With Scary Noises',
        reward: 'ONE BUCKET OF TREATS', rewardNote: '',
        warning: 'May Say BOO Without Warning', lastSeen: 'Behind the haunted hedge',
        footer: 'Report Sightings to the Haunted Sheriff',
      },
      flanks: { fw: 9.5, left: [{ o: 'ghost', args: { cute: true, boo: true } }, { o: 'bat', args: { cute: true }, w: 6 }], right: [{ o: 'moon', w: 6.5 }, { o: 'pumpkin', w: 8 }] },
      ornaments: [
        { o: 'bat', args: { cute: true }, a: 'tl', x: 3.6, y: 13, w: 6, r: -14 },
        { o: 'bat', args: { cute: true }, a: 'tr', x: 3.6, y: 13.4, w: 5, r: 18 },
        { o: 'pumpkin', a: 'bl', x: 2.6, y: 2.4, w: 5.4 },
        { o: 'pumpkin', args: { face: false }, a: 'br', x: 2.8, y: 2.4, w: 4.8 },
        { o: 'web', a: 'tl', x: 2.2, y: 2.2, w: 9, layer: 'back', op: .6 },
      ],
      texture: { seed: 12 },
    },

    /* ------------------------------------------------ ADULTS */
    {
      id: 'serial-snoozer', no: 5, name: 'The Serial Snoozer', collection: 'adults',
      frame: 'western', photoFrame: 'mugshot', layout: 'single',
      defaults: {
        kicker: SHERIFF, headline: 'WANTED', subhead: 'Dead or Asleep',
        crime: 'Repeatedly Falling Asleep at Parties',
        reward: '$5,000', rewardNote: 'or a strong coffee',
        warning: 'Approach With Caffeine', lastSeen: 'Asleep on the couch',
        footer: "Property of the Halloween Sheriff's Department",
      },
      flanks: { fw: 9, left: [{ o: 'badge' }], right: [{ o: 'zzz', w: 6.5 }, { o: 'coffee', w: 7.5 }] },
      ornaments: [
        { o: 'splatter', args: { seed: 14, drips: 3 }, a: 'tr', x: -1.5, y: -1, w: 13, layer: 'back', op: .8, cls: 'under-ink' },
        { o: 'splatter', args: { seed: 31 }, a: 'bl', x: 1.5, y: 14, w: 7, layer: 'back', op: .7, cls: 'under-ink' },
        { o: 'stain', a: 'tl', x: 5, y: 26, w: 11, layer: 'back', op: .8, ink: false },
        { o: 'fingerprint', args: { seed: 9 }, a: 'br', x: 5, y: 16, w: 3.6, r: 20, op: .8 },
      ],
      texture: { seed: 21, torn: 'tr' },
    },
    {
      id: 'booze-bandit', no: 6, name: 'The Booze Bandit', collection: 'adults',
      frame: 'saloon', photoFrame: 'plain', layout: 'single',
      defaults: {
        kicker: 'By Order of the Haunted Sheriff', headline: 'WANTED', subhead: 'The Booze Bandit',
        crime: 'Stealing Drinks and Making Bad Decisions',
        reward: 'ONE FREE COCKTAIL', rewardNote: '',
        warning: 'Armed With Terrible Dance Moves', lastSeen: 'Lurking by the punch bowl',
        footer: 'Proceed at Your Own Risk',
      },
      flanks: { fw: 8, left: [{ o: 'bottle', w: 4.6, args: { label: 'XXX', sub: 'RYE WHISKEY' } }], right: [{ o: 'bottle', w: 4.6, args: { label: 'GIN', sub: 'BATHTUB GIN' } }, { o: 'cocktail', w: 5 }] },
      ornaments: [
        { o: 'splatter', args: { seed: 5 }, a: 'tl', x: 2, y: 20, w: 9, layer: 'back', op: .75, cls: 'under-ink' },
        { o: 'stain', a: 'br', x: 5, y: 22, w: 10, layer: 'back', op: .8, ink: false },
        { o: 'stain', args: { seed: 4 }, a: 'tr', x: 9, y: 25, w: 7, layer: 'back', op: .6, ink: false },
      ],
      stamps: [{ text: 'Last Call', cls: 'tpl', style: 'right:6%;top:31%;transform:rotate(12deg)' }],
      texture: { seed: 33 },
    },
    {
      id: 'party-phantom', no: 7, name: 'The Party Phantom', collection: 'adults',
      frame: 'gothic', photoFrame: 'cameo', layout: 'single', dark: true,
      defaults: {
        kicker: 'Notice to All Ghouls & Goblins', headline: 'WANTED', subhead: 'The Party Phantom',
        crime: 'Disappearing Without Saying Goodbye',
        reward: '$10,000', rewardNote: 'in ghost money',
        warning: 'Known to Ghost Everyone', lastSeen: 'Heading for the exit without saying goodbye',
        footer: 'Any Information Leading to Capture Will Be Rewarded',
      },
      flanks: { fw: 9, left: [{ o: 'candle', w: 3.6 }, { o: 'ghost', args: { silhouette: true }, w: 6, op: .55 }], right: [{ o: 'ghost', args: { silhouette: true }, w: 7, op: .55 }, { o: 'candle', w: 3.6 }] },
      ornaments: [
        { o: 'web', args: { spider: true }, a: 'tl', x: 2.2, y: 2.2, w: 13 },
        { o: 'web', a: 'tr', x: 2.2, y: 2.2, w: 11, flip: 'x' },
        { o: 'bat', a: 'tr', x: 4, y: 26, w: 4.6, r: 10, op: .85 },
        { o: 'bat', a: 'tl', x: 4, y: 30, w: 3.6, r: -14, op: .75 },
        { o: 'ghost', args: { silhouette: true }, a: 'bl', x: 4, y: 14, w: 7, op: .25, layer: 'back' },
        { o: 'splatter', args: { seed: 41 }, a: 'br', x: 3.5, y: 17, w: 7, layer: 'back', op: .65, cls: 'under-ink' },
      ],
      texture: { seed: 44, torn: 'bl', heavy: true },
    },
    {
      id: 'midnight-menace', no: 8, name: 'The Midnight Menace', collection: 'adults',
      frame: 'bulletin', photoFrame: 'mugshot', layout: 'single',
      defaults: {
        kicker: 'Haunted County Police Bulletin', headline: 'WANTED', subhead: 'The Midnight Menace',
        crime: 'Disturbing the Peace After Midnight',
        reward: 'ONE NIGHT OF UNINTERRUPTED SLEEP', rewardNote: '',
        warning: 'Extremely Loud and Questionably Dangerous', lastSeen: 'On the dance floor, unfortunately',
        footer: 'Report Sightings to the Haunted Sheriff',
      },
      flanks: { fw: 9, left: [{ o: 'clock', w: 7.5 }, { o: 'handcuffs', w: 7 }], right: [{ o: 'moon', w: 7 }, { o: 'bat', w: 6 }] },
      ornaments: [
        { o: 'splatter', args: { seed: 77, drips: 4 }, a: 'tl', x: 0, y: 2, w: 14, layer: 'back', op: .85, cls: 'under-ink' },
        { o: 'splatter', args: { seed: 12 }, a: 'br', x: 2.5, y: 15, w: 9, layer: 'back', op: .75, cls: 'under-ink' },
        { o: 'fingerprint', args: { seed: 5 }, a: 'bl', x: 3.6, y: 6, w: 3.4, r: -16, op: .85 },
        { o: 'fingerprint', args: { seed: 6 }, a: 'bl', x: 6.6, y: 5, w: 3.2, r: 12, op: .7 },
      ],
      cautionCorners: true,
      texture: { seed: 55, torn: 'tr' },
    },

    /* ------------------------------------------------ SPECIAL EDITION */
    {
      id: 'partners-in-crime', no: 9, name: 'Partners in Crime', collection: 'special',
      frame: 'ornate', photoFrame: 'ornate', layout: 'pair', suspects: 2,
      defaults: {
        kicker: SHERIFF, headline: 'WANTED', subhead: 'Partners in Crime',
        crime: 'Conspiring to Steal All the Halloween Candy',
        reward: '$25,000', rewardNote: 'for both suspects',
        warning: 'Do Not Approach', lastSeen: 'Fleeing the pumpkin patch',
        footer: 'Any Information Leading to Capture Will Be Rewarded',
      },
      pairLink: { o: 'handcuffs' },
      ornaments: [
        { o: 'bat', a: 'tl', x: 3.6, y: 17.2, w: 4.6, r: -14 },
        { o: 'bat', a: 'tr', x: 3.6, y: 17.2, w: 4.6, r: 14 },
        { o: 'splatter', args: { seed: 91 }, a: 'tr', x: 3, y: 18, w: 8, layer: 'back', op: .6, cls: 'under-ink' },
        { o: 'stain', a: 'bl', x: 10, y: 22, w: 9, layer: 'back', op: .7, ink: false },
      ],
      bannerReward: true,
      rewardFlanks: { left: { o: 'badge', w: 6.4, r: -10 }, right: { o: 'seal', args: { ribbon: true, emblem: 'skull' }, w: 5.6, r: 8 } },
      texture: { seed: 66 },
    },
    {
      id: 'most-wanted-family', no: 10, name: 'The Most Wanted Family', collection: 'special',
      frame: 'ornate', photoFrame: 'ornate', layout: 'family', suspects: 4, minSuspects: 2, maxSuspects: 6,
      defaults: {
        kicker: "The Haunted County's", headline: 'MOST WANTED', subhead: '', familyName: 'The [Family Name] Family',
        crime: 'Organized Halloween Mischief',
        reward: 'ONE MILLION PIECES OF CANDY', rewardNote: '',
        warning: 'Considered Dangerous', lastSeen: 'Operating out of the haunted house on the hill',
        footer: 'Report Sightings to the Haunted Sheriff',
      },
      ornaments: [
        { o: 'web', args: { spider: true }, a: 'tl', x: 2.2, y: 2.2, w: 10, op: .9 },
        { o: 'web', a: 'tr', x: 2.2, y: 2.2, w: 10, flip: 'x', op: .9 },
        { o: 'tombstone', a: 'bl', x: 3, y: 2.6, w: 5.6, r: -4 },
        { o: 'tombstone', args: { text: 'BOO' }, a: 'br', x: 3, y: 2.6, w: 5, r: 5 },
      ],
      bannerReward: true,
      rewardFlanks: { left: { o: 'badge', w: 5.6, r: -12 }, right: { o: 'seal', args: { ribbon: true, emblem: 'bat' }, w: 5, r: 10 } },
      texture: { seed: 99, torn: 'tl' },
    },
  ];

  const Templates = {
    list: T,
    byId: Object.fromEntries(T.map((t) => [t.id, t])),
    collections: [
      { id: 'kids', name: "Children's Collection" },
      { id: 'adults', name: 'Adult Collection' },
      { id: 'special', name: 'Special Edition' },
    ],
    sizes: {
      letter: { w: 8.5, h: 11, label: 'US Letter 8.5 × 11 in' },
      tabloid: { w: 11, h: 17, label: 'Tabloid 11 × 17 in' },
      poster: { w: 18, h: 24, label: 'Large Poster 18 × 24 in' },
    },
    modes: { full: 'Full color', sepia: 'Sepia / vintage', ink: 'Ink-saving B&W' },
    // Fields every guest can edit; required ones show [PLACEHOLDER] when empty.
    placeholders: {
      name: '[INSERT GUEST NAME]', crime: '[ENTER CRIME]', reward: '[ENTER REWARD]',
      warning: '[ENTER WARNING]', headline: '[HEADLINE]', familyName: '[FAMILY NAME]',
    },
  };

  global.Templates = Templates;
})(typeof window !== 'undefined' ? window : globalThis);
