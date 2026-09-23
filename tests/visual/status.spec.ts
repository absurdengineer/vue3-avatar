import { describe, it, beforeAll, afterAll } from "vitest";
import { VisualContext, expectPixelAt } from "./support/visual";
import {
  cartesian,
  caseName,
  CORNERS,
  SHAPES,
  STATUS_SIZES,
  STATUSES,
} from "./support/matrix";

/**
 * Exhaustive over status x corner x shape. The corner inset is derived from the
 * shape, so this is precisely the product where a wrong constant shows up as a
 * dot floating off the avatar — invisible to a style-string assertion.
 */
describe("Visual: status indicator", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = { name: "Grace Hopper", size: 96 };

  it.each(cartesian(STATUSES, CORNERS, SHAPES))(
    "renders %s at %s on a %s avatar",
    async (status, statusPosition, shape) => {
      await visual.matchesGolden(
        caseName("status", [status, statusPosition, shape]),
        { props: { ...base, status, statusPosition, shape } }
      );
    }
  );

  it.each(cartesian(STATUS_SIZES, SHAPES))(
    "renders a %s dot on a %s avatar",
    async (statusSize, shape) => {
      await visual.matchesGolden(caseName("status-size", [statusSize, shape]), {
        props: { ...base, status: "online", statusSize, shape },
      });
    }
  );

  it.each(STATUSES)("paints %s with its documented colour", async (status) => {
    const expected: Record<string, string> = {
      online: "#22C55E",
      away: "#F59E0B",
      busy: "#EF4444",
      offline: "#9CA3AF",
    };

    const png = await visual.render({
      props: { ...base, size: 140, status, statusSize: 48 },
    });
    expectPixelAt(
      png,
      await visual.centerOf(".status-indicator"),
      expected[status],
      4
    );
  });

  it("paints a custom status colour from the map", async () => {
    const png = await visual.render({
      props: {
        ...base,
        size: 140,
        status: "in-meeting",
        statusSize: 48,
        statusColors: { "in-meeting": "#7C3AED" },
      },
    });
    expectPixelAt(png, await visual.centerOf(".status-indicator"), "#7C3AED", 4);
  });

  it("lets statusColor override the map", async () => {
    const png = await visual.render({
      props: {
        ...base,
        size: 140,
        status: "online",
        statusColor: "#000080",
        statusSize: 48,
      },
    });
    expectPixelAt(png, await visual.centerOf(".status-indicator"), "#000080", 4);
  });

  it("falls back to the offline grey for an unknown status", async () => {
    const png = await visual.render({
      props: { ...base, size: 140, status: "teleporting", statusSize: 48 },
    });
    expectPixelAt(png, await visual.centerOf(".status-indicator"), "#9CA3AF", 4);
  });

  it.each(SHAPES)("matches the status ring on %s with sameBorder", async (shape) => {
    await visual.matchesGolden(caseName("status-same-border", [shape]), {
      props: {
        ...base,
        shape,
        status: "busy",
        sameBorder: true,
        borderColor: "#111827",
      },
    });
  });

  it("renders the pulse ring as a static frame under reduced motion", async () => {
    // The browser context is launched with reducedMotion: "reduce", so the
    // pulse must be suppressed rather than captured mid-animation.
    await visual.matchesGolden("status-pulse-reduced-motion", {
      props: { ...base, status: "online", statusPulse: true },
    });
  });
});
