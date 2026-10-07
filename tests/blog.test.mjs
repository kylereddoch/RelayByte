import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, symlink, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('approved posts render with safe RSS and project-path links; drafts remain excluded', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'relaybyte-blog-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await cp('src', join(dir, 'src'), { recursive: true });
  // Treat the opening post as an unpublished fixture in this isolated checkout.
  const draftPath = join(dir, 'src/blog/posts/building-relaybyte.md');
  await writeFile(draftPath, (await readFile(draftPath, 'utf8')).replace('draft: false', 'draft: true'));
  for (const file of ['package.json', 'eleventy.config.mjs']) await cp(file, join(dir, file));
  await symlink(resolve('node_modules'), join(dir, 'node_modules'), 'dir');
  await writeFile(join(dir, 'src/blog/posts/feed-check.md'), `---
title: 'A & B < C'
description: 'Choices & lessons < today'
date: 2026-10-07
slug: feed-check
category: Building
draft: false
---
A published fixture for feed verification.
`);
  execFileSync('npm', ['run', 'build:pages'], {
    cwd: dir,
    env: { ...process.env, RELAYBYTE_PREVIEW_DRAFTS: '0' },
    stdio: 'pipe',
    timeout: 15_000
  });
  const root = join(dir, 'dist-pages');
  const feed = await readFile(join(root, 'blog/feed.xml'), 'utf8');
  assert.match(feed, /<title>A &amp; B &lt; C<\/title>/);
  assert.match(feed, /Choices &amp; lessons &lt; today/);
  assert.match(feed, /<pubDate>Wed, 07 Oct 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(feed, /<link>https:\/\/relaybyte\.dev\/blog\/feed-check\/<\/link>/);
  assert.doesNotMatch(feed, /building-relaybyte/);
  const blog = await readFile(join(root, 'blog/index.html'), 'utf8');
  assert.match(blog, /href="\/RelayByte\/blog\/feed-check\/"/);
  assert.doesNotMatch(blog, /Draft preview/);
  const article = await readFile(join(root, 'blog/feed-check/index.html'), 'utf8');
  assert.match(article, /By Kyle Reddoch/);
  assert.match(article, /property="og:type" content="article"/);
  assert.doesNotMatch(article, /noindex, nofollow/);
  assert.match(article, /href="\/RelayByte\/blog\/category\/building\/"/);
  const category = await readFile(join(root, 'blog/category/building/index.html'), 'utf8');
  assert.match(category, /<h1[^>]*>Building<\/h1>/);
  assert.match(category, /href="\/RelayByte\/blog\/feed-check\/"/);
  assert.doesNotMatch(category, /noindex, nofollow|building-relaybyte/);
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /\/blog\/category\/building\//);
  assert.doesNotMatch(sitemap, /\/blog\/category\/journey\//);
  await assert.rejects(stat(join(root, 'blog/category/journey/index.html')), { code: 'ENOENT' });
  await assert.rejects(stat(join(root, 'blog/building-relaybyte/index.html')), { code: 'ENOENT' });
});
