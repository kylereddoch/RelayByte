import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

export default function (eleventyConfig) {
  let firstBuild = true;
  const previewDrafts = process.env.RELAYBYTE_PREVIEW_DRAFTS === '1';
  const categorySlug = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const blogPosts = api => api.getFilteredByTag('blogPost')
    .filter(post => !post.data.draft || previewDrafts).sort((a, b) => b.date - a.date);
  eleventyConfig.addGlobalData('previewDrafts', previewDrafts);
  eleventyConfig.addCollection('blog', blogPosts);
  eleventyConfig.addFilter('categorySlug', categorySlug);
  eleventyConfig.addCollection('blogCategories', api => {
    const categories = new Map();
    for (const post of blogPosts(api)) {
      const name = post.data.category;
      if (!name) continue;
      const slug = categorySlug(name);
      if (!slug) throw new Error(`Blog category needs a usable name: ${name}`);
      if (!categories.has(slug)) categories.set(slug, { name, slug, posts: [] });
      categories.get(slug).posts.push(post);
    }
    return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
  });
  eleventyConfig.addFilter('postDate', date => new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(date)));
  eleventyConfig.addFilter('isoDate', date => new Date(date).toISOString());
  eleventyConfig.amendLibrary('md', markdown => {
    const renderLinkOpen = markdown.renderer.rules.link_open
      || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options));
    markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
      const token = tokens[index];
      const href = token.attrGet('href');
      if (href?.startsWith('mailto:')) {
        token.attrSet('data-tinylytics-event', 'contact.email');
      } else if (/^https?:\/\//i.test(href)) {
        const destination = new URL(href);
        token.attrSet('data-tinylytics-event', destination.pathname.startsWith('/download/') ? 'app.download' : 'link.outbound');
        token.attrSet('data-tinylytics-event-value', href);
      }
      return renderLinkOpen(tokens, index, options, env, renderer);
    };
  });
  eleventyConfig.addFilter('absoluteUrl', (path, base) => {
    // publicUrl includes the chosen deployment path; page.url does not.
    return new URL(path.replace(/^\/+/, ''), base).href;
  });
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/CNAME': 'CNAME' });
  eleventyConfig.addWatchTarget('src/assets');
  eleventyConfig.setServerPassthroughCopyBehavior('copy');
  eleventyConfig.on('eleventy.before', async ({ directories, runMode, outputMode }) => {
    const output = resolve(directories.output);
    if (!['dist', 'dist-pages'].map(name => resolve(name)).includes(output)) {
      throw new Error('Use dist or dist-pages as the output directory.');
    }
    if (outputMode === 'fs' && (firstBuild || runMode === 'build')) {
      await rm(output, { recursive: true, force: true });
    }
    firstBuild = false;
  });
  eleventyConfig.setServerOptions({ port: 4174, portReassignmentRetryCount: 0, domDiff: false });
  return { dir: { input: 'src', includes: '_includes', output: 'dist' },
    markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', '11ty.js'] };
}
