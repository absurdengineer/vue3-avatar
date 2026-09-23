const fs = require("fs");
const path = require("path");

/**
 * Everything under `dist/types` is emitted from source by `vue-tsc`. The only
 * declaration still written by hand is the Nuxt augmentation, which carries a
 * `declare module "@nuxt/schema"` block that cannot be derived from the module
 * implementation. It is copied here, with its source-relative import rewritten
 * to point at the emitted types.
 */
const srcFile = path.resolve(__dirname, "../types/nuxt.d.ts");
const outDir = path.resolve(__dirname, "../dist/types");
const outFile = path.join(outDir, "nuxt-module.d.ts");

if (!fs.existsSync(outDir)) {
  console.error(
    'copy-types: dist/types is missing — run "npm run build:types" first.'
  );
  process.exit(1);
}

const contents = fs
  .readFileSync(srcFile, "utf8")
  .replace('from "../src/types"', 'from "./types"');

fs.writeFileSync(outFile, contents);
console.log(`copy-types: wrote ${path.relative(process.cwd(), outFile)}`);
