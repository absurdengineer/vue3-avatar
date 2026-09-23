import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ComparisonResult {
  /** Number of pixels that differ beyond the per-pixel threshold. */
  diffPixels: number;
  /** `diffPixels` as a fraction of the image. */
  diffRatio: number;
  width: number;
  height: number;
  /** Written only when the comparison failed. */
  diffPath?: string;
}

/**
 * Golden images are stored per platform. macOS and Linux disagree on font
 * rasterisation and subpixel rounding, so a single shared set would either be
 * permanently red on one of them or require a threshold so loose it stops
 * catching real regressions.
 */
export function platformKey(): string {
  return `${process.platform}-${process.arch}`;
}

const ROOT = path.resolve(process.cwd(), "tests/visual");

export function goldenDir(): string {
  return path.join(ROOT, "__screenshots__", platformKey());
}

export function diffDir(): string {
  return path.join(ROOT, "__diff__", platformKey());
}

export function goldenPath(name: string): string {
  return path.join(goldenDir(), `${name}.png`);
}

/** True when the run was asked to (re)write goldens rather than assert them. */
export function isUpdateMode(): boolean {
  const flag = process.env.UPDATE_SNAPSHOTS;
  return flag === "1" || flag === "true";
}

export function decode(buffer: Buffer): PNG {
  return PNG.sync.read(buffer);
}

/** Colour of a single pixel, as read straight out of the decoded bitmap. */
export function colorAt(png: PNG, x: number, y: number): Rgba {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height)
    throw new Error(
      `Pixel (${x}, ${y}) is outside the ${png.width}x${png.height} image.`
    );
  const index = (png.width * y + x) << 2;
  return {
    r: png.data[index],
    g: png.data[index + 1],
    b: png.data[index + 2],
    a: png.data[index + 3],
  };
}

export function toHex({ r, g, b }: Rgba): string {
  const part = (value: number) => value.toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): Omit<Rgba, "a"> {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Chebyshev distance between two colours, in 0-255 channel units. */
export function colorDistance(a: Rgba, b: Omit<Rgba, "a">): number {
  return Math.max(
    Math.abs(a.r - b.r),
    Math.abs(a.g - b.g),
    Math.abs(a.b - b.b)
  );
}

export interface CompareOptions {
  /**
   * Per-pixel colour sensitivity handed to pixelmatch, 0-1. Lower is stricter.
   * 0.1 tolerates antialiasing jitter but still catches a changed colour.
   */
  threshold?: number;
  /** Fraction of differing pixels tolerated before the comparison fails. */
  maxDiffRatio?: number;
}

/**
 * Compares `actual` against the stored golden, writing a side-by-side diff when
 * they disagree. Missing goldens are written and reported, so a first run
 * bootstraps the reference set instead of failing on every case at once.
 */
export function compareToGolden(
  name: string,
  actual: Buffer,
  options: CompareOptions = {}
): { created: boolean; recorded: boolean; result?: ComparisonResult } {
  const { threshold = 0.1, maxDiffRatio = 0 } = options;
  const target = goldenPath(name);
  const exists = fs.existsSync(target);

  // Re-recording on request is a pass; silently inventing a reference nobody
  // has looked at is not, so the two cases are reported separately.
  if (isUpdateMode()) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, actual);
    return { created: false, recorded: true };
  }

  if (!exists) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, actual);
    return { created: true, recorded: false };
  }

  const expectedPng = decode(fs.readFileSync(target));
  const actualPng = decode(actual);

  if (
    expectedPng.width !== actualPng.width ||
    expectedPng.height !== actualPng.height
  ) {
    throw new Error(
      `Size changed for "${name}": golden is ${expectedPng.width}x${expectedPng.height}, ` +
        `render is ${actualPng.width}x${actualPng.height}. ` +
        `Re-record with UPDATE_SNAPSHOTS=1 if the change is intended.`
    );
  }

  const { width, height } = expectedPng;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    expectedPng.data,
    actualPng.data,
    diff.data,
    width,
    height,
    { threshold, includeAA: false }
  );

  const diffRatio = diffPixels / (width * height);
  const result: ComparisonResult = { diffPixels, diffRatio, width, height };

  if (diffRatio > maxDiffRatio) {
    const outPath = path.join(diffDir(), `${name}.png`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, PNG.sync.write(diff));
    // The failing render is written next to the diff so the three images can be
    // compared without re-running anything.
    fs.writeFileSync(path.join(diffDir(), `${name}.actual.png`), actual);
    result.diffPath = outPath;
  }

  return { created: false, recorded: false, result };
}
