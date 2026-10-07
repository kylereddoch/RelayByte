export default {
  layout: 'blog-post.njk',
  tags: ['blogPost'],
  post: true,
  eleventyComputed: {
    permalink: data => data.draft && !data.previewDrafts ? false : `/blog/${data.slug}/`,
    eleventyExcludeFromCollections: data => Boolean(data.draft && !data.previewDrafts)
  }
};
