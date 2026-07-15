module.exports = function (eleventyConfig) {
  // Copy any images placed in posts/images straight through to the output
  eleventyConfig.addPassthroughCopy({ "blog/posts/images": "images" });
  eleventyConfig.addPassthroughCopy({ "blog/style.css": "style.css" });

  // Human-readable date filter, e.g. "July 14, 2026"
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Global value available in every template as {{ currentYear }}
  eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());

  // Collection of all posts, newest first
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("blog/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  return {
    dir: {
      input: "blog/posts",
      includes: "../_includes",
      output: "public/blog",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};