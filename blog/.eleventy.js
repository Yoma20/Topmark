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

  // Estimated reading time from rendered HTML content, ~200 words/min
  eleventyConfig.addFilter("readTime", (htmlString) => {
    const text = (htmlString || "").replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });

  // Zero-pads issue numbers: 7 -> "007"
  eleventyConfig.addFilter("pad3", (n) => String(n).padStart(3, "0"));

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