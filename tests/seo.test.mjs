import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { buildSeo } from '../src/_lib/seo.js';
const read = path => readFile(`dist/${path}`, 'utf8');
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
test('canonical metadata, structured entities, and visible answers agree', async () => {
  const html = await read('index.html');
  const nodes = graph(html);
  assert.equal(nodes.find(n => n['@type'] === 'Person').name, 'Kyle Reddoch');
  const faq = JSON.parse(await readFile('src/_data/faq.json', 'utf8'));
  assert.deepEqual(nodes.find(n => n['@type'] === 'FAQPage').mainEntity.map(n => n.acceptedAnswer.text), faq.map(n => n.answer));
  for (const item of faq) assert.ok(html.includes(item.answer));
  for (const prop of ['og:site_name', 'og:locale', 'og:image:width', 'og:image:height', 'og:image:alt', 'twitter:title', 'twitter:description', 'twitter:image:alt']) assert.ok(html.includes(`="${prop}"`));
  const meta = await sharp('src/assets/brand/social-card.png').metadata();
  assert.equal(meta.width, 1200); assert.equal(meta.height, 630);
  const app = graph(await read('apps/trayage/index.html')).find(n => n['@type'] === 'SoftwareApplication');
  assert.equal(app.operatingSystem, 'macOS 14 or later');
  assert.ok(!app.aggregateRating);
  const pending = graph(await read('apps/styleport/index.html')).find(n => n['@type'] === 'SoftwareApplication');
  assert.ok(!pending.downloadUrl && !pending.offers);
  const blog = graph(await read('blog/building-relaybyte/index.html')).find(n => n['@type'] === 'BlogPosting');
  assert.ok(blog.datePublished);
  assert.doesNotMatch(await read('404.html'), /application\/ld\+json|rel="canonical"/);
});
test('home keeps the OG badge without a player; preview page is explicitly excluded from indexing', async () => {
  const home = await read('index.html');
  assert.match(home, /property="og:video" content="https:\/\/relaybyte.dev\/assets\/media\/relaybyte-film.mp4"/);
  assert.doesNotMatch(home, /<video|id="film"/);
  assert.ok(!graph(home).some(n => n['@type'] === 'VideoObject'));
  for (const root of ['dist', 'dist-pages']) {
    const html = await readFile(`${root}/film/index.html`, 'utf8');
    assert.match(html, /<video controls loop playsinline/);
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(html, /rel="canonical"|application\/ld\+json/);
    assert.doesNotMatch(await readFile(`${root}/sitemap.xml`, 'utf8'), /\/film\//);
  }
  assert.doesNotMatch(await read('about/index.html'), /property="og:video/);
  assert.ok((await stat('dist/assets/media/relaybyte-film.mp4')).size > 100000);
  assert.match(await readFile('dist/assets/media/relaybyte-film.vtt', 'utf8'), /^WEBVTT/);
});
test('JSON-LD safely serializes text and emits VideoObject only with an actual upload date', () => {
  const data = { site: { name: 'RelayByte', publicUrl: 'https://relaybyte.dev/', supportEmail: 'support@relaybyte.dev', filmPublishedAt: '2026-10-27T12:00:00-05:00' }, page: { url: '/film/' }, title: '</script><script>alert(1)</script>', description: 'A & B', video: true };
  const seo = buildSeo(data);
  assert.ok(!seo.graph.includes('<script>'));
  assert.equal(JSON.parse(seo.graph)['@graph'].find(n => n['@type'] === 'VideoObject').duration, 'PT12S');
  const hidden = buildSeo({ ...data, noindex: true });
  assert.equal(hidden.indexable, false);
  assert.equal(hidden.graph, '');
});
