import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { expect, inject } from "vitest";
import type { PNG } from "pngjs";
import {
  colorAt,
  colorDistance,
  compareToGolden,
  decode,
  hexToRgb,
  isUpdateMode,
  platformKey,
  toHex,
} from "./pixels";
import type { CompareOptions, Rgba } from "./pixels";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface MountRequest {
  component?: "Avatar" | "AvatarGroup";
  props?: Record<string, unknown>;
  children?: Record<string, unknown>[];
  defaults?: Record<string, unknown>;
}

export interface CaptureOptions extends MountRequest, CompareOptions {
  /** CSS selector to shoot. Defaults to the stage wrapper. */
  selector?: string;
  /** Hover this selector before capturing, for tooltip and overlay states. */
  hover?: string;
  /** Wait this long after hovering, to clear the tooltip's open delay. */
  hoverDelay?: number;
  /** Shoot the whole viewport instead of an element — needed for teleports. */
  fullPage?: boolean;
}

/**
 * A connected browser plus a page pointed at the harness. One per test file:
 * pages are cheap, browsers are not.
 */
export class VisualContext {
  private constructor(
    private readonly browser: Browser,
    readonly page: Page,
    private readonly ownsBrowser: boolean
  ) {}

  static async create(): Promise<VisualContext> {
    const endpoint = inject("browserWSEndpoint");
    const baseUrl = inject("harnessBaseUrl");

    let ownsBrowser = false;
    let browser: Browser;
    if (endpoint) {
      browser = await chromium.connect(endpoint);
    } else {
      browser = await chromium.launch();
      ownsBrowser = true;
    }

    const context = await browser.newContext({
      // A fixed viewport and DPR is what makes two machines agree on geometry.
      viewport: { width: 800, height: 600 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/tests/visual/harness.html`, {
      waitUntil: "load",
    });
    await page.waitForFunction(() => window.__ready === true);

    return new VisualContext(browser, page, ownsBrowser);
  }

  async dispose(): Promise<void> {
    await this.page.context().close();
    if (this.ownsBrowser) await this.browser.close();
  }

  /**
   * Bounding box of `selector` expressed in the coordinate space of the
   * captured stage image, so probes can be written against real geometry
   * instead of hand-computed offsets that break the moment a border changes.
   */
  async rectOf(selector: string, stageSelector = "#stage"): Promise<Rect> {
    const box = await this.page.evaluate(
      ([target, stage]) => {
        const el = document.querySelector(target);
        const root = document.querySelector(stage);
        if (!el || !root)
          throw new Error(`Could not find "${target}" inside "${stage}".`);
        const a = el.getBoundingClientRect();
        const b = root.getBoundingClientRect();
        return {
          x: a.left - b.left,
          y: a.top - b.top,
          width: a.width,
          height: a.height,
        };
      },
      [selector, stageSelector] as const
    );
    return box;
  }

  /** Centre of `selector`, in stage image coordinates, rounded to a pixel. */
  async centerOf(selector: string, stageSelector = "#stage"): Promise<Point> {
    const rect = await this.rectOf(selector, stageSelector);
    return {
      x: Math.round(rect.x + rect.width / 2),
      y: Math.round(rect.y + rect.height / 2),
    };
  }

  /** Mounts a case and returns its decoded screenshot. */
  async render(options: CaptureOptions = {}): Promise<PNG> {
    const { component, props, children, defaults, hover, hoverDelay, fullPage } =
      options;

    await this.page.evaluate(
      (request) => window.__mount(request),
      { component, props, children, defaults } as MountRequest
    );

    if (hover) {
      await this.page.hover(hover);
      // Tooltips open on a timer; without this the shot races the delay.
      await this.page.waitForTimeout(hoverDelay ?? 350);
    }

    const buffer = fullPage
      ? await this.page.screenshot({ animations: "disabled" })
      : await this.page
          .locator(options.selector ?? "#stage")
          .screenshot({ animations: "disabled" });

    return decode(buffer);
  }

  /**
   * Renders a case and asserts it against its golden, pixel for pixel.
   *
   * Returns the decoded image so a test can follow up with colour probes on
   * the exact same render rather than taking a second screenshot.
   */
  async matchesGolden(
    name: string,
    options: CaptureOptions = {}
  ): Promise<PNG> {
    const { component, props, children, defaults, hover, hoverDelay, fullPage } =
      options;

    await this.page.evaluate(
      (request) => window.__mount(request),
      { component, props, children, defaults } as MountRequest
    );

    if (hover) {
      await this.page.hover(hover);
      await this.page.waitForTimeout(hoverDelay ?? 350);
    }

    const buffer = fullPage
      ? await this.page.screenshot({ animations: "disabled" })
      : await this.page
          .locator(options.selector ?? "#stage")
          .screenshot({ animations: "disabled" });

    const { created, recorded, result } = compareToGolden(name, buffer, {
      threshold: options.threshold,
      maxDiffRatio: options.maxDiffRatio,
    });

    if (recorded) return decode(buffer);

    if (created) {
      // Recording a brand-new golden is not a pass: nobody has looked at it yet.
      throw new Error(
        `Recorded a new golden for "${name}" at ` +
          `tests/visual/__screenshots__/${platformKey()}/${name}.png. ` +
          `Review it and re-run.`
      );
    }

    if (result?.diffPath) {
      throw new Error(
        `"${name}" differs from its golden: ${result.diffPixels} pixels ` +
          `(${(result.diffRatio * 100).toFixed(3)}% of ${result.width}x${result.height}). ` +
          `Diff written to ${result.diffPath}. ` +
          `If the change is intended, re-record with UPDATE_SNAPSHOTS=1.`
      );
    }

    return decode(buffer);
  }
}

/** Reads one pixel and asserts its colour, with a channel tolerance. */
export function expectPixel(
  png: PNG,
  x: number,
  y: number,
  expectedHex: string,
  tolerance = 2
): void {
  assertPixel(png, x, y, expectedHex, tolerance);
}

/** Same assertion, taking a point from `centerOf` or `rectOf`. */
export function expectPixelAt(
  png: PNG,
  point: Point,
  expectedHex: string,
  tolerance = 2
): void {
  assertPixel(png, point.x, point.y, expectedHex, tolerance);
}

function assertPixel(
  png: PNG,
  x: number,
  y: number,
  expectedHex: string,
  tolerance: number
): void {
  const actual = colorAt(png, x, y);
  const expected = hexToRgb(expectedHex);
  const distance = colorDistance(actual, expected);

  expect(
    distance,
    `Pixel (${x}, ${y}) is ${toHex(actual)}, expected ${expectedHex.toUpperCase()} ` +
      `(off by ${distance} per channel, tolerance ${tolerance}).`
  ).toBeLessThanOrEqual(tolerance);
}

/** The pixel at the centre of the captured stage. */
export function centerPixel(png: PNG): Rgba {
  return colorAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
}

export { colorAt, toHex, isUpdateMode, platformKey };
