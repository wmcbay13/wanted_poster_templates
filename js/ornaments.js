/*
 * Ornament library: every decoration is an inline SVG string.
 * Colors come from CSS custom properties (see css/design-system.css), so the
 * same artwork re-colors itself for full-color, sepia, and ink-saver modes.
 */
(function (global) {
  'use strict';

  // Deterministic RNG so procedural art (splatters, fingerprints) is stable per seed.
  function rng(seed) {
    let a = (seed * 2654435761) >>> 0 || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let uid = 0;
  const nextId = (p) => `${p}-${++uid}`;

  // style helper: fill token, stroke token, stroke width
  function st(fill, stroke, w) {
    let s = fill ? `fill:var(--o-${fill})` : 'fill:none';
    if (stroke) s += `;stroke:var(--o-${stroke});stroke-width:${w || 2};stroke-linejoin:round;stroke-linecap:round`;
    return `style="${s}"`;
  }

  const svg = (vb, body, cls) =>
    `<svg class="orn ${cls || ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  // Smooth closed path through polar points.
  function blobPath(cx, cy, pts) {
    const p = pts.map(([a, r]) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    const mid = (i) => {
      const a = p[i % p.length], b = p[(i + 1) % p.length];
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    };
    let d = `M${mid(0)[0].toFixed(1)} ${mid(0)[1].toFixed(1)}`;
    for (let i = 1; i <= p.length; i++) {
      const c = p[i % p.length], m = mid(i);
      d += ` Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  const O = {};

  O.bat = (o = {}) => {
    const eyes = o.cute
      ? `<circle cx="47.5" cy="41" r="1.8" fill="#fff"/><circle cx="52.5" cy="41" r="1.8" fill="#fff"/>
         <circle cx="47.8" cy="41.3" r=".8" fill="#111"/><circle cx="52.8" cy="41.3" r=".8" fill="#111"/>`
      : '';
    const s = o.cute ? st('dark', 'stroke', 1.2) : `${st('dark', 'sil-stroke', 1.2)}`;
    return svg('0 20 100 45', `
      <path ${s} d="M50 34 L46.5 28 L46 35.5 C41 31 25 27 4 35 C12 37 15.5 42 15.5 48 C21 44 27 45 30.5 51 C33.5 46 39 45.5 43.5 50 L50 57 L56.5 50 C61 45.5 66.5 46 69.5 51 C73 45 79 44 84.5 48 C84.5 42 88 37 96 35 C75 27 59 31 54 35.5 L53.5 28 Z"/>
      ${eyes}`, 'bat');
  };

  O.pumpkin = (o = {}) => {
    const face = o.face === false ? '' : `
      <path ${st('face', 'stroke', 1.4)} d="M29 50 L41 50 L35 39 Z M59 50 L71 50 L65 39 Z M47 59 L53 59 L50 54 Z
        M25 64 Q50 86 75 64 L69 67.5 L65 73 L59 69 L50 77 L41 69 L35 73 L31 67.5 Z"/>`;
    return svg('0 0 100 100', `
      <path ${st('green', 'stroke', 2)} d="M46 26 C45 16 49 9 57 8 L58 13 C53 14 52 19 54 26 Z"/>
      <path ${st('orange', 'stroke', 2.4)} d="M50 24 C30 18 8 30 8 58 C8 84 30 94 50 90 C70 94 92 84 92 58 C92 30 70 18 50 24 Z"/>
      <path ${st(null, 'orange-2', 1.6)} style="opacity:.55" d="M50 26 C41 30 37 44 37 58 C37 74 41 86 50 90 M50 26 C59 30 63 44 63 58 C63 74 59 86 50 90"/>
      ${face}`, 'pumpkin');
  };

  O.ghost = (o = {}) => {
    const sil = o.silhouette;
    const body = sil ? st('dark', 'sil-stroke', 1.4) : st('light', 'stroke', 2.2);
    const face = sil
      ? `<ellipse cx="42" cy="40" rx="3.5" ry="5.5" style="fill:var(--o-light);opacity:.75"/><ellipse cx="58" cy="40" rx="3.5" ry="5.5" style="fill:var(--o-light);opacity:.75"/>`
      : `<ellipse cx="42" cy="40" rx="4" ry="6" ${st('dark', 'stroke', 1)}/><ellipse cx="58" cy="40" rx="4" ry="6" ${st('dark', 'stroke', 1)}/>
         <ellipse cx="50" cy="54" rx="${o.boo ? 6 : 3.5}" ry="${o.boo ? 7 : 4}" ${st('dark', 'stroke', 1)}/>
         ${o.cute ? `<ellipse cx="35" cy="49" rx="4" ry="2.4" style="fill:#e79a9a;opacity:.6"/><ellipse cx="65" cy="49" rx="4" ry="2.4" style="fill:#e79a9a;opacity:.6"/>` : ''}`;
    return svg('0 0 100 100', `
      <path ${body} d="M24 92 L26 46 C26 16 74 16 74 46 L76 92 Q71 84 65 91 Q59 83 52 91 Q45 83 38 91 Q31 84 24 92 Z
        M27 52 C18 52 14 60 12 66 C18 62 22 62 27 63 M73 52 C82 52 86 60 88 66 C82 62 78 62 73 63"/>
      ${face}`, 'ghost');
  };

  O.skull = () => svg('0 0 100 100', `
    <path ${st('bone', 'stroke', 2.4)} d="M50 10 C27 10 16 27 18 46 C19 56 24 61 30 63 L30 75 C30 79 34 82 38 82 L62 82 C66 82 70 79 70 75 L70 63 C76 61 81 56 82 46 C84 27 73 10 50 10 Z"/>
    <ellipse cx="37" cy="45" rx="9" ry="10" ${st('dark', 'stroke', 1)}/><ellipse cx="63" cy="45" rx="9" ry="10" ${st('dark', 'stroke', 1)}/>
    <path ${st('dark', 'stroke', 1)} d="M50 54 L45 65 L55 65 Z"/>
    <path ${st(null, 'stroke', 2)} d="M36 72 L64 72 M42 70 L42 82 M50 70 L50 82 M58 70 L58 82"/>`, 'skull');

  O.crossbones = () => svg('0 0 100 100', `
    <g ${st('bone', 'stroke', 2)}>
      <path d="M18 18 a7 7 0 1 1 9 -2 L84 73 a7 7 0 1 1 -2 9 L25 25 a7 7 0 1 1 -7 -7Z"/>
      <path d="M82 18 a7 7 0 1 0 -9 -2 L16 73 a7 7 0 1 0 2 9 L75 25 a7 7 0 1 0 7 -7Z"/>
    </g>`, 'crossbones');

  O.tombstone = (o = {}) => svg('0 0 100 100', `
    <path ${st('gray', 'stroke', 2.4)} d="M24 90 L24 40 C24 14 76 14 76 40 L76 90 Z"/>
    <path ${st(null, 'gray-2', 1.6)} d="M30 88 L30 41 C30 22 70 22 70 41 L70 88"/>
    <text x="50" y="52" text-anchor="middle" style="font-family:Rye,serif;font-size:15px;fill:var(--o-gray-2)">${o.text || 'R.I.P'}</text>
    <path ${st(null, 'gray-2', 1.4)} d="M62 30 L58 38 L63 44 L59 52"/>
    <path ${st('green', 'stroke', 1.6)} d="M12 92 L18 84 L21 91 L26 82 L30 91 L35 84 L39 91 L44 83 L48 91 L53 84 L57 91 L62 82 L66 91 L71 84 L75 91 L80 83 L84 91 L88 85 L90 92 Z"/>`, 'tombstone');

  O.web = (o = {}) => {
    // Corner spiderweb anchored at top-left (0,0); flip with CSS transforms.
    const spokes = 7, rings = [14, 28, 44, 62, 82];
    let d = '';
    const ang = (i) => (i / (spokes - 1)) * (Math.PI / 2);
    for (let i = 0; i < spokes; i++) d += `M0 0 L${(Math.cos(ang(i)) * 100).toFixed(1)} ${(Math.sin(ang(i)) * 100).toFixed(1)} `;
    rings.forEach((r) => {
      for (let i = 0; i < spokes - 1; i++) {
        const a0 = ang(i), a1 = ang(i + 1), am = (a0 + a1) / 2, sag = r * 0.82;
        d += `M${(Math.cos(a0) * r).toFixed(1)} ${(Math.sin(a0) * r).toFixed(1)} Q${(Math.cos(am) * sag).toFixed(1)} ${(Math.sin(am) * sag).toFixed(1)} ${(Math.cos(a1) * r).toFixed(1)} ${(Math.sin(a1) * r).toFixed(1)} `;
      }
    });
    const spider = o.spider
      ? `<path ${st(null, 'web', .8)} d="M58 52 L58 74"/>
         <g ${st(null, 'dark', 1.6)}><path d="M58 78 l-9 -6 l-3 -6 M58 78 l9 -6 l3 -6 M58 80 l-10 0 l-4 -4 M58 80 l10 0 l4 -4 M58 82 l-9 5 l-2 6 M58 82 l9 5 l2 6 M58 84 l-6 7 l0 5 M58 84 l6 7 l0 5"/></g>
         <ellipse cx="58" cy="82" rx="5" ry="6.5" ${st('dark', 'stroke', 1)}/><circle cx="58" cy="75.5" r="3.2" ${st('dark', 'stroke', 1)}/>`
      : '';
    return svg('0 0 100 100', `<path ${st(null, 'web', 1)} d="${d}"/>${spider}`, 'web');
  };

  O.spider = () => svg('0 0 60 100', `
    <path ${st(null, 'web', .8)} d="M30 0 L30 62"/>
    <g ${st(null, 'dark', 1.8)}><path d="M30 70 l-12 -8 l-4 -8 M30 70 l12 -8 l4 -8 M30 72 l-14 0 l-5 -5 M30 72 l14 0 l5 -5 M30 75 l-12 6 l-3 8 M30 75 l12 6 l3 8 M30 77 l-8 9 l0 7 M30 77 l8 9 l0 7"/></g>
    <ellipse cx="30" cy="75" rx="7" ry="9" ${st('dark', 'stroke', 1)}/><circle cx="30" cy="65" r="4.5" ${st('dark', 'stroke', 1)}/>`, 'spider');

  O.splatter = (o = {}) => {
    const r = rng(o.seed || 7);
    const R = 22;
    const pts = [];
    const n = 26;
    for (let i = 0; i < n; i++) {
      const spike = r() < 0.28;
      pts.push([(i / n) * Math.PI * 2, R * (0.72 + r() * 0.32) * (spike ? 1.35 + r() * 0.5 : 1)]);
    }
    let body = `<path d="${blobPath(50, 50, pts)}"/>`;
    for (let i = 0; i < 22; i++) {
      const a = r() * Math.PI * 2, d = R * (1.15 + r() * 1.05), s = 0.6 + r() * 3.6 * (1 - (d - R) / (R * 1.6));
      body += `<circle cx="${(50 + Math.cos(a) * d).toFixed(1)}" cy="${(50 + Math.sin(a) * d).toFixed(1)}" r="${Math.max(s, .5).toFixed(1)}"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = r() * Math.PI * 2, d0 = R * 0.9, d1 = R * (1.5 + r() * 0.7), w = 1 + r() * 2;
      const x0 = 50 + Math.cos(a) * d0, y0 = 50 + Math.sin(a) * d0, x1 = 50 + Math.cos(a) * d1, y1 = 50 + Math.sin(a) * d1;
      body += `<path d="M${(x0 - Math.sin(a) * w).toFixed(1)} ${(y0 + Math.cos(a) * w).toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)} L${(x0 + Math.sin(a) * w).toFixed(1)} ${(y0 - Math.cos(a) * w).toFixed(1)}Z"/><circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="${(w * 0.9).toFixed(1)}"/>`;
    }
    if (o.drips) {
      for (let i = 0; i < o.drips; i++) {
        const x = 38 + r() * 24, len = 14 + r() * 26, w = 1.6 + r() * 1.8;
        body += `<path d="M${(x - w).toFixed(1)} 58 L${(x - w * 0.7).toFixed(1)} ${(58 + len).toFixed(1)} A${w.toFixed(1)} ${w.toFixed(1)} 0 0 0 ${(x + w * 0.7).toFixed(1)} ${(58 + len).toFixed(1)} L${(x + w).toFixed(1)} 58Z"/>`;
      }
    }
    return svg('0 0 100 100', `<g style="fill:var(--o-${o.color || 'red'})">${body}</g>`, 'splatter');
  };

  O.fingerprint = (o = {}) => {
    const r = rng(o.seed || 3);
    const id = nextId('fp');
    let d = '';
    for (let k = 1; k <= 13; k++) {
      const rx = 2 + k * 3.1, ry = 3 + k * 3.9, cy = 50 + k * 0.6;
      const a0 = Math.PI * (0.85 + r() * 0.15), a1 = a0 + Math.PI * (1.25 + r() * 0.35);
      const seg = 3 + Math.floor(r() * 3);
      for (let s = 0; s < seg; s++) {
        const t0 = a0 + ((a1 - a0) * s) / seg + 0.06, t1 = a0 + ((a1 - a0) * (s + 1)) / seg - 0.05 - r() * 0.12;
        const x0 = 50 + Math.cos(t0) * rx, y0 = cy + Math.sin(t0) * ry, x1 = 50 + Math.cos(t1) * rx, y1 = cy + Math.sin(t1) * ry;
        d += `M${x0.toFixed(1)} ${y0.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} `;
      }
    }
    return svg('0 0 100 100', `
      <defs><clipPath id="${id}"><ellipse cx="50" cy="52" rx="34" ry="44"/></clipPath></defs>
      <g clip-path="url(#${id})"><path style="fill:none;stroke:var(--o-${o.color || 'red'});stroke-width:2.1;stroke-linecap:round" d="${d}"/></g>`, 'fingerprint');
  };

  O.badge = (o = {}) => {
    const id = nextId('bp');
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 6, rr = i % 2 ? 25 : 46;
      pts.push(`${(50 + Math.cos(a) * rr).toFixed(1)},${(50 + Math.sin(a) * rr).toFixed(1)}`);
    }
    let balls = '';
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      balls += `<circle cx="${(50 + Math.cos(a) * 46).toFixed(1)}" cy="${(50 + Math.sin(a) * 46).toFixed(1)}" r="5" ${st('gold', 'stroke', 1.6)}/>`;
    }
    return svg('0 0 100 100', `
      <polygon points="${pts.join(' ')}" ${st('gold', 'stroke', 2)}/>${balls}
      <circle cx="50" cy="50" r="20" ${st('gold-2', 'stroke', 1.6)}/>
      <circle cx="50" cy="50" r="15.5" ${st(null, 'stroke', .8)}/>
      <defs><path id="${id}" d="M33 50 A17 17 0 0 1 67 50"/></defs>
      <text style="font-family:Rye,serif;font-size:6.4px;fill:var(--o-stroke);letter-spacing:.4px"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${o.top || 'SHERIFF'}</textPath></text>
      <text x="50" y="57" text-anchor="middle" style="font-family:Rye,serif;font-size:13px;fill:var(--o-stroke)">${o.center || '★'}</text>
      <text x="50" y="65" text-anchor="middle" style="font-family:Rye,serif;font-size:4.6px;fill:var(--o-stroke)">${o.bottom || 'HAUNTED CO.'}</text>`, 'badge');
  };

  O.seal = (o = {}) => {
    const r = rng(o.seed || 11);
    const pts = [];
    for (let i = 0; i < 30; i++) pts.push([(i / 30) * Math.PI * 2, 40 + r() * 6 + (i % 3 === 0 ? 3 : 0)]);
    const ribbon = o.ribbon
      ? `<path ${st('wax-2', 'stroke', 1.2)} d="M36 74 L24 112 L32 106 L38 116 L46 80 Z M64 74 L76 112 L68 106 L62 116 L54 80 Z"/>`
      : '';
    const emblem = {
      skull: O.skull().replace(/^<svg[^>]*>|<\/svg>$/g, ''),
      bat: O.bat().replace(/^<svg[^>]*>|<\/svg>$/g, ''),
    }[o.emblem || 'skull'];
    const ev = o.emblem === 'bat' ? 'translate(26 30) scale(.48 .9)' : 'translate(30 29) scale(.4)';
    return svg('0 0 100 120', `${ribbon}
      <path d="${blobPath(50, 52, pts)}" ${st('wax', 'stroke', 1.2)}/>
      <circle cx="50" cy="52" r="30" ${st('wax-2', 'wax-hi', 2)}/>
      <circle cx="50" cy="52" r="25" ${st(null, 'wax-hi', 1)} stroke-dasharray="2 2"/>
      <g transform="${ev}" class="seal-emblem">${emblem}</g>
      <path ${st(null, 'wax-hi', 2.5)} d="M24 36 A32 32 0 0 1 40 22" style="fill:none;stroke:var(--o-wax-hi);stroke-width:2.5;opacity:.6;stroke-linecap:round"/>`, 'seal');
  };

  O.candy = (o = {}) => {
    const c = o.color || 'orange';
    return svg('0 0 120 60', `
      <path ${st(c === 'orange' ? 'purple' : 'orange', 'stroke', 2)} d="M30 30 L6 14 L12 30 L6 46 Z M90 30 L114 14 L108 30 L114 46 Z"/>
      <ellipse cx="60" cy="30" rx="32" ry="20" ${st(c, 'stroke', 2.2)}/>
      <path style="fill:none;stroke:var(--o-light);stroke-width:5;opacity:.85" d="M42 14 Q52 30 42 46 M60 10 Q70 30 60 50 M78 14 Q88 30 78 46"/>
      <ellipse cx="60" cy="30" rx="32" ry="20" ${st(null, 'stroke', 2.2)}/>`, 'candy');
  };

  O.candycorn = () => svg('0 0 60 70', `
    <path ${st('yellow')} d="M8 60 Q30 70 52 60 L46 46 Q30 52 14 46 Z"/>
    <path ${st('orange')} d="M14 46 Q30 52 46 46 L37 24 Q30 27 23 24 Z"/>
    <path ${st('light')} d="M23 24 Q30 27 37 24 L32 8 Q30 4 28 8 Z"/>
    <path ${st(null, 'stroke', 2)} d="M8 60 Q30 70 52 60 L32 8 Q30 4 28 8 Z"/>`, 'candycorn');

  O.lollipop = () => {
    let d = 'M30 30';
    for (let t = 0; t <= Math.PI * 7; t += 0.2) d += ` L${(30 + Math.cos(t) * t * 1.05).toFixed(1)} ${(30 + Math.sin(t) * t * 1.05).toFixed(1)}`;
    return svg('0 0 60 100', `
      <rect x="28" y="50" width="4" height="46" rx="2" ${st('light', 'stroke', 1.6)}/>
      <circle cx="30" cy="30" r="24" ${st('purple', 'stroke', 2)}/>
      <path style="fill:none;stroke:var(--o-light);stroke-width:3.4;stroke-linecap:round;opacity:.9" d="${d}"/>
      <circle cx="30" cy="30" r="24" ${st(null, 'stroke', 2)}/>`, 'lollipop');
  };

  O.cookie = (o = {}) => {
    const id = nextId('ck');
    const r = rng(o.seed || 5);
    let chips = '';
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, d = r() * 30;
      chips += `<path d="${blobPath(50 + Math.cos(a) * d, 52 + Math.sin(a) * d, [0, 1, 2, 3, 4].map((k) => [k * 1.25, 3 + r() * 2.2]))}" ${st('choc', 'stroke', .6)}/>`;
    }
    const bite = o.bite === false ? '' : '<circle cx="88" cy="22" r="13" fill="#000"/><circle cx="92" cy="40" r="10" fill="#000"/><circle cx="74" cy="12" r="9" fill="#000"/>';
    return svg('0 0 100 100', `
      <defs><mask id="${id}"><rect width="100" height="100" fill="#fff"/>${bite}</mask></defs>
      <g mask="url(#${id})"><circle cx="50" cy="52" r="42" ${st('cookie', 'stroke', 2.4)}/>
      <circle cx="50" cy="52" r="36" ${st(null, 'cookie-2', 1.4)} style="fill:none;stroke:var(--o-cookie-2);stroke-width:1.4;stroke-dasharray:3 5"/>${chips}</g>`, 'cookie');
  };

  O.crumbs = (o = {}) => {
    const r = rng(o.seed || 9);
    let b = '';
    for (let i = 0; i < 14; i++) {
      const x = 8 + r() * 84, y = 8 + r() * 84;
      b += `<path d="${blobPath(x, y, [0, 1, 2, 3].map((k) => [k * 1.57 + r(), 1 + r() * 2.6]))}" ${st('cookie', 'stroke', .6)}/>`;
    }
    return svg('0 0 100 100', b, 'crumbs');
  };

  O.bottle = (o = {}) => svg('0 0 50 130', `
    <rect x="19" y="2" width="12" height="10" rx="2" ${st('cork', 'stroke', 1.6)}/>
    <path ${st('amber', 'stroke', 2)} d="M19 12 L31 12 L31 34 C31 42 44 46 44 58 L44 122 C44 126 41 128 37 128 L13 128 C9 128 6 126 6 122 L6 58 C6 46 19 42 19 34 Z"/>
    <path style="fill:none;stroke:var(--o-light);stroke-width:2.5;opacity:.45;stroke-linecap:round" d="M11 64 L11 118"/>
    <rect x="8" y="70" width="34" height="34" ${st('label', 'stroke', 1.4)}/>
    <text x="25" y="86" text-anchor="middle" style="font-family:Rye,serif;font-size:10px;fill:var(--o-stroke)">${o.label || 'XXX'}</text>
    <text x="25" y="97" text-anchor="middle" style="font-family:'Old Standard TT',serif;font-size:5px;fill:var(--o-stroke)">${o.sub || 'RYE WHISKEY'}</text>`, 'bottle');

  O.cocktail = () => svg('0 0 80 100', `
    <path ${st('glass', 'stroke', 2)} d="M8 12 L72 12 L40 52 Z"/>
    <path ${st('red')} d="M16 20 L64 20 L40 49 Z" style="fill:var(--o-red);opacity:.75"/>
    <path ${st(null, 'stroke', 2.4)} d="M40 52 L40 88 M24 92 Q40 86 56 92"/>
    <path ${st(null, 'stroke', 1.6)} d="M48 4 L32 34"/><circle cx="34" cy="30" r="5" ${st('green', 'stroke', 1.4)}/>`, 'cocktail');

  O.coffee = () => svg('0 0 100 100', `
    <path style="fill:none;stroke:var(--o-gray);stroke-width:2.5;stroke-linecap:round;opacity:.8" d="M38 30 C30 22 46 18 38 8 M52 30 C44 22 60 18 52 8 M66 30 C58 22 74 18 66 8"/>
    <path ${st('light', 'stroke', 2.4)} d="M22 36 L82 36 L76 84 C76 88 72 92 68 92 L36 92 C32 92 28 88 28 84 Z"/>
    <path ${st(null, 'stroke', 2.4)} d="M80 48 C96 48 96 72 76 74"/>
    <ellipse cx="52" cy="38" rx="28" ry="4" ${st('choc', 'stroke', .6)}/>`, 'coffee');

  O.zzz = () => svg('0 0 100 80', `
    <text x="6" y="72" style="font-family:Rye,serif;font-size:40px;fill:var(--o-ink-2)">Z</text>
    <text x="42" y="46" style="font-family:Rye,serif;font-size:28px;fill:var(--o-ink-2)">z</text>
    <text x="70" y="24" style="font-family:Rye,serif;font-size:20px;fill:var(--o-ink-2)">z</text>`, 'zzz');

  O.clock = () => {
    let ticks = '';
    const numerals = ['XII', 'III', 'VI', 'IX'];
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 - Math.PI / 2;
      ticks += `<path d="M${(50 + Math.cos(a) * 33).toFixed(1)} ${(54 + Math.sin(a) * 33).toFixed(1)} L${(50 + Math.cos(a) * 37).toFixed(1)} ${(54 + Math.sin(a) * 37).toFixed(1)}"/>`;
    }
    const nums = numerals.map((n, i) => {
      const a = (i * Math.PI) / 2 - Math.PI / 2;
      return `<text x="${(50 + Math.cos(a) * 27).toFixed(1)}" y="${(54 + Math.sin(a) * 27 + 3).toFixed(1)}" text-anchor="middle" style="font-family:'Old Standard TT',serif;font-weight:700;font-size:8px;fill:var(--o-stroke)">${n}</text>`;
    }).join('');
    return svg('0 0 100 100', `
      <circle cx="50" cy="8" r="5" ${st(null, 'stroke', 2.4)}/><rect x="45" y="11" width="10" height="5" ${st('gold', 'stroke', 1.6)}/>
      <circle cx="50" cy="54" r="42" ${st('gold', 'stroke', 2.4)}/>
      <circle cx="50" cy="54" r="38" ${st('light', 'stroke', 1.6)}/>
      <g ${st(null, 'stroke', 1.6)}>${ticks}</g>${nums}
      <path ${st(null, 'stroke', 3)} d="M50 54 L50 26 M50 54 L51 34"/><circle cx="50" cy="54" r="3" ${st('stroke')}/>`, 'clock');
  };

  O.moon = () => svg('0 0 100 100', `
    <path ${st('moon', 'stroke', 1.8)} d="M62 8 A44 44 0 1 0 92 70 A36 36 0 1 1 62 8 Z"/>
    <circle cx="36" cy="58" r="4" style="fill:var(--o-moon-2)"/><circle cx="28" cy="40" r="2.5" style="fill:var(--o-moon-2)"/><circle cx="46" cy="78" r="3" style="fill:var(--o-moon-2)"/>`, 'moon');

  O.monster = (o = {}) => {
    const c = o.color || 'green';
    return svg('0 0 100 100', `
      <path ${st(c, 'stroke', 2.4)} d="M30 30 L24 10 L40 24 Z M70 30 L76 10 L60 24 Z"/>
      <path ${st(c, 'stroke', 2.4)} d="M50 18 C80 18 92 40 92 64 C92 84 76 94 50 94 C24 94 8 84 8 64 C8 40 20 18 50 18 Z"/>
      <circle cx="36" cy="50" r="12" ${st('light', 'stroke', 2)}/><circle cx="66" cy="48" r="14" ${st('light', 'stroke', 2)}/>
      <circle cx="${o.lookLeft ? 32 : 40}" cy="54" r="5.5" ${st('dark', 'stroke', 1)}/><circle cx="${o.lookLeft ? 61 : 71}" cy="53" r="6.5" ${st('dark', 'stroke', 1)}/>
      <path ${st('dark', 'stroke', 2)} d="M30 70 Q50 86 72 70 Q50 76 30 70 Z"/>
      <path ${st('light', 'stroke', 1.2)} d="M38 73 L41 79 L44 74.5 Z M58 74.5 L61 79 L64 73 Z"/>`, 'monster');
  };

  O.eye = (o = {}) => svg('0 0 50 50', `
    <circle cx="25" cy="25" r="21" ${st('light', 'stroke', 2.4)}/>
    <circle cx="${25 + (o.dx || 5)}" cy="${25 + (o.dy || 5)}" r="10" ${st('dark', 'stroke', 1)}/>
    <circle cx="${21 + (o.dx || 5)}" cy="${21 + (o.dy || 5)}" r="2.8" fill="#fff"/>`, 'eye');

  O.star = () => svg('0 0 100 100', `<path ${st('gold', 'stroke', 2)} d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z"/>`, 'star');

  O.corner = () => svg('0 0 100 100', `
    <path ${st(null, 'frame', 3)} d="M4 98 L4 4 L98 4"/>
    <path ${st(null, 'frame', 1.4)} d="M11 98 L11 11 L98 11"/>
    <path ${st(null, 'frame', 2)} d="M20 62 C20 32 32 20 62 20 C76 20 78 34 68 36 C62 37 60 30 65 29 M20 62 C20 76 34 78 36 68 C37 62 30 60 29 65"/>
    <path ${st('frame')} d="M27 19 L35 27 L27 35 L19 27 Z"/>
    <circle cx="11" cy="11" r="5" ${st('frame')}/>`, 'corner');

  O.flourish = () => svg('0 0 200 30', `
    <path ${st(null, 'frame', 1.8)} d="M4 15 L70 15 M130 15 L196 15 M70 15 C80 15 82 4 92 6 C100 8 96 18 90 16 M130 15 C120 15 118 26 108 24 C100 22 104 12 110 14"/>
    <path ${st('frame')} d="M100 7 L107 15 L100 23 L93 15 Z"/><circle cx="4" cy="15" r="3" ${st('frame')}/><circle cx="196" cy="15" r="3" ${st('frame')}/>`, 'flourish');

  O.rope = () => svg('0 0 100 10', `<path ${st(null, 'frame', 2)} d="M0 5 ${Array.from({ length: 25 }, (_, i) => `q2 -5 4 0`).join(' ')}"/>`, 'rope');

  O.handcuffs = () => svg('0 0 120 70', `
    <g ${st(null, 'metal', 5)}><circle cx="30" cy="38" r="20"/><circle cx="90" cy="38" r="20"/></g>
    <g ${st(null, 'stroke', 1.4)}><circle cx="30" cy="38" r="22.5"/><circle cx="30" cy="38" r="17.5"/><circle cx="90" cy="38" r="22.5"/><circle cx="90" cy="38" r="17.5"/></g>
    <path ${st(null, 'metal', 3)} d="M50 30 q5 -6 10 0 q5 6 10 0"/>
    <rect x="14" y="10" width="14" height="10" rx="2" ${st('metal', 'stroke', 1.4)}/><rect x="92" y="10" width="14" height="10" rx="2" ${st('metal', 'stroke', 1.4)}/>`, 'handcuffs');

  O.cat = () => svg('0 0 100 100', `
    <path ${st('dark', 'sil-stroke', 1.4)} d="M30 96 C24 70 26 52 36 42 L32 22 L42 32 C46 30 54 30 58 32 L68 22 L64 42 C74 52 76 70 70 96 Z M70 92 C86 92 92 80 88 66 C86 60 80 62 82 68 C84 76 80 84 70 84 Z"/>
    <ellipse cx="44" cy="44" rx="3" ry="4" style="fill:var(--o-yellow)"/><ellipse cx="56" cy="44" rx="3" ry="4" style="fill:var(--o-yellow)"/>`, 'cat');

  O.candle = () => svg('0 0 40 100', `
    <path style="fill:var(--o-yellow)" d="M20 6 C26 16 26 24 20 28 C14 24 14 16 20 6 Z"/>
    <path ${st(null, 'stroke', 1.4)} d="M20 28 L20 34"/>
    <path ${st('light', 'stroke', 2)} d="M10 34 L30 34 L30 90 L10 90 Z M10 34 C10 42 14 44 14 50 C14 44 18 40 20 36"/>
    <path ${st('gold', 'stroke', 2)} d="M4 90 L36 90 L32 96 L8 96 Z"/>`, 'candle');

  O.stain = (o = {}) => {
    // Coffee ring
    const r = rng(o.seed || 21);
    const pts = [];
    for (let i = 0; i < 40; i++) pts.push([(i / 40) * Math.PI * 2, 40 + r() * 3]);
    const pts2 = pts.map(([a, rr]) => [a, rr - 3 - r() * 2]);
    return svg('0 0 100 100', `
      <path d="${blobPath(50, 50, pts)}" style="fill:var(--stain-fill);stroke:var(--stain);stroke-width:2.6"/>
      <path d="${blobPath(50, 50, pts2)}" style="fill:none;stroke:var(--stain);stroke-width:1.2;opacity:.6"/>`, 'stain');
  };

  O.tape = () => svg('0 0 100 30', `<path d="M3 4 L97 1 L95 27 L5 29 Z M3 4 L1 8 L4 12 L2 17 L4 22 L2 27 L5 29 M97 1 L99 6 L96 11 L99 16 L96 21 L98 26 L95 27" style="fill:var(--o-tape);stroke:none"/>`, 'tape');

  O.list = Object.keys(O).filter((k) => typeof O[k] === 'function' && k !== 'list');
  global.Ornaments = O;
  global.OrnamentUtil = { rng, blobPath };
})(typeof window !== 'undefined' ? window : globalThis);
