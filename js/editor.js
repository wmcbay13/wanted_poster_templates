/*
 * Wanted Poster Studio editor: guest list, form binding, live preview,
 * photo upload / positioning, presets, autosave and exports.
 */
(function () {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const STORE_KEY = 'wanted-poster-studio:v1';
  const KEEP_ON_RESET = ['caseNo', 'sheriff', 'partyDate', 'partyLocation'];
  const THUMB_PORTRAITS = {
    'candy-bandit': 'pumpkin', 'little-monster': 'monster', 'cookie-criminal': 'cat', 'spooky-suspect': 'ghost',
    'serial-snoozer': 'mummy', 'booze-bandit': 'vampire', 'party-phantom': 'silhouette', 'midnight-menace': 'werewolf',
    'partners-in-crime': 'witch', 'most-wanted-family': 'skeleton',
  };

  const uid = () => Math.random().toString(36).slice(2, 10);
  const slug = (s) => String(s || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'poster';
  const newGuest = (template = 'candy-bandit') => ({ id: uid(), template, fields: {}, suspects: [], enh: {} });

  const app = {
    guests: [newGuest()],
    current: 0,
    print: { size: 'letter', mode: 'full', vintage: true, torn: true, guides: false },
  };

  const guest = () => app.guests[app.current];
  const tpl = (g = guest()) => Templates.byId[g.template] || Templates.list[0];
  const stateOf = (g, extra = {}) => ({
    ...g, size: app.print.size, mode: app.print.mode, photoVintage: app.print.vintage, torn: app.print.torn, ...extra,
  });
  const guestLabel = (g) => {
    const t = tpl(g);
    if (t.layout === 'family') return (g.fields.familyName ?? '') || (g.suspects[0] && g.suspects[0].name) || 'Unnamed family';
    return g.suspects.map((s) => s.name).filter(Boolean).join(' & ') || 'Unnamed guest';
  };

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, ms = 3200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ---------- persistence ----------
  let saveTimer, warnedQuota = false;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(app));
      } catch (e) {
        if (!warnedQuota) toast('Autosave skipped: photos are too large for browser storage. Use "Save guest list" to keep your work.', 6000);
        warnedQuota = true;
      }
    }, 400);
  }
  function restore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.guests) && data.guests.length) {
        app.guests = data.guests.filter((g) => Templates.byId[g.template]);
        app.current = Math.min(data.current || 0, app.guests.length - 1);
        Object.assign(app.print, data.print || {});
      }
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    if (!app.guests.length) app.guests = [newGuest()];
  }

  function syncSuspects(g = guest()) {
    const n = PosterRenderer.suspectsFor(tpl(g), g).length;
    while (g.suspects.length < n) g.suspects.push({ name: '', alias: '', photo: { kind: 'none' } });
    g.suspects.length = n;
  }

  // ---------- static UI setup ----------
  function fillSelect(sel, items) {
    sel.innerHTML = items.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  }

  function setupStatic() {
    fillSelect($('#opt-size'), Object.entries(Templates.sizes).map(([k, s]) => [k, s.label]));
    fillSelect($('#opt-mode'), Object.entries(Templates.modes));
    $('#dl-kickers').innerHTML = Library.kickers.map((k) => `<option value="${k}">`).join('');
    $('#dl-headlines').innerHTML = Library.headlines.map((k) => `<option value="${k}">`).join('');

    // Presets
    $$('[data-preset]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const k = sel.dataset.preset, v = sel.value;
        if (!v) return;
        if (k === 'reward') {
          const r = Library.rewards[+v];
          guest().fields.reward = r.amount;
          guest().fields.rewardNote = r.note || '';
        } else guest().fields[k] = v;
        sel.value = '';
        syncForm();
        changed();
      });
    });

    // Field inputs
    $$('[data-field]').forEach((inp) => inp.addEventListener('input', () => {
      guest().fields[inp.dataset.field] = inp.value;
      changed({ list: inp.dataset.field === 'familyName' });
    }));
    $$('[data-enh]').forEach((cb) => cb.addEventListener('change', () => {
      guest().enh[cb.dataset.enh] = cb.checked;
      changed();
    }));

    $('#opt-size').addEventListener('change', (e) => { app.print.size = e.target.value; changed(); });
    $('#opt-mode').addEventListener('change', (e) => { app.print.mode = e.target.value; changed({ gallery: true }); });
    $('#opt-vintage').addEventListener('change', (e) => { app.print.vintage = e.target.checked; changed(); });
    $('#opt-torn').addEventListener('change', (e) => { app.print.torn = e.target.checked; changed(); });
    $('#opt-guides').addEventListener('change', (e) => { app.print.guides = e.target.checked; changed(); });

    $('#btn-reset-text').addEventListener('click', () => {
      const keep = {};
      KEEP_ON_RESET.forEach((k) => { if (guest().fields[k] !== undefined) keep[k] = guest().fields[k]; });
      guest().fields = keep;
      syncForm();
      changed();
    });

    $('#btn-add-guest').addEventListener('click', () => {
      app.guests.push(newGuest(guest().template));
      app.current = app.guests.length - 1;
      fullRefresh();
    });
    $('#btn-add-suspect').addEventListener('click', () => {
      const t = tpl();
      if (guest().suspects.length < (t.maxSuspects || 6)) guest().suspects.push({ name: '', alias: '', photo: { kind: 'none' } });
      buildSuspects();
      changed();
    });
    $('#btn-remove-suspect').addEventListener('click', () => {
      const t = tpl();
      if (guest().suspects.length > (t.minSuspects || 2)) guest().suspects.pop();
      buildSuspects();
      changed();
    });

    $('#btn-pdf').addEventListener('click', () => PosterExport.print([stateOf(guest())]));
    $('#btn-print-all').addEventListener('click', () => PosterExport.print(app.guests.map((g) => stateOf(g))));
    $('#btn-png').addEventListener('click', async () => {
      const g = guest();
      const btn = $('#btn-png');
      btn.disabled = true;
      toast('Rendering 300 DPI PNG… large sizes can take a few seconds.', 10000);
      try {
        await PosterExport.png(stateOf(g), `${slug(guestLabel(g))}-${g.template}-${app.print.size}-${app.print.mode}.png`);
        toast('PNG downloaded.');
      } catch (e) {
        toast(e.message || 'PNG export failed. Try Print / Save PDF instead.', 8000);
      } finally {
        btn.disabled = false;
      }
    });
    $('#btn-save').addEventListener('click', () => {
      const data = {
        version: 1, size: app.print.size, mode: app.print.mode, print: app.print,
        guests: app.guests.map((g) => stateOf(g)),
      };
      PosterExport.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'wanted-poster-guests.json');
    });
    $('#file-load').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const list = (Array.isArray(data) ? data : data.guests || []).filter((g) => Templates.byId[g.template]);
        if (!list.length) throw new Error('No posters found in that file.');
        app.guests = list.map((g) => ({ id: uid(), template: g.template, fields: g.fields || {}, suspects: g.suspects || [], enh: g.enh || {} }));
        app.current = 0;
        if (data.print) Object.assign(app.print, data.print);
        else Object.assign(app.print, { size: data.size || app.print.size, mode: data.mode || app.print.mode });
        fullRefresh();
        toast(`Loaded ${list.length} poster${list.length > 1 ? 's' : ''}.`);
      } catch (err) {
        toast(`Could not load file: ${err.message}`, 6000);
      }
    });

    setupPreviewInteraction();
    new ResizeObserver(() => scalePreview()).observe($('#preview'));
    new ResizeObserver(() => scaleThumbs()).observe($('#gallery'));
  }

  // ---------- gallery ----------
  let thumbsBuilt = false;
  async function buildGallery() {
    const gal = $('#gallery');
    gal.innerHTML = '';
    const posters = [];
    for (const c of Templates.collections) {
      const h = document.createElement('h3');
      h.textContent = c.name;
      gal.appendChild(h);
      for (const t of Templates.list.filter((x) => x.collection === c.id)) {
        const b = document.createElement('button');
        b.className = 'thumb';
        b.dataset.template = t.id;
        b.title = `${t.no}. ${t.name}`;
        b.innerHTML = '<div class="tframe"></div><span></span>';
        b.querySelector('span').textContent = `${t.no}. ${t.name}`;
        const n = t.layout === 'single' ? 1 : t.layout === 'pair' ? 2 : 4;
        const el = PosterRenderer.render({
          template: t.id, size: 'letter', mode: app.print.mode,
          suspects: Array.from({ length: n }, (_, i) => ({ name: n > 1 ? ['Ghoul', 'Goblin', 'Ghost', 'Gremlin'][i] : 'Your Guest', photo: { kind: 'portrait', id: THUMB_PORTRAITS[t.id] } })),
          fields: t.layout === 'family' ? { familyName: 'The Spooky Family' } : {},
        });
        b.querySelector('.tframe').appendChild(el);
        b.addEventListener('click', () => selectTemplate(t.id));
        gal.appendChild(b);
        posters.push(el);
      }
    }
    thumbsBuilt = true;
    markActiveThumb();
    await Promise.all(posters.map((p) => PosterRenderer.fit(p)));
    scaleThumbs();
  }
  function scaleThumbs() {
    if (!thumbsBuilt) return;
    $$('#gallery .tframe').forEach((f) => {
      const p = f.firstElementChild;
      if (p && p.offsetWidth) p.style.transform = `scale(${f.clientWidth / p.offsetWidth})`;
    });
  }
  function markActiveThumb() {
    $$('#gallery .thumb').forEach((b) => b.classList.toggle('active', b.dataset.template === guest().template));
  }
  function selectTemplate(id) {
    const g = guest(), t = Templates.byId[id];
    g.template = id;
    // Coming from a smaller layout, start a family poster with its default head count.
    while (t.layout === 'family' && g.suspects.length < t.suspects) g.suspects.push({ name: '', alias: '', photo: { kind: 'none' } });
    syncSuspects();
    markActiveThumb();
    buildSuspects();
    syncForm();
    changed({ list: true });
  }

  // ---------- suspects ----------
  function buildSuspects() {
    const g = guest(), t = tpl(g);
    syncSuspects(g);
    const wrap = $('#suspects');
    wrap.innerHTML = '';
    g.suspects.forEach((s, i) => {
      const card = $('#tpl-suspect').content.firstElementChild.cloneNode(true);
      card.querySelector('legend').textContent = g.suspects.length > 1 ? `Suspect ${i + 1}` : 'Suspect';
      const q = (k) => card.querySelector(`[data-s="${k}"]`);
      q('name').value = s.name || '';
      q('alias').value = s.alias || '';
      q('name').addEventListener('input', (e) => { s.name = e.target.value; changed({ list: true }); });
      q('alias').addEventListener('input', (e) => { s.alias = e.target.value; changed(); });

      const ph = () => (s.photo = s.photo || { kind: 'none' });
      const syncSliders = () => {
        q('zoom').value = ph().zoom || 1;
        q('x').value = ph().x ?? 50;
        q('y').value = ph().y ?? 50;
        $$('button', q('portraits')).forEach((b) => b.classList.toggle('active', ph().kind === 'portrait' && ph().id === b.dataset.id));
      };
      card._syncSliders = syncSliders;
      q('portraits').innerHTML = Object.entries(Portraits).map(([id, p]) => `<button type="button" data-id="${id}" title="${p.label}">${p.svg()}</button>`).join('');
      $$('button', q('portraits')).forEach((b) => b.addEventListener('click', () => {
        s.photo = { kind: 'portrait', id: b.dataset.id, zoom: 1, x: 50, y: 50 };
        syncSliders();
        changed();
      }));
      q('upload').addEventListener('change', async (e) => {
        const f = e.target.files[0];
        e.target.value = '';
        if (!f) return;
        try {
          s.photo = { kind: 'upload', src: await downscale(f), zoom: 1, x: 50, y: 50 };
          syncSliders();
          changed();
        } catch (err) {
          toast('That file could not be read as an image.');
        }
      });
      q('clear').addEventListener('click', () => { s.photo = { kind: 'none' }; syncSliders(); changed(); });
      ['zoom', 'x', 'y'].forEach((k) => q(k).addEventListener('input', (e) => { ph()[k] = +e.target.value; changed(); }));
      syncSliders();
      wrap.appendChild(card);
    });
    $('#suspect-count').classList.toggle('hidden', t.layout !== 'family');
  }

  // Keep uploads print-sharp but small enough to store: longest side 2000px.
  function downscale(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 2000, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k);
        c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  // ---------- form sync ----------
  function syncForm() {
    const g = guest(), t = tpl(g);
    const f = PosterRenderer.fieldsFor(t, g);
    $$('[data-field]').forEach((inp) => {
      const k = inp.dataset.field;
      inp.value = g.fields[k] !== undefined ? g.fields[k] : (t.defaults[k] ?? (k === 'sheriff' ? '' : ''));
      if (k === 'sheriff' && g.fields.sheriff === undefined) inp.value = f.sheriff;
    });
    $$('[data-enh]').forEach((cb) => { cb.checked = !!g.enh[cb.dataset.enh]; });
    $('#subhead-wrap').classList.toggle('hidden', t.layout === 'family');
    $('#family-wrap').classList.toggle('hidden', t.layout !== 'family');

    const order = { kids: ['kids', 'adults', 'couples', 'families'], adults: ['adults', 'couples', 'kids', 'families'], special: [t.layout === 'pair' ? 'couples' : 'families', t.layout === 'pair' ? 'families' : 'couples', 'kids', 'adults'] }[t.collection];
    const names = { kids: 'Children', adults: 'Adults', couples: 'Couples', families: 'Families', all: 'Anyone' };
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const head = '<option value="">&#9662;</option>';
    $('[data-preset="crime"]').innerHTML = head + order.map((a) => `<optgroup label="${names[a]}">${Library.crimes[a].map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</optgroup>`).join('');
    $('[data-preset="reward"]').innerHTML = head + [...order, 'all'].map((a) => {
      const items = Library.rewards.map((r, i) => [r, i]).filter(([r]) => r.a === a);
      return items.length ? `<optgroup label="${names[a]}">${items.map(([r, i]) => `<option value="${i}">${esc(r.amount + (r.note ? ` — ${r.note}` : ''))}</option>`).join('')}</optgroup>` : '';
    }).join('');
    const simple = (k, list) => { $(`[data-preset="${k}"]`).innerHTML = head + list.map((w) => `<option value="${esc(w)}">${esc(w)}</option>`).join(''); };
    simple('warning', Library.warnings);
    simple('lastSeen', Library.lastSeen);
    simple('footer', Library.footers);

    $('#opt-size').value = app.print.size;
    $('#opt-mode').value = app.print.mode;
    $('#opt-vintage').checked = app.print.vintage;
    $('#opt-torn').checked = app.print.torn;
    $('#opt-guides').checked = app.print.guides;
  }

  // ---------- guest list ----------
  function buildGuestList() {
    const ul = $('#guest-list');
    ul.innerHTML = '';
    app.guests.forEach((g, i) => {
      const li = document.createElement('li');
      li.className = i === app.current ? 'active' : '';
      li.innerHTML = '<div class="g-name"><b></b><small></small></div><button title="Duplicate">&#10697;</button><button title="Delete">&#10005;</button>';
      li.querySelector('b').textContent = guestLabel(g);
      li.querySelector('small').textContent = `${tpl(g).no}. ${tpl(g).name}`;
      li.addEventListener('click', () => { app.current = i; fullRefresh(); });
      const [dup, del] = li.querySelectorAll('button');
      dup.addEventListener('click', (e) => {
        e.stopPropagation();
        const copy = JSON.parse(JSON.stringify(g));
        copy.id = uid();
        app.guests.splice(i + 1, 0, copy);
        app.current = i + 1;
        fullRefresh();
      });
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`Delete the poster for "${guestLabel(g)}"?`)) return;
        app.guests.splice(i, 1);
        if (!app.guests.length) app.guests.push(newGuest());
        app.current = Math.min(app.current, app.guests.length - 1);
        fullRefresh();
      });
      ul.appendChild(li);
    });
  }

  // ---------- preview ----------
  let renderToken = 0, previewTimer;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 90);
  }
  async function renderPreview() {
    const token = ++renderToken;
    const el = PosterRenderer.render(stateOf(guest(), { guides: app.print.guides }));
    const holder = $('#preview-scale');
    const staging = document.createElement('div');
    staging.style.cssText = 'position:absolute;left:-100000px;top:0';
    staging.appendChild(el);
    document.body.appendChild(staging);
    await PosterRenderer.fit(el);
    if (token !== renderToken) { staging.remove(); return; }
    holder.replaceChildren(el);
    staging.remove();
    const t = tpl(), size = Templates.sizes[app.print.size];
    $('#preview-label').textContent = `${t.no}. ${t.name} · ${size.label} · ${Templates.modes[app.print.mode]}`;
    scalePreview();
  }
  function scalePreview() {
    const box = $('#preview'), holder = $('#preview-scale'), el = holder.firstElementChild;
    if (!el) return;
    const pad = 32, W = el.offsetWidth, H = el.offsetHeight;
    const k = Math.min((box.clientWidth - pad) / W, (box.clientHeight - pad) / H);
    holder.style.width = `${W}px`;
    holder.style.height = `${H}px`;
    holder.style.transform = `scale(${k})`;
    holder.style.left = `${(box.clientWidth - W * k) / 2}px`;
    holder.style.top = `${(box.clientHeight - H * k) / 2}px`;
    holder.dataset.scale = k;
  }

  // Drag to pan / wheel to zoom the photo directly on the preview.
  function setupPreviewInteraction() {
    const holder = $('#preview-scale');
    let drag = null;
    const photoIndex = (inner) => $$('.photo', holder).indexOf(inner.closest('.photo'));
    holder.addEventListener('pointerdown', (e) => {
      const inner = e.target.closest('.photo-inner');
      if (!inner) return;
      const i = photoIndex(inner), s = guest().suspects[i];
      if (!s || !s.photo || s.photo.kind === 'none') return;
      drag = { i, s, x0: e.clientX, y0: e.clientY, px: s.photo.x ?? 50, py: s.photo.y ?? 50, w: inner.getBoundingClientRect().width, h: inner.getBoundingClientRect().height, fig: inner.closest('.photo') };
      holder.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    holder.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const z = drag.s.photo.zoom || 1;
      const clamp = (v) => Math.max(0, Math.min(100, v));
      drag.s.photo.x = Math.round(clamp(drag.px - ((e.clientX - drag.x0) / drag.w) * 100 / z));
      drag.s.photo.y = Math.round(clamp(drag.py - ((e.clientY - drag.y0) / drag.h) * 100 / z));
      drag.fig.style.setProperty('--px', `${drag.s.photo.x}%`);
      drag.fig.style.setProperty('--py', `${drag.s.photo.y}%`);
    });
    const end = () => {
      if (!drag) return;
      drag = null;
      $$('#suspects .suspect-card').forEach((c) => c._syncSliders && c._syncSliders());
      changed({ preview: false });
    };
    holder.addEventListener('pointerup', end);
    holder.addEventListener('pointercancel', end);
    holder.addEventListener('wheel', (e) => {
      const inner = e.target.closest('.photo-inner');
      if (!inner) return;
      const s = guest().suspects[photoIndex(inner)];
      if (!s || !s.photo || s.photo.kind === 'none') return;
      e.preventDefault();
      s.photo.zoom = Math.max(1, Math.min(3, +((s.photo.zoom || 1) - Math.sign(e.deltaY) * 0.05).toFixed(2)));
      inner.closest('.photo').style.setProperty('--pz', s.photo.zoom);
      $$('#suspects .suspect-card').forEach((c) => c._syncSliders && c._syncSliders());
      changed({ preview: false });
    }, { passive: false });
  }

  // ---------- change plumbing ----------
  function changed(opts = {}) {
    if (opts.preview !== false) schedulePreview();
    if (opts.list) buildGuestList();
    if (opts.gallery) buildGallery();
    persist();
  }
  function fullRefresh() {
    syncSuspects();
    buildGuestList();
    buildSuspects();
    syncForm();
    markActiveThumb();
    changed();
  }

  // ---------- boot ----------
  restore();
  setupStatic();
  fullRefresh();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildGallery);
})();
