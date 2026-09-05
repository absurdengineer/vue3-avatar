/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/**
 * Gzipped ceiling for the minified browser bundle, in bytes.
 *
 * The minified build is the number that matters: the ESM build ships comments
 * that every consumer's bundler strips. Raise this deliberately in the same
 * commit as the feature that needs the room, never as a drive-by.
 */
// v5 raised this from 7.3 kB: the tooltip positioning engine, badges, the
// image fallback chain and the interaction work land at ~14 kB gzipped. The
// ceiling sits ~2 kB above that so a bug fix never has to argue with the
// budget mid-review; a feature that eats the headroom raises it explicitly.
const LIMIT_BYTES = 16384;
const TARGET = path.join(__dirname, "..", "dist", "avatar.min.js");

if (!fs.existsSync(TARGET)) {
  console.error(`size: ${TARGET} not found — run "npm run build" first.`);
  process.exit(1);
}

const gzipped = zlib.gzipSync(fs.readFileSync(TARGET)).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;

if (gzipped > LIMIT_BYTES) {
  console.error(
    `size: dist/avatar.min.js is ${kb(gzipped)} gzipped, over the ${kb(
      LIMIT_BYTES
    )} budget by ${kb(gzipped - LIMIT_BYTES)}.`
  );
  process.exit(1);
}

console.log(
  `size: dist/avatar.min.js ${kb(gzipped)} gzipped (budget ${kb(
    LIMIT_BYTES
  )}, ${kb(LIMIT_BYTES - gzipped)} to spare).`
);
