export default {
  eleventyComputed: {
    draft: data => Boolean(data.categoryInfo?.posts.every(post => post.data.draft)),
    eleventyExcludeFromCollections: data => Boolean(data.categoryInfo?.posts.every(post => post.data.draft))
  }
};
