import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { VisualContext, expectPixelAt } from "./support/visual";
import {
  cartesian,
  caseName,
  TOOLTIP_PLACEMENTS,
  TOOLTIP_THEMES,
} from "./support/matrix";

/**
 * Tooltips teleport to `document.body`, so these are viewport captures rather
 * than element captures — the tooltip is not inside the stage element.
 *
 * This is the suite that makes the positioning engine honest: twelve
 * placements, real layout, real pixels.
 */
describe("Visual: tooltips", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = {
    name: "Ada Lovelace",
    size: 72,
    tooltip: "Countess of Lovelace",
    tooltipDelay: 0,
  };

  it.each(TOOLTIP_PLACEMENTS)("places the tooltip %s", async (tooltipPlacement) => {
    await visual.matchesGolden(caseName("tooltip-placement", [tooltipPlacement]), {
      props: { ...base, tooltipPlacement },
      hover: ".container",
      fullPage: true,
    });
  });

  it.each(TOOLTIP_THEMES)("renders the %s theme", async (tooltipTheme) => {
    await visual.matchesGolden(caseName("tooltip-theme", [tooltipTheme]), {
      props: { ...base, tooltipTheme },
      hover: ".container",
      fullPage: true,
    });
  });

  it.each(cartesian(TOOLTIP_THEMES, [true, false] as const))(
    "renders the %s theme with arrow=%s",
    async (tooltipTheme, tooltipArrow) => {
      await visual.matchesGolden(
        caseName("tooltip-arrow", [tooltipTheme, `arrow-${tooltipArrow}`]),
        {
          props: { ...base, tooltipTheme, tooltipArrow },
          hover: ".container",
          fullPage: true,
        }
      );
    }
  );

  it("renders nothing before the pointer arrives", async () => {
    await visual.matchesGolden("tooltip-closed", {
      props: base,
      fullPage: true,
    });
  });

  it("paints the dark theme background exactly", async () => {
    await visual.render({
      props: { ...base, tooltipTheme: "dark" },
      hover: ".container",
    });

    const png = await visual.render({
      props: { ...base, tooltipTheme: "dark" },
      hover: ".container",
      fullPage: true,
    });

    // #1f2937 is the documented default tooltip background.
    expectPixelAt(png, await tooltipCenter(visual), "#1F2937", 3);
  });

  it("paints the light theme background exactly", async () => {
    const png = await visual.render({
      props: { ...base, tooltipTheme: "light" },
      hover: ".container",
      fullPage: true,
    });
    expectPixelAt(png, await tooltipCenter(visual), "#FFFFFF", 3);
  });

  it("flips to the opposite side rather than leaving the viewport", async () => {
    // Pinned to the top of the page, a `top` tooltip has nowhere to go but down.
    const placement = await visual.page.evaluate(async () => {
      const stage = document.querySelector("#stage") as HTMLElement;
      stage.style.position = "fixed";
      stage.style.top = "0px";
      stage.style.left = "300px";
      stage.style.padding = "0px";
      return null;
    });
    void placement;

    const png = await visual.render({
      props: { ...base, tooltipPlacement: "top" },
      hover: ".container",
      fullPage: true,
    });

    const side = await visual.page.evaluate(
      () =>
        document
          .querySelector('[role="tooltip"]')
          ?.getAttribute("data-placement") ?? null
    );
    expect(side).toBe("bottom");

    await visual.matchesGolden("tooltip-flip-at-viewport-edge", {
      props: { ...base, tooltipPlacement: "top" },
      hover: ".container",
      fullPage: true,
    });
    void png;

    // Put the stage back for any later test in this file.
    await visual.page.evaluate(() => {
      const stage = document.querySelector("#stage") as HTMLElement;
      stage.style.position = "";
      stage.style.top = "";
      stage.style.left = "";
      stage.style.padding = "24px";
    });
  });
});

/** Centre of the teleported tooltip, in viewport coordinates. */
async function tooltipCenter(visual: VisualContext) {
  return visual.page.evaluate(() => {
    const el = document.querySelector('[role="tooltip"]');
    if (!el) throw new Error("Expected a tooltip to be open.");
    const rect = el.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    };
  });
}
