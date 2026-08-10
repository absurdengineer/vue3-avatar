const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "../src/nuxt/module.js");
const outDir = path.resolve(__dirname, "../dist/nuxt");
const out = path.join(outDir, "module.mjs");

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, out);
