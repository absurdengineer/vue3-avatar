import { defineConfig } from "vitepress";
import path from "path";

export default defineConfig({
  title: "vue3-avatar",
  description:
    "A lightweight, customizable, accessible, and SSR-safe avatar component for Vue 3 and Nuxt.",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/avatar-icon.svg" }],
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Components", link: "/components/avatar" },
      { text: "Playground", link: "/playground" },
      { text: "Examples", link: "/examples/" },
      { text: "v4.1.2", link: "https://www.npmjs.com/package/vue3-avatar" },
    ],
    sidebar: {
      "/guide/": [{ text: "Getting Started", link: "/guide/" }],
      "/components/": [
        { text: "Avatar Component", link: "/components/avatar" },
        { text: "AvatarGroup Component", link: "/components/group" },
      ],
      "/examples/": [{ text: "Examples & Presets", link: "/examples/" }],
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
        "vue3-avatar": path.resolve(process.cwd(), "./src/entry.esm.js"),
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  },
});
