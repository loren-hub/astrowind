import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { load } from 'js-yaml';
const hashes = new Set();
let indexable = false;
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      if (file === join('dist', 'index.html')) {
        const robots = [...html.matchAll(/<meta\b[^>]*>/gi)].find(([tag]) => /\bname="robots"/i.test(tag));
        indexable = Boolean(robots && !/\bcontent="[^"]*noindex/i.test(robots[0]));
      }
      for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!/\bsrc\s*=/.test(match[1]) && match[2].trim())
          hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
      }
    }
  }
}
await scan('dist');
let headers = await readFile('public/_headers', 'utf8');
headers = headers.replace(
  "script-src 'self' https://challenges.cloudflare.com",
  `script-src 'self' https://challenges.cloudflare.com ${[...hashes].join(' ')}`
);
if (!indexable) headers = headers.replace('/*\n', '/*\n  X-Robots-Tag: noindex, nofollow\n');
await writeFile('dist/_headers', headers);
const config = load(await readFile('src/config.yaml', 'utf8'));
const sitemap = new URL('/sitemap-index.xml', config.site.site).href;
await writeFile(
  'dist/robots.txt',
  indexable ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${sitemap}\n` : 'User-agent: *\nDisallow: /\n'
);
console.log(`Cabeceras listas: ${hashes.size} hashes CSP; preview noindex: ${!indexable}.`);
