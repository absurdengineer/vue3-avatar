const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "../types");
const outDir = path.resolve(__dirname, "../dist/types");

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
  if (!file.endsWith(".d.ts")) continue;
  fs.copyFileSync(path.join(srcDir, file), path.join(outDir, file));
}
