import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');

/**
 * Lists every file below a directory, skipping build output and dependencies.
 */
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    if (['node_modules', '.next', '.git'].includes(name)) return [];
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceDirs = ['app', 'components', 'lib', 'hooks', 'types', 'scripts', 'public', '.github'];
const files = sourceDirs.flatMap((dir) => walk(path.join(root, dir)));
const topLevel = ['README.md', 'next.config.ts', 'middleware.ts', 'metadata.json', '.env.example', 'package.json'].map((f) => path.join(root, f));
const textFiles = [...files, ...topLevel].filter((f) => existsSync(f) && /\.(ts|tsx|js|mjs|json|md|yml|yaml|py|txt|example|html)$|\.env\.example$/.test(f));
const selfTests = ['lock-surface.test.ts'];

describe('read-only lock surface', () => {
  it('keeps only the allowed route files under app/api', () => {
    const routes = walk(path.join(root, 'app/api')).map((f) => path.relative(root, f)).sort();
    expect(routes).toEqual([
      'app/api/brand/button/route.ts',
      'app/api/brand/logo/route.ts',
      'app/api/discussions/route.ts',
      'app/api/og/route.tsx',
      'app/api/v1/calculate/balthazard/route.ts',
    ]);
  });

  it('removes the side-product pages', () => {
    for (const dir of ['developer', 'developers', 'webmcp', 'oauth', 'widgets', 'demo-thread', 'visitor-stats', 'mcp', 'nodeinfo']) {
      expect(existsSync(path.join(root, 'app', dir))).toBe(false);
    }
  });

  it('shows no link to the closed new-topic page in the menus', () => {
    for (const file of ['components/layout/classic-navbar.tsx', 'components/layout/universal-drawer-menu.tsx']) {
      expect(readFileSync(path.join(root, file), 'utf8')).not.toContain('href="/discussions/new"');
    }
  });

  it('gives each page that shows only the lock notice a level-one heading', () => {
    for (const file of ['app/register/page.tsx', 'app/discussions/new/page.tsx', 'app/messages/page.tsx', 'app/profile/page.tsx']) {
      expect(readFileSync(path.join(root, file), 'utf8')).toContain('headingLevel={1}');
    }
  });

  it('exposes no server action other than topic deletion', () => {
    const source = readFileSync(path.join(root, 'app/actions.ts'), 'utf8');
    const exported = [...source.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(\w+)/g)].map((m) => m[1]);
    expect(exported).toEqual(['deleteTopicAction']);
  });

  it('has no service-role client or file that imports it', () => {
    expect(existsSync(path.join(root, 'lib/supabase-server.ts'))).toBe(false);
    const offenders = textFiles.filter((f) => !selfTests.some((t) => f.endsWith(t))).filter((f) => /supabase-server|supabaseServer/.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });

  it('mentions none of the removed secret names', () => {
    const names = [
      ['GEM', 'INI'], ['BS', 'KY'], ['YETE', 'RLY'], ['CRON_', 'SECRET'], ['OAUTH_JWT_', 'SECRET'],
      ['MASTODON_TOKEN_', 'SECRET'], ['VISITOR_API_', 'TOKEN'], ['SERVICE_', 'ROLE'],
    ].map((parts) => parts.join(''));
    const hits: string[] = [];
    for (const file of textFiles) {
      if (selfTests.some((t) => file.endsWith(t))) continue;
      const content = readFileSync(file, 'utf8');
      for (const name of names) {
        if (content.includes(name)) hits.push(`${path.relative(root, file)}: ${name}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('keeps no scheduled or main-writing workflow', () => {
    expect(walk(path.join(root, '.github/workflows'))).toEqual([]);
  });
});
