const { remarkMdxFrontmatter } = require("remark-mdx-frontmatter");

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
    appDirectory: "app",
    assetsBuildDirectory: "public/build",
    publicPath: "/build/",
    serverBuildDirectory: "build",
    devServerPort: 8002,
    ignoredRouteFiles: [".*"],
    mdx: async (filename) => {
        const [rehypeHighlight] = await Promise.all([import("rehype-highlight").then((mod) => mod.default)]);

        return {
            remarkPlugins: [[remarkMdxFrontmatter, { name: "attributes" }]],
            rehypePlugins: [rehypeHighlight],
        };
    },
};
