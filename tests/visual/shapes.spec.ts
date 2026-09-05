import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { VisualContext, expectPixelAt } from "./support/visual";
import { cartesian, caseName, SHAPES, VARIANTS } from "./support/matrix";

/**
 * Every shape against every variant, pixel for pixel. Shape is implemented
 * with `border-radius` for three cases and `clip-path` for the hexagon, so a
 * regression here is exactly the kind that unit tests cannot see.
 */
describe("Visual: shapes and variants", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = { name: "Ada Lovelace", size: 96 };

  it.each(cartesian(SHAPES, VARIANTS))(
    "renders a %s %s avatar",
    async (shape, variant) => {
      await visual.matchesGolden(caseName("shape", [shape, variant]), {
        props: { ...base, shape, variant },
      });
    }
  );

  it.each(SHAPES)("renders %s with an image", async (shape) => {
    await visual.matchesGolden(caseName("shape-image", [shape]), {
      props: {
        ...base,
        shape,
        // A data URI keeps the suite offline and byte-stable.
        imageSrc:
          "data:image/svg+xml;base64," +
          Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
              '<rect width="96" height="96" fill="#2563eb"/>' +
              '<circle cx="48" cy="48" r="24" fill="#f59e0b"/></svg>'
          ).toString("base64"),
        skeleton: false,
      },
    });
  });

  it.each(
    cartesian(SHAPES, [false, true] as const, [false, true] as const)
  )(
    "renders %s with dark=%s gradient=%s",
    async (shape, dark, gradient) => {
      await visual.matchesGolden(
        caseName("shape-palette", [shape, `dark-${dark}`, `gradient-${gradient}`]),
        { props: { ...base, shape, dark, gradient } }
      );
    }
  );

  it.each(SHAPES)("keeps %s outlines when border is false", async (shape) => {
    // Documented behaviour: `border` only controls the native image border, so
    // initials avatars must keep their outline either way.
    await visual.matchesGolden(caseName("shape-borderless", [shape]), {
      props: { ...base, shape, border: false, borderColor: "#111827" },
    });
  });

  it("uses the exact background colour it was given", async () => {
    const png = await visual.render({
      props: { ...base, shape: "square", background: "#0F766E" },
    });
    expectPixelAt(png, await visual.centerOf(".avatar"), "#0F766E", 1);
  });

  it("scales the outline with the avatar size", async () => {
    // The outline is size/20, so a 200px avatar carries a 10px border.
    const png = await visual.render({
      props: {
        name: "Ada Lovelace",
        size: 200,
        shape: "square",
        borderColor: "#FF0000",
      },
    });
    const rect = await visual.rectOf(".avatar");
    // Five pixels in from the edge is inside a 10px border.
    expectPixelAt(
      png,
      { x: Math.round(rect.x + 5), y: Math.round(rect.y + rect.height / 2) },
      "#FF0000",
      2
    );
    expect(rect.width).toBe(220);
  });
});
