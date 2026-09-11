import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

export default function (eleventyConfig) {
  let firstBuild = true;
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
