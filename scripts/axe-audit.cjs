/**
 * Automated WCAG 2.1 A/AA audit with axe-core.
 *
 * Usage (dev server must be running on BASE_URL, default http://localhost:3000):
 *   npm run audit:axe -- /path1 /path2 ...        # summary per rule
 *   DETAIL=1 npm run audit:axe -- /discussions     # also list offending elements
 *   THEME=light npm run audit:axe -- /             # audit a specific theme
 */
const { chromium } = require('playwright');
const fs = require('fs');

const base = process.env.BASE_URL || 'http://localhost:3000';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((theme) => {
    try {
      localStorage.setItem('engelsizforum_cookie_consent_v2', JSON.stringify({ necessary: true }));
      if (theme) localStorage.setItem('engelsiz_a11y_prefs', JSON.stringify({ theme }));
    } catch {}
  }, process.env.THEME || '');
  const totals = {};
  for (const path of pages) {
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      exclude: [['nextjs-portal']],
    }));
    for (const v of result.violations) {
      const t = (totals[v.id] ||= { impact: v.impact, help: v.help, count: 0, pages: new Set(), nodes: [] });
      t.count += v.nodes.length; t.pages.add(path);
      for (const n of v.nodes.slice(0, 3)) t.nodes.push(`${path}  ${n.target.join(' ')}  ${(n.failureSummary || '').split('\n')[1]?.trim() || ''}`);
    }
    await page.close();
  }
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const rows = Object.entries(totals).sort((a, b) => order[a[1].impact] - order[b[1].impact] || b[1].count - a[1].count);
  console.log(`${pages.length} sayfa, ${rows.length} kural ihlali, ${rows.reduce((s, [, t]) => s + t.count, 0)} öğe`);
  for (const [id, t] of rows) {
    console.log(`[${t.impact}] ${id} × ${t.count} (${[...t.pages].length} sayfa) — ${t.help}`);
    if (process.env.DETAIL) t.nodes.slice(0, 4).forEach((n) => console.log('     ', n.slice(0, 200)));
  }
  await browser.close();
})();
