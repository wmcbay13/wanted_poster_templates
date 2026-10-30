/*
 * Export helpers: 300 DPI PNG (html-to-image) and print-ready PDF through the
 * browser print dialog ("Save as PDF").
 */
(function (global) {
  'use strict';

  const PRINT_DPI = 300;
  const root = () => document.getElementById('print-root');

  function download(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  async function mount(states) {
    const r = root();
    r.innerHTML = '';
    const els = states.map((s) => {
      const el = PosterRenderer.render({ ...s, guides: false });
      r.appendChild(el);
      return el;
    });
    for (const el of els) await PosterRenderer.fit(el);
    return els;
  }

  // html-to-image cannot follow the @import chain to vendor/fonts.css, so hand it
  // the @font-face rules with the font files inlined as data URLs.
  let fontCSS;
  async function fontEmbedCSS() {
    if (fontCSS) return fontCSS;
    const css = await (await fetch('vendor/fonts.css')).text();
    const urls = [...new Set([...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]))];
    const data = {};
    await Promise.all(urls.map(async (u) => {
      const blob = await (await fetch(`vendor/${u}`)).blob();
      data[u] = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    }));
    fontCSS = css.replace(/url\("([^"]+)"\)/g, (m, u) => `url("${data[u]}")`);
    return fontCSS;
  }

  async function png(state, filename) {
    if (location.protocol === 'file:') {
      throw new Error('PNG export needs the studio served over http. Run "npm run serve" and open http://localhost:8080, or use Print / Save PDF instead.');
    }
    const [el] = await mount([state]);
    try {
      const blob = await global.htmlToImage.toBlob(el, {
        pixelRatio: PRINT_DPI / 96,
        width: el.offsetWidth,
        height: el.offsetHeight,
        fontEmbedCSS: await fontEmbedCSS(),
      });
      download(blob, filename);
    } finally {
      root().innerHTML = '';
    }
  }

  async function print(states) {
    const size = Templates.sizes[states[0].size] || Templates.sizes.letter;
    document.getElementById('page-size').textContent = `@page { size: ${size.w}in ${size.h}in; margin: 0; }`;
    await mount(states);
    const cleanup = () => { root().innerHTML = ''; window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  global.PosterExport = { png, print, download };
})(window);
