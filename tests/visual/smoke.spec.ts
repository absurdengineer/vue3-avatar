import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  VisualContext,
  expectPixelAt,
  colorAt,
  toHex,
} from "./support/visual";

/**
 * Proves the capture pipeline itself works before any golden comparison is
 * trusted: the browser renders, the PNG decodes, and the colours in it are the
 * ones the component was told to paint.
 *
 * Probes are taken from live geometry rather than hand-computed offsets — the
 * avatar's outline is `size / 20`, so arithmetic in a test drifts the moment
 * anything about the border changes.
 */
describe("Visual harness", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  it("renders an avatar and reads its exact background colour", async () => {
    const png = await visual.render({
      props: {
        name: "John Doe",
        size: 100,
        background: "#123456",
        color: "#123456",
        shape: "square",
        borderColor: "#123456",
      },
    });

    expectPixelAt(png, await visual.centerOf(".avatar"), "#123456");
  });

  it("paints the status dot in the documented online colour", async () => {
    const png = await visual.render({
      props: {
        name: "John Doe",
        size: 120,
        status: "online",
        statusPosition: "bottom-right",
        shape: "square",
        statusSize: 40,
      },
    });

    expectPixelAt(png, await visual.centerOf(".status-indicator"), "#22C55E", 4);
  });

  it("paints each presence colour", async () => {
    const cases: [string, string][] = [
      ["online", "#22C55E"],
      ["away", "#F59E0B"],
      ["busy", "#EF4444"],
      ["offline", "#9CA3AF"],
    ];

    for (const [status, hex] of cases) {
      const png = await visual.render({
        props: { name: "John Doe", size: 120, status, statusSize: 40 },
      });
      expectPixelAt(png, await visual.centerOf(".status-indicator"), hex, 4);
    }
  });

  it("captures at a stable size across runs", async () => {
    const first = await visual.render({
      props: { name: "John Doe", size: 64, shape: "square" },
    });
    const second = await visual.render({
      props: { name: "John Doe", size: 64, shape: "square" },
    });

    expect(first.width).toBe(second.width);
    expect(first.height).toBe(second.height);
    // 64px avatar + a size/20 outline on each side + 24px stage padding.
    expect(first.width).toBe(118);
  });

  it("reads a different colour for a different name", async () => {
    const first = await visual.render({
      props: { name: "Ada Lovelace", size: 80, shape: "square" },
    });
    const firstCenter = await visual.centerOf(".avatar");
    const second = await visual.render({
      props: { name: "Grace Hopper", size: 80, shape: "square" },
    });
    const secondCenter = await visual.centerOf(".avatar");

    expect(toHex(colorAt(first, firstCenter.x, firstCenter.y))).not.toBe(
      toHex(colorAt(second, secondCenter.x, secondCenter.y))
    );
  });
});
