import { defineConfig } from "vitepress";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

const SITE_URL = "https://vue3-avatar.vercel.app";
const SITE_TITLE = "vue3-avatar";
const SITE_DESCRIPTION =
  "A lightweight, customizable, accessible, and SSR-safe avatar component for Vue 3 and Nuxt.";

export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lastUpdated: true,
  cleanUrls: true,
  sitemap: {
    hostname: SITE_URL,
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/avatar-icon.svg" }],
    ["meta", { name: "theme-color", content: "#14162e" }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "vue3-avatar",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        description: SITE_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        softwareVersion: version,
        url: SITE_URL,
        codeRepository: "https://github.com/absurdengineer/vue3-avatar",
        license: "https://github.com/absurdengineer/vue3-avatar/blob/master/LICENSE",
      }),
    ],
  ],
  transformHead: ({ pageData, siteConfig }) => {
    const canonicalPath = pageData.relativePath
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");
    const canonicalUrl = `${SITE_URL}/${canonicalPath}`;
    const title = pageData.frontmatter.title
      ? `${pageData.frontmatter.title} | ${SITE_TITLE}`
      : pageData.title
      ? `${pageData.title} | ${SITE_TITLE}`
      : SITE_TITLE;
    const description =
      pageData.frontmatter.description || pageData.description || SITE_DESCRIPTION;

    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:site_name", content: SITE_TITLE }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:image", content: `${SITE_URL}/og-image.png` }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: `${SITE_URL}/og-image.png` }],
    ];
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    editLink: {
      pattern:
        "https://github.com/absurdengineer/vue3-avatar/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Components", link: "/components/avatar" },
      { text: "Playground", link: "/playground" },
      { text: "Examples", link: "/examples/" },
      { text: "Comparison", link: "/comparison" },
      { text: "What's new", link: "/whats-new" },
      { text: `v${version}`, link: "https://www.npmjs.com/package/vue3-avatar" },
    ],
    sidebar: {
      "/guide/": [
        { text: "Getting Started", link: "/guide/" },
        { text: "Nuxt Module", link: "/guide/nuxt-module" },
      ],
      "/components/": [
        { text: "Avatar Component", link: "/components/avatar" },
        { text: "AvatarGroup Component", link: "/components/group" },
        { text: "Tooltips", link: "/components/tooltip" },
      ],
      "/examples/": [{ text: "Examples & Presets", link: "/examples/" }],
      "/migration/": [
        { text: "What's new in v5", link: "/whats-new" },
        { text: "v4 to v5", link: "/migration/v4-to-v5" },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/absurdengineer/vue3-avatar" },
      { icon: "npm", link: "https://www.npmjs.com/package/vue3-avatar" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Mohammad Dilshad Alam (absurdengineer)",
    },
  },
  vite: {
    resolve: {
      alias: {
        "vue3-avatar": path.resolve(process.cwd(), "./src/entry.esm.ts"),
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  },
});
