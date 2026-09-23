const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

/**
 * The Nuxt module is authored in TypeScript but has to ship as runnable ESM,
 * so the types are stripped without touching the module syntax — Nuxt loads
 * this file directly and needs real `import`/`export` statements.
 */
const src = path.resolve(__dirname, "../src/nuxt/module.ts");
const outDir = path.resolve(__dirname, "../dist/nuxt");
const out = path.join(outDir, "module.mjs");

const { code } = babel.transformFileSync(src, {
  babelrc: false,
  configFile: false,
  presets: [
    [
      require.resolve("@babel/preset-typescript"),
      { allExtensions: true, isTSX: false, onlyRemoveTypeImports: true },
    ],
  ],
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, code.endsWith("\n") ? code : `${code}\n`);
console.log(`copy-nuxt-module: wrote ${path.relative(process.cwd(), out)}`);
