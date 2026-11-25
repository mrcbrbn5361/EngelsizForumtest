/**
 * WCAG contrast audit: measures the contrast ratio of every visible text node
 * against its effective background on the given pages, for one theme.
 *
 * Usage (dev server must be running on BASE_URL, default http://localhost:3000):
 *   npm run audit:contrast -- <dark|light|sepia|system> <0|1 high contrast> /path1 /path2 ...
 *   SHOW=10 npm run audit:contrast -- light 1 / /discussions   # also list the 10 worst texts
 *
 * Text over background images/gradients is skipped.
 */
const { chromium } = require('playwright');
const [,, theme, hc, ...pages] = process.argv;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  await ctx.addInitScript(([t, h]) => { try {
    localStorage.setItem('engelsiz_a11y_prefs', JSON.stringify({ theme: t, highContrast: h === '1' }));
    localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true }));
  } catch {} }, [theme, hc]);
  let tot = 0, aa = 0, aaa = 0; const worst = [];
  for (const u of pages) {
    const p = await ctx.newPage();
    await p.goto((process.env.BASE_URL || 'http://localhost:3000') + u, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 1; const c = cv.getContext('2d', { willReadFrequently: true });
      const rgba = (s) => { c.clearRect(0,0,1,1); c.fillStyle = '#000'; c.fillStyle = s; c.fillRect(0,0,1,1); const d = c.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const alpha = (s) => { const m = s.match(/\/\s*([\d.]+%?)\)|rgba\([^)]*,\s*([\d.]+)\)/); if (!m) return 1; const v = m[1] || m[2]; return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); };
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const s = cs.backgroundColor; const a = alpha(s); if (a > 0) { const [r,g,b] = rgba(s); layers.push([r,g,b,a]); if (a >= 0.99) break; } } let base = [255,255,255]; for (const [r,g,b,a] of layers.reverse()) base = [r*a+base[0]*(1-a), g*a+base[1]*(1-a), b*a+base[2]*(1-a)]; return base; };
      const out = []; const seen = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode; if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
        const rect = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!rect.width || !rect.height || cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1 || rect.bottom < 0 || rect.top > 900) continue;
        if (el.closest('[aria-hidden="true"], nextjs-portal, .sr-only')) continue;
        const bg = bgOf(el); if (!bg) continue;
        const fgA = alpha(cs.color); const f = rgba(cs.color); const fg = [f[0]*fgA+bg[0]*(1-fgA), f[1]*fgA+bg[1]*(1-fgA), f[2]*fgA+bg[2]*(1-fgA)];
        const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        out.push({ ratio: Math.round(ratio * 10) / 10, text: n.textContent.trim().slice(0, 40) });
      }
      return out;
    });
    for (const x of r) { tot++; if (x.ratio < 4.5) { aa++; worst.push(`${u} ${x.ratio} "${x.text}"`); } if (x.ratio < 7) aaa++; }
    await p.close();
  }
  console.log(`${theme}${hc === '1' ? '+HC' : ''}: ${tot} metin | 4.5:1 altı (AA hatası): ${aa} | 7:1 altı (AAA altı): ${aaa}`);
  if (process.env.SHOW) worst.sort((a, b) => parseFloat(a.split(' ')[1]) - parseFloat(b.split(' ')[1])).slice(0, +process.env.SHOW).forEach(w => console.log('   ', w));
  await b.close();
})();
