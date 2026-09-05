import { describe, it, expect } from "vitest";
import type { AvatarTooltipPlacement } from "../../src/types";
import {
  computePosition,
  parsePlacement,
  flipPlacement,
  PLACEMENTS,
} from "../../src/utils/position";

const rect = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});

// A 40x40 avatar sitting comfortably in the middle of a 1000x800 viewport.
const REFERENCE = rect(480, 380, 40, 40);
const FLOATING = rect(0, 0, 120, 32);
const VIEWPORT = rect(0, 0, 1000, 800);

describe("parsePlacement", () => {
  it("splits side and alignment", () => {
    expect(parsePlacement("top-start")).toEqual({
      side: "top",
      alignment: "start",
    });
    expect(parsePlacement("right")).toEqual({ side: "right", alignment: null });
  });

  it("falls back to top for unknown input", () => {
    expect(parsePlacement("sideways")).toEqual({ side: "top", alignment: null });
    expect(parsePlacement(undefined)).toEqual({ side: "top", alignment: null });
  });

  it("ignores an unknown alignment", () => {
    expect(parsePlacement("top-middle")).toEqual({
      side: "top",
      alignment: null,
    });
  });
});

describe("flipPlacement", () => {
  it("swaps the side and keeps the alignment", () => {
    expect(flipPlacement("top-start")).toBe("bottom-start");
    expect(flipPlacement("left")).toBe("right");
    expect(flipPlacement("bottom-end")).toBe("top-end");
  });
});

describe("computePosition - placements", () => {
  it("exposes all 12 placements", () => {
    expect(PLACEMENTS).toHaveLength(12);
  });

  it.each([
    ["top", 440, 340],
    ["top-start", 480, 340],
    ["top-end", 400, 340],
    ["bottom", 440, 428],
    ["bottom-start", 480, 428],
    ["bottom-end", 400, 428],
    ["left", 352, 384],
    ["left-start", 352, 380],
    ["left-end", 352, 388],
    ["right", 528, 384],
    ["right-start", 528, 380],
    ["right-end", 528, 388],
  ])("positions %s", (placement, x, y) => {
    const result = computePosition(REFERENCE, FLOATING, {
      placement: placement as AvatarTooltipPlacement,
    });
    expect(result.placement).toBe(placement);
    expect(result.x).toBe(x);
    expect(result.y).toBe(y);
  });

  it("falls back to top for an unknown placement", () => {
    // Deliberately invalid: the engine must fall back rather than throw.
    const placement = "nope" as unknown as AvatarTooltipPlacement;
    expect(computePosition(REFERENCE, FLOATING, { placement }).placement).toBe(
      "top"
    );
  });

  it("honours a custom offset", () => {
    const tight = computePosition(REFERENCE, FLOATING, {
      placement: "bottom",
      offset: 0,
    });
    expect(tight.y).toBe(420);
  });

  it("leaves coordinates untouched when no boundary is given", () => {
    // Reference pinned to the very top: without a boundary there is nothing to
    // collide against, so the tooltip is allowed off-screen.
    const result = computePosition(rect(480, 0, 40, 40), FLOATING, {
      placement: "top",
    });
    expect(result.y).toBe(-40);
    expect(result.placement).toBe("top");
  });
});

describe("computePosition - flip", () => {
  it("flips to the opposite side when the preferred one overflows", () => {
    const result = computePosition(rect(480, 10, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
    });
    expect(result.placement).toBe("bottom");
    expect(result.y).toBe(58);
  });

  it("keeps the alignment through a flip", () => {
    const result = computePosition(rect(480, 10, 40, 40), FLOATING, {
      placement: "top-start",
      boundary: VIEWPORT,
    });
    expect(result.placement).toBe("bottom-start");
  });

  it("flips horizontally too", () => {
    const result = computePosition(rect(5, 380, 40, 40), FLOATING, {
      placement: "left",
      boundary: VIEWPORT,
    });
    expect(result.placement).toBe("right");
  });

  it("keeps the roomier side when both overflow", () => {
    // A 60px-tall boundary fits neither a 32px tooltip above nor below, but
    // there is more room below the reference than above it.
    const cramped = rect(0, 0, 1000, 60);
    const result = computePosition(rect(480, 4, 40, 12), FLOATING, {
      placement: "top",
      boundary: cramped,
      padding: 0,
    });
    expect(result.placement).toBe("bottom");
  });

  it("does not flip when there is room", () => {
    const result = computePosition(REFERENCE, FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
    });
    expect(result.placement).toBe("top");
  });

  it("respects flip: false", () => {
    const result = computePosition(rect(480, 10, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      flip: false,
    });
    expect(result.placement).toBe("top");
  });
});

describe("computePosition - shift", () => {
  it("clamps to the left boundary edge", () => {
    const result = computePosition(rect(0, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      padding: 8,
    });
    // Centred would be -40; clamped to boundary.x + padding.
    expect(result.x).toBe(8);
  });

  it("clamps to the right boundary edge", () => {
    const result = computePosition(rect(960, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      padding: 8,
    });
    expect(result.x).toBe(1000 - 8 - 120);
  });

  it("clamps on the vertical axis for side placements", () => {
    const result = computePosition(rect(480, 0, 40, 40), FLOATING, {
      placement: "right",
      boundary: VIEWPORT,
      padding: 8,
    });
    expect(result.y).toBe(8);
  });

  it("pins to the start edge when the boundary is narrower than the tooltip", () => {
    const narrow = rect(0, 0, 60, 800);
    const result = computePosition(rect(10, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: narrow,
      padding: 8,
    });
    expect(result.x).toBe(8);
  });

  it("respects shift: false", () => {
    const result = computePosition(rect(0, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      shift: false,
    });
    expect(result.x).toBe(-40);
  });
});

describe("computePosition - arrow", () => {
  it("centres the arrow under the reference", () => {
    const { arrow } = computePosition(REFERENCE, FLOATING, {
      placement: "top",
      arrowSize: 8,
    });
    // Reference centre 500, tooltip left 440 -> 60, minus half the arrow.
    expect(arrow.x).toBe(56);
    expect(arrow.y).toBeNull();
  });

  it("keeps pointing at the reference after a shift", () => {
    const result = computePosition(rect(0, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      padding: 8,
      arrowSize: 8,
    });
    // Reference centre is 20, tooltip was clamped to x=8, so the arrow tracks
    // back to 20 - 8 - 4 = 8 rather than staying at the tooltip's centre.
    expect(result.arrow.x).toBe(8);
  });

  it("clamps the arrow inside the tooltip edges", () => {
    const result = computePosition(rect(960, 380, 40, 40), FLOATING, {
      placement: "top",
      boundary: VIEWPORT,
      padding: 8,
      arrowSize: 8,
    });
    expect(result.arrow.x).toBeLessThanOrEqual(120 - 8 - 4);
    expect(result.arrow.x).toBeGreaterThanOrEqual(4);
  });

  it("uses the vertical axis for side placements", () => {
    const { arrow } = computePosition(REFERENCE, FLOATING, {
      placement: "right",
      arrowSize: 8,
    });
    expect(arrow.x).toBeNull();
    expect(arrow.y).toBe(12);
  });
});
