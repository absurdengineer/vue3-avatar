import { describe, it, beforeAll, afterAll } from "vitest";
import { VisualContext } from "./support/visual";
import { cartesian, caseName, PIXEL_THEMES, SHAPES } from "./support/matrix";

/**
 * Pixel art is generated from a string hash, so these goldens double as a
 * determinism check: if the hash or the mirroring ever changes, every one of
 * these images moves at once.
 */
describe("Visual: pixel-art avatars", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = { name: "Katherine Johnson", size: 96, variant: "pixel" };

  it.each(cartesian(PIXEL_THEMES, [false, true] as const))(
    "renders the %s theme with dark=%s",
    async (pixelTheme, dark) => {
      await visual.matchesGolden(caseName("pixel", [pixelTheme, `dark-${dark}`]), {
        props: { ...base, pixelTheme, dark },
      });
    }
  );

  it.each(SHAPES)("clips pixel art to a %s", async (shape) => {
    await visual.matchesGolden(caseName("pixel-shape", [shape]), {
      props: { ...base, shape },
    });
  });

  it.each(["Ada Lovelace", "Grace Hopper", "Alan Turing"])(
    "generates a stable pattern for %s",
    async (name) => {
      await visual.matchesGolden(caseName("pixel-name", [name]), {
        props: { ...base, name },
      });
    }
  );
});
