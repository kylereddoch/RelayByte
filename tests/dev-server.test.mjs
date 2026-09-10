import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

test('npm start watches templates and copied assets; chosen URLs render correctly', { timeout: 45_000 }, async t => {
  // Exercise the actual package scripts in an isolated copy, never edit Kyle's
  // working sources while a dev server or another task could be reading them.
  const dir = await mkdtemp(join(tmpdir(), 'relaybyte-dev-'));
  let child;
  t.after(async () => {
    if (child && child.exitCode === null) {
      const exited = new Promise(resolve => child.once('exit', resolve));
      process.kill(-child.pid, 'SIGTERM');
      await exited;
    }
    await rm(dir, { recursive: true, force: true });
  });
  await cp('src', join(dir, 'src'), { recursive: true });
  for (const file of ['package.json', 'eleventy.config.mjs']) await cp(file, join(dir, file));
  await symlink(resolve('node_modules'), join(dir, 'node_modules'), 'dir');
  const dataPath = join(dir, 'src/_data/site.json');
  const data = JSON.parse(await readFile(dataPath, 'utf8'));
  data.publicUrl = 'https://example.test/RelayByte/';
  await writeFile(dataPath, JSON.stringify(data));
  child = spawn('npm', ['run', 'start', '--', '--port=4187', '--pathprefix=/RelayByte/'], { cwd: dir, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  const root = 'http://127.0.0.1:4187/RelayByte';
  async function eventually(check) {
    const deadline = Date.now() + 12_000;
    while (Date.now() < deadline) {
      try { if (await check()) return; } catch { /* Server may be rebuilding. */ }
      await delay(150);
    }
    assert.fail(`Live rebuild did not complete. ${logs}`);
  }
  const text = async path => (await fetch(root + path)).text();
  await eventually(async () => (await text('/')).includes('Small apps.'));
  const about = await text('/about/');
  assert.match(about, /rel="canonical" href="https:\/\/example.test\/RelayByte\/about\/"/);
  assert.match(about, /property="og:image" content="https:\/\/example.test\/RelayByte\/assets\/brand\/social-card.png"/);
  const sitemap = await text('/sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 6);
  assert.ok(!sitemap.includes('/RelayByte/RelayByte/'));
  assert.match(await text('/404.html'), /noindex, nofollow/);
  const aboutPath = join(dir, 'src/about.md');
  const original = await readFile(aboutPath, 'utf8');
  await writeFile(aboutPath, original.replace('Hi, I’m Kyle.', 'Live rebuild verified.'));
  await eventually(async () => (await text('/about/')).includes('Live rebuild verified.'));
  assert.equal((await fetch(root + '/assets/brand/favicon.svg')).status, 200);
  const cssPath = join(dir, 'src/assets/site.css');
  await writeFile(cssPath, (await readFile(cssPath, 'utf8')) + '\n/* live-asset-rebuild-verified */\n');
  await eventually(async () => (await text('/assets/site.css')).includes('live-asset-rebuild-verified'));
  assert.equal((await fetch(root + '/assets/fonts/manrope-latin-variable.woff2')).status, 200);
  await writeFile(aboutPath, original);
  await eventually(async () => (await text('/about/')).includes('Hi, I’m Kyle.'));
});
