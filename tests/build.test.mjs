import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

async function htmlFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

for (const [output, prefix] of [['dist','/'],['dist-pages','/RelayByte/']]) {
  test(`${output}: pages and local links resolve under ${prefix}`, async () => {
    const root = resolve(output);
    const pages = await htmlFiles(root);
    assert.equal(pages.length, 14);
    await stat(join(root, '.nojekyll'));
    assert.equal((await readFile(join(root, 'CNAME'), 'utf8')).trim(), 'relaybyte.dev');
    for (const page of pages) {
      const html = await readFile(page, 'utf8');
      assert.match(html, /<html lang="en">/);
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1, page);
      assert.equal((html.match(/tinylytics\.app\/embed\/tMjBVztEBpTRNL7hmsgY\.js\?events&beacon/g) || []).length, 1, page);
      assert.ok(!html.includes('{{'), `Unrendered template in ${page}`);
      for (const [tag, href] of html.matchAll(/(<a\b[^>]*\bhref="([^"]+)"[^>]*>)/g)) {
        if (href.startsWith('mailto:')) {
          assert.match(tag, /data-tinylytics-event="contact\.email"/, `${page}: missing email event for ${href}`);
        } else if (/^https?:\/\//.test(href)) {
          assert.match(tag, /data-tinylytics-event="(?:app\.download|link\.outbound)"/, `${page}: missing outbound event for ${href}`);
          assert.match(tag, /data-tinylytics-event-value=/, `${page}: missing outbound value for ${href}`);
        }
      }
      for (const [, attr] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (!attr.startsWith('/')) continue;
        assert.ok(attr.startsWith(prefix), `${page}: ${attr} escapes project path`);
        const path = attr.slice(prefix.length).split(/[?#]/)[0];
        let target = resolve(root, path || '.');
        assert.ok(target.startsWith(root), `${attr} escapes output`);
        const info = await stat(target);
        if (info.isDirectory()) await stat(join(target,'index.html'));
        const fragment = attr.split('#')[1];
        if (fragment) {
          if (info.isDirectory()) target = join(target,'index.html');
          assert.ok((await readFile(target,'utf8')).includes(`id="${fragment}"`), `Missing anchor ${attr}`);
        }
      }
    }
  });
}

test('product claims and identity stay consistent', async () => {
  const trayage = await readFile('dist/apps/trayage/index.html', 'utf8');
  assert.match(trayage, /\$29\.99/);
  assert.match(trayage, /seven-day trial/);
  assert.match(trayage, /optional paid purchases/);
  assert.match(trayage, /Kyle Reddoch/);
  assert.doesNotMatch(trayage, /buy\.stripe\.com|apps\.apple\.com/);
  const home = await readFile('dist/index.html','utf8');
  assert.match(home, /Direct download available/);
  assert.match(home, /Get Drift for Chrome/);
  assert.match(home, /The work behind/);
  assert.doesNotMatch(home, /noindex, nofollow/);
  assert.match(home, /rel="canonical" href="https:\/\/relaybyte\.dev\/"/);
  assert.match(home, /property="og:image" content="https:\/\/relaybyte\.dev\/assets\/brand\/social-card\.png"/);
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 13);
  assert.match(sitemap, /<loc>https:\/\/relaybyte\.dev\/about\/<\/loc>/);
  const robots = await readFile('dist/robots.txt', 'utf8');
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/relaybyte\.dev\/sitemap.xml/);
  assert.match(await readFile('dist/404.html', 'utf8'), /noindex, nofollow/);
  const privacy = await readFile('dist/privacy/index.html', 'utf8');
  assert.match(privacy, /I use Tinylytics to count page views and selected link clicks/);
  assert.doesNotMatch(privacy, /I have not added analytics/);
});

test('approved founder post and category appear in production pages, RSS, and sitemap', async () => {
  for (const output of ['dist', 'dist-pages']) {
    const pages = await htmlFiles(output);
    assert.ok(pages.some(path => path.includes('building-relaybyte')));
    for (const path of ['index.html', 'blog/index.html', 'blog/feed.xml', 'sitemap.xml']) {
      assert.match(await readFile(join(output, path), 'utf8'), /\/blog\/building-relaybyte\//);
    }
    const article = await readFile(join(output, 'blog/building-relaybyte/index.html'), 'utf8');
    assert.match(article, /Why I’m building RelayByte/);
    assert.doesNotMatch(article, /Draft preview|noindex, nofollow/);
  }
});

test('support contacts and hello link use their intended mailboxes', async () => {
  for (const page of ['about', 'support', 'terms', 'refunds', 'privacy']) {
    const html = await readFile(`dist/${page}/index.html`, 'utf8');
    assert.match(html, /mailto:support@relaybyte\.dev/);
    assert.match(html, /mailto:kyle@relaybyte\.dev"[^>]*>Say hello/);
    assert.equal((html.match(/mailto:kyle@relaybyte\.dev/g) || []).length, 1);
  }
});

test('shared policy pages link to app policies without inventing free-app purchase terms', async () => {
  const refunds = await readFile('dist/refunds/index.html', 'utf8');
  assert.match(refunds, /https:\/\/trayage\.app\/refunds\//);
  assert.match(refunds, /does not create a separate studio-wide refund window/);
  assert.doesNotMatch(refunds, /14 days|14-day|styleport\.app\/(?:refunds|terms)\//);
  const privacy = await readFile('dist/privacy/index.html', 'utf8');
  for (const href of ['https://trayage.app/privacy/', 'https://styleport.app/privacy/', 'https://drift.kylereddoch.me/privacy.html']) assert.ok(privacy.includes(href));
  assert.match(privacy, /including its blog and RSS feed/);
  const terms = await readFile('dist/terms/index.html', 'utf8');
  assert.match(terms, /legal operator and seller/);
  assert.match(terms, /Optional support payments/);
  assert.match(terms, /github\.com\/kylereddoch\/drift\/blob\/main\/LICENSE/);
  assert.doesNotMatch(terms, /styleport\.app\/(?:refunds|terms)\//);
});

test('brand exports are transparent and satisfy Stripe image limits', async () => {
  for (const name of ['stripe-icon-512', 'relaybyte-lockup-ink', 'relaybyte-lockup-paper']) {
    const path = `src/assets/brand/${name}.png`;
    const metadata = await sharp(path).metadata();
    assert.ok(metadata.width >= 128 && metadata.height >= 128);
    assert.ok((await stat(path)).size < 512_000);
  }
  const transparent = await sharp('src/assets/brand/relaybyte-symbol-orange-1024.png').stats();
  assert.equal(transparent.isOpaque, false);
  const icon = await sharp('src/assets/brand/stripe-icon-512.png').metadata();
  assert.equal(icon.width, icon.height);
  for (const size of [16, 32, 48]) {
    const meta = await sharp(`src/assets/brand/icon-${size}.png`).metadata();
    assert.equal(meta.width, size);
    assert.equal(meta.height, size);
  }
});
