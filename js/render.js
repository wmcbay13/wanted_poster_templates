/*
 * Poster renderer shared by the editor, the print path and scripts/render.mjs.
 *
 *   const el = PosterRenderer.render(state);   // build DOM
 *   container.appendChild(el);
 *   await PosterRenderer.fit(el);               // size text + photos to the page
 *
 * state = {
 *   template: 'candy-bandit', size: 'letter' | 'tabloid' | 'poster',
 *   mode: 'full' | 'sepia' | 'ink',
 *   fields: { kicker, headline, subhead, familyName, crime, reward, rewardNote,
 *             warning, lastSeen, footer, caseNo, sheriff, partyDate, partyLocation },
 *   suspects: [{ name, alias, photo: { kind: 'upload' | 'portrait' | 'none', src, id, zoom, x, y } }],
 *   enh: { captured, escaped, doNotApproach, lastSeenLabel, caseNo, signature, partyInfo },
 *   photoVintage: true, guides: false
 * }
 * A field left undefined falls back to the template default. An empty string
 * shows a [PLACEHOLDER] for a required field and hides an optional one.
 */
(function (global) {
  'use strict';

  const { Templates, Ornaments, Portraits, OrnamentUtil } = global;
  const DPI = 96;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const u = (n) => `calc(${n} * var(--u))`;

  function fieldsFor(tpl, state) {
    const f = { caseNo: '', sheriff: 'Sheriff Ichabod Graves', partyDate: '', partyLocation: '', ...tpl.defaults };
    const given = state.fields || {};
    for (const k of Object.keys(given)) if (given[k] !== undefined && given[k] !== null) f[k] = given[k];
    return f;
  }

  function suspectsFor(tpl, state) {
    const n = tpl.layout === 'single' ? 1 : tpl.layout === 'pair' ? 2
      : Math.max(tpl.minSuspects || 2, Math.min(tpl.maxSuspects || 6, (state.suspects || []).length || tpl.suspects));
    const out = [];
    for (let i = 0; i < n; i++) out.push({ name: '', alias: '', ...((state.suspects || [])[i] || {}) });
    return out;
  }

  const txt = (v, key) => (v ? esc(v) : Templates.placeholders[key] ? `<span class="ph">${Templates.placeholders[key]}</span>` : '');

  function ornament(p, idx) {
    const art = Ornaments[p.o](p.args || {});
    const a = p.a || 'tl';
    const pos = `${a[1] === 'l' ? 'left' : 'right'}:${u(p.x || 0)};${a[0] === 't' ? 'top' : 'bottom'}:${u(p.y || 0)}`;
    const flip = p.flip === 'x' ? ' scaleX(-1)' : p.flip === 'y' ? ' scaleY(-1)' : p.flip === 'xy' ? ' scale(-1,-1)' : '';
    const cls = ['orn-place', p.cls || '', p.ink === false ? 'no-ink' : ''].join(' ');
    return `<div class="${cls}" data-o="${p.o}-${idx}" style="${pos};width:${u(p.w || 6)};transform:rotate(${p.r || 0}deg)${flip};opacity:${p.op ?? 1}">${art}</div>`;
  }

  function flank(items, fw) {
    return (items || []).map((it) =>
      `<div style="max-width:calc(${it.w || fw} * min(1.25, var(--ps)) * var(--u));opacity:${it.op ?? 1}">${Ornaments[it.o](it.args || {})}${it.cap ? `<div class="flank-cap">${esc(it.cap)}</div>` : ''}</div>`).join('');
  }

  const SIL = `<svg viewBox="0 0 100 100"><path fill="currentColor" d="M50 14c13 0 21 10 21 24s-8 28-21 28-21-14-21-28 8-24 21-24zM14 98c2-20 16-28 36-28s34 8 36 28z"/></svg>`;

  function photo(s, tpl, f, state, dims, i) {
    const ph = s.photo || {};
    let inner;
    if (ph.kind === 'upload' && ph.src) inner = `<img src="${esc(ph.src)}" alt="">`;
    else if (ph.kind === 'portrait' && Portraits[ph.id]) inner = Portraits[ph.id].svg();
    else inner = `<div class="photo-ph">${SIL}<span>[UPLOAD PHOTO]</span></div>`;
    const pf = tpl.photoFrame;
    const vintage = state.photoVintage !== false && pf !== 'polaroid' ? ' vintage' : '';
    const vars = `--pw:${dims[0]};--ph:${dims[1]};--px:${ph.x ?? 50}%;--py:${ph.y ?? 50}%;--pz:${ph.zoom || 1}`;
    let before = '', after = '';
    if (pf === 'mugshot') {
      before = `<div class="ruler">${["7'", "6'", "5'", "4'"].map((l, k) => `<span style="top:${12 + k * 25}%">${l}</span>`).join('')}</div>`;
      after = `<div class="placard">HCSO &#183; ${esc(f.caseNo || `No. ${1031 + i}`)}</div>`;
    }
    if (pf === 'polaroid') {
      const tape = Ornaments.tape();
      after = `<div class="tape l">${tape}</div><div class="tape r">${tape}</div><div class="cap">${esc(s.alias ? `"${s.alias}"` : 'Exhibit A')}</div>`;
    }
    if (pf === 'googly') {
      after = `<div class="geye a">${Ornaments.eye({ dx: -4, dy: 5 })}</div><div class="geye b">${Ornaments.eye({ dx: 6, dy: 3 })}</div><div class="geye c">${Ornaments.eye({ dx: 2, dy: -6 })}</div>`;
    }
    return `<figure class="photo pf-${pf}${vintage}" style="${vars};margin:0">${before}<div class="photo-inner">${inner}</div>${after}</figure>`;
  }

  function nameBlock(s) {
    return `<div class="name">${txt(s.name, 'name')}</div>${s.alias ? `<div class="alias">alias &ldquo;${esc(s.alias)}&rdquo;</div>` : ''}`;
  }

  // ---------- Paper texture, wear and burnt edges ----------
  // Textures are pre-rendered PNGs (assets/textures, see scripts/make-textures.mjs) and the
  // burnt edge is a vector path, so PDFs stay small and nothing needs SVG filters.
  function paperLayers(W, H) {
    const k = 816 / W;
    return `<div class="tex-mottle"></div>
    <svg class="tex crease" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="M${W * 0.5} 0 V${H}" style="stroke:rgba(255,250,235,.7);stroke-width:${2.2 / k}"/>
      <path d="M${W * 0.5 + 2 / k} 0 V${H}" style="stroke:rgba(70,40,10,.35);stroke-width:${1.4 / k}"/>
      <path d="M0 ${H * 0.34} H${W}" style="stroke:rgba(255,250,235,.6);stroke-width:${2 / k}"/>
      <path d="M0 ${H * 0.34 + 2 / k} H${W}" style="stroke:rgba(70,40,10,.3);stroke-width:${1.3 / k}"/>
      <path d="M0 ${H * 0.67} H${W}" style="stroke:rgba(255,250,235,.6);stroke-width:${2 / k}"/>
      <path d="M0 ${H * 0.67 + 2 / k} H${W}" style="stroke:rgba(70,40,10,.3);stroke-width:${1.3 / k}"/>
    </svg>`;
  }

  // Smooth 1-D value noise along the paper perimeter, returned as an inset jagged polygon.
  function jaggedRing(W, H, inset, amp, seed, step) {
    const r = OrnamentUtil.rng(seed);
    const per = 2 * (W + H);
    const n = Math.ceil(per / step);
    const octave = (cell) => {
      const m = Math.ceil(n / cell) + 1, v = Array.from({ length: m }, () => r());
      v[m - 1] = v[0];
      return (i) => {
        const x = i / cell, a = Math.floor(x), t = x - a, s = t * t * (3 - 2 * t);
        return v[a % m] * (1 - s) + v[(a + 1) % m] * s;
      };
    };
    const o1 = octave(40), o2 = octave(9), o3 = octave(2);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const d = inset + amp * (o1(i) * 0.55 + o2(i) * 0.3 + o3(i) * 0.15);
      let p = (i / n) * per, x, y;
      if (p < W) { x = p; y = d; }
      else if ((p -= W) < H) { x = W - d; y = p; }
      else if ((p -= H) < W) { x = W - p; y = H - d; }
      else { p -= W; x = d; y = H - p; }
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `M-20 -20 H${W + 20} V${H + 20} H-20 Z M${pts.join(' L')} Z`;
  }

  function burnSvg(W, H, seed, heavy) {
    const E = (W / 816) * (heavy ? 1.35 : 1);
    const step = W / 300;
    return `<svg class="burn" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path fill-rule="evenodd" d="${jaggedRing(W, H, 10 * E, 30 * E, seed + 1, step)}" style="fill:var(--scorch);opacity:.18"/>
      <path fill-rule="evenodd" d="${jaggedRing(W, H, 6 * E, 22 * E, seed + 2, step)}" style="fill:var(--scorch);opacity:.3"/>
      <path fill-rule="evenodd" d="${jaggedRing(W, H, 3 * E, 14 * E, seed + 3, step)}" style="fill:var(--burn);opacity:.85"/>
      <path fill-rule="evenodd" d="${jaggedRing(W, H, 0, 11 * E, seed + 4, step)}" style="fill:#fff"/>
    </svg>`;
  }

  // Torn corner: a jagged clip-path plus a darkened edge line.
  function torn(corner, seed, ratio) {
    const r = OrnamentUtil.rng(seed + 50);
    const dx = 11, dy = 11 / ratio;
    const pts = [];
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const j = i === 0 || i === N ? 0 : (r() - 0.5) * 1.6;
      pts.push([dx * (1 - t) + j * 0.7, dy * t + j * 0.7 / ratio]);
    }
    const map = {
      tl: ([x, y]) => [x, y],
      tr: ([x, y]) => [100 - x, y],
      bl: ([x, y]) => [x, 100 - y],
      br: ([x, y]) => [100 - x, 100 - y],
    }[corner];
    const jag = pts.map(map);
    const poly = {
      tl: [...jag.slice().reverse(), [100, 0], [100, 100], [0, 100]],
      tr: [[0, 0], ...jag, [100, 100], [0, 100]],
      bl: [[0, 0], [100, 0], [100, 100], ...jag],
      br: [[0, 0], [100, 0], ...jag.slice().reverse(), [0, 100]],
    }[corner];
    const clip = `polygon(${poly.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')})`;
    const edge = `<svg class="torn-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${jag.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}" style="fill:none;stroke:var(--scorch);stroke-width:5;vector-effect:non-scaling-stroke;opacity:.7"/>
      <polyline points="${jag.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}" style="fill:none;stroke:var(--burn);stroke-width:1.6;vector-effect:non-scaling-stroke"/></svg>`;
    return { clip, edge };
  }

  function render(state) {
    const tpl = Templates.byId[state.template] || Templates.list[0];
    const size = Templates.sizes[state.size] || Templates.sizes.letter;
    const mode = Templates.modes[state.mode] ? state.mode : 'full';
    const f = fieldsFor(tpl, state);
    const suspects = suspectsFor(tpl, state);
    const enh = state.enh || {};
    const W = size.w * DPI, H = size.h * DPI;
    const seed = (tpl.texture && tpl.texture.seed) || 1;
    const heavy = tpl.texture && tpl.texture.heavy;

    const el = document.createElement('div');
    el.className = `poster tpl-${tpl.id} theme-${tpl.collection} mode-${mode} size-${state.size || 'letter'} layout-${tpl.layout}`;
    el.style.setProperty('--w', size.w);
    el.style.setProperty('--h', size.h);
    el.dataset.template = tpl.id;

    let tornParts = null;
    if (tpl.texture && tpl.texture.torn && state.torn !== false) {
      tornParts = torn(tpl.texture.torn, seed, size.h / size.w);
      el.style.setProperty('--torn', tornParts.clip);
    }

    // Frame
    let frame = `<div class="frame frame-${tpl.frame}">`;
    if (tpl.frame === 'western' || tpl.frame === 'ornate') frame += ['tl', 'tr', 'bl', 'br'].map((c) => `<div class="fc ${c}">${Ornaments.corner()}</div>`).join('');
    if (tpl.frame === 'candy') {
      // Candy-stripe band drawn as SVG (CSS border-image does not survive PNG export).
      const fw = (size.w - 2 * 0.044 * size.w) * DPI, fh = (size.h - 2 * 0.044 * size.w) * DPI, t = size.w * DPI / 50;
      frame += `<svg class="stripes" viewBox="0 0 ${fw} ${fh}" preserveAspectRatio="none" aria-hidden="true">
        <defs><pattern id="cs-${tpl.id}-${state.size || 'letter'}" width="${3.6 * t}" height="${3.6 * t}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="${3.6 * t}" height="${3.6 * t}" style="fill:var(--o-light)"/><rect width="${0.9 * t}" height="${3.6 * t}" style="fill:var(--o-orange)"/>
          <rect x="${1.8 * t}" width="${0.9 * t}" height="${3.6 * t}" style="fill:var(--o-purple)"/></pattern></defs>
        <rect x="${0.5 * t}" y="${0.5 * t}" width="${fw - t}" height="${fh - t}" rx="${0.9 * t}" style="fill:none;stroke:url(#cs-${tpl.id}-${state.size || 'letter'});stroke-width:${t}"/>
        <rect x="0" y="0" width="${fw}" height="${fh}" rx="${1.2 * t}" style="fill:none;stroke:var(--o-stroke);stroke-width:${0.14 * t}"/>
      </svg>`;
    }
    if (tpl.frame === 'gothic') frame += `<div class="fl b">${Ornaments.flourish()}</div>`;
    frame += '</div>';

    const back = [], front = [];
    (tpl.ornaments || []).forEach((p, i) => (p.layer === 'back' ? back : front).push(ornament(p, i)));
    if (tpl.cautionCorners) front.push('<div class="caution-corner bl"><span>CAUTION</span></div><div class="caution-corner br"><span>CAUTION</span></div>');

    // Header
    const headline = txt(f.headline, 'headline');
    let header = `<header class="hdr">${f.kicker ? `<div class="kicker">${esc(f.kicker)}</div>` : ''}<div class="headline">${headline}</div>`;
    if (tpl.layout === 'family') header += `<div class="family-name">${txt(f.familyName, 'familyName')}</div>`;
    else if (f.subhead) header += `<div class="subhead">${esc(f.subhead)}</div>`;
    header += '</header>';

    // Suspects
    let sus;
    if (tpl.layout === 'single') {
      const fl = tpl.flanks || {};
      sus = `<div class="suspects single" style="--fw:${fl.fw || 9}">
        <div class="flank l">${flank(fl.left, fl.fw || 9)}</div>
        <div class="suspect">${photo(suspects[0], tpl, f, state, tpl.photoFrame === 'cameo' ? [16.5, 20.5] : [17, 21], 0)}</div>
        <div class="flank r">${flank(fl.right, fl.fw || 9)}</div>
      </div>${nameBlock(suspects[0])}`;
    } else if (tpl.layout === 'pair') {
      const s = (k) => `<div class="suspect">${photo(suspects[k], tpl, f, state, [14, 17], k)}${nameBlock(suspects[k])}</div>`;
      sus = `<div class="suspects pair multi">${s(0)}<div class="pair-link">${Ornaments[tpl.pairLink.o]()}</div>${s(1)}</div>`;
    } else {
      const n = suspects.length, cols = n <= 4 ? n : 3;
      sus = `<div class="suspects multi" style="--cols:${cols}">${suspects.map((s, k) =>
        `<div class="suspect">${photo(s, tpl, f, state, [12, 14.5], k)}${nameBlock(s)}</div>`).join('')}</div>`;
    }

    // Crime / reward / warning
    const crime = `<section class="crime"><div class="label">Wanted For</div><div class="crime-text">${txt(f.crime, 'crime')}</div></section>`;
    const banner = tpl.bannerReward;
    const rf = tpl.rewardFlanks || {};
    const rewardFlank = (p, side) => `<div class="reward-flank ${side}" style="width:${u(p.w || 6)};transform:rotate(${p.r || 0}deg)">${Ornaments[p.o](p.args || {})}</div>`;
    const reward = `<section class="reward${banner ? ' banner' : ''}"><div class="reward-label">Reward</div>
      <div class="reward-row">${rf.left ? rewardFlank(rf.left, 'l') : ''}<div class="amount-wrap"><div class="amount">${txt(f.reward, 'reward')}</div></div>${rf.right ? rewardFlank(rf.right, 'r') : ''}</div>
      ${f.rewardNote ? `<div class="reward-note">&mdash; ${esc(f.rewardNote)} &mdash;</div>` : ''}</section>`;
    const warning = `<section class="warning"><span>${txt(f.warning, 'warning')}</span></section>`;

    const facts = [];
    if (f.lastSeen) facts.push(`<span class="${enh.lastSeenLabel ? 'ls-label' : ''}"><b>LAST SEEN</b> ${esc(f.lastSeen)}</span>`);
    if (enh.caseNo) facts.push(`<span><b>CASE NO.</b> ${esc(f.caseNo || 'HC-1031-013')}</span>`);
    if (enh.partyInfo && (f.partyDate || f.partyLocation)) facts.push(`<span><b>HEARING</b> ${esc([f.partyDate, f.partyLocation].filter(Boolean).join(' · '))}</span>`);
    const factsHtml = facts.length ? `<section class="facts">${facts.join('')}</section>` : '';

    const sig = enh.signature ? `<div class="sig"><div class="ink">${esc(f.sheriff || 'Sheriff Ichabod Graves')}</div><div class="line">Haunted County Sheriff</div></div>` : '';
    const footer = f.footer || sig ? `<div class="rule thin"></div><footer class="footer${sig ? ' has-sig' : ''}">${f.footer ? `<div class="footer-text">${esc(f.footer)}</div>` : ''}${sig}</footer>` : '';

    const stamps = [];
    if (enh.captured) stamps.push('<div class="stamp captured">Captured</div>');
    if (enh.escaped) stamps.push('<div class="stamp escaped">Escaped</div>');
    if (enh.doNotApproach) stamps.push('<div class="stamp dna">Do Not Approach</div>');
    (tpl.stamps || []).forEach((s) => stamps.push(`<div class="stamp ${s.cls}" style="${s.style}">${esc(s.text)}</div>`));

    el.innerHTML = `
      <div class="paper-bg"></div>
      ${paperLayers(W, H)}
      <div class="layer-back">${back.join('')}</div>
      ${frame}
      <div class="content">
        ${header}
        <div class="rule"></div>
        <div class="spacer"></div>
        ${sus}
        <div class="spacer"></div>
        ${crime}
        <div class="spacer"></div>
        ${reward}
        <div class="spacer"></div>
        ${warning}
        <div class="spacer"></div>
        ${factsHtml}
        ${footer}
      </div>
      <div class="layer-front">${front.join('')}</div>
      ${stamps.join('')}
      <div class="tex-grain"></div><div class="tex-speck"></div>
      ${burnSvg(W, H, seed, heavy)}
      ${tornParts ? tornParts.edge : ''}
      ${state.guides ? '<div class="guide"></div>' : ''}`;
    return el;
  }

  // ---------- Fit pass (needs the poster attached to the document) ----------
  function px(el, prop) { return parseFloat(getComputedStyle(el)[prop]); }

  function fitLine(el, minRatio = 0.3) {
    if (!el) return;
    el.style.fontSize = '';
    const start = px(el, 'fontSize');
    let size = start;
    while (el.scrollWidth > el.clientWidth + 1 && size > start * minRatio) {
      size *= 0.96;
      el.style.fontSize = `${size}px`;
    }
  }

  function fitLines(el, maxLines, minRatio = 0.4) {
    if (!el) return;
    el.style.fontSize = '';
    const start = px(el, 'fontSize');
    const lhRatio = px(el, 'lineHeight') / start || 1.15;
    let size = start;
    const over = () => el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > size * lhRatio * maxLines + 2;
    while (over() && size > start * minRatio) {
      size *= 0.95;
      el.style.fontSize = `${size}px`;
    }
  }

  function fitPhotos(el) {
    const content = el.querySelector('.content');
    const unitPx = el.offsetWidth / 50;
    const photo = el.querySelector('.photo');
    const pw = parseFloat(photo.style.getPropertyValue('--pw'));
    let hi = 1.7;
    if (el.classList.contains('layout-single')) hi = Math.min(hi, (content.clientWidth - 2 * 6.5 * unitPx) / (pw * unitPx));
    let lo = 0.45;
    const fits = (s) => {
      el.style.setProperty('--ps', s);
      return content.scrollHeight <= content.clientHeight + 1;
    };
    if (fits(hi)) return;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid; else hi = mid;
    }
    el.style.setProperty('--ps', lo.toFixed(4));
  }

  async function fit(el) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    el.querySelectorAll('.kicker, .headline, .subhead, .family-name, .name, .alias, .warning span').forEach((n) => fitLine(n));
    el.querySelectorAll('.crime-text').forEach((n) => fitLines(n, 2));
    // Rewards stay on one line when they can do so without shrinking too far.
    el.querySelectorAll('.amount').forEach((n) => {
      n.style.whiteSpace = 'nowrap';
      fitLine(n, 0.62);
      if (n.scrollWidth > n.clientWidth + 1) {
        n.style.whiteSpace = '';
        fitLines(n, 2);
      }
    });
    fitPhotos(el);
    // Names in multi-suspect layouts depend on column width only, but re-check after photos settle.
    el.querySelectorAll('.multi .name').forEach((n) => fitLine(n));
    return el;
  }

  global.PosterRenderer = { render, fit, fieldsFor, suspectsFor };
})(typeof window !== 'undefined' ? window : globalThis);
