import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

export default function (eleventyConfig) {
  let firstBuild = true;
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
