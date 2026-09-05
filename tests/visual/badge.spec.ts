import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { VisualContext, expectPixelAt } from "./support/visual";
import {
  BADGE_VARIANTS,
  cartesian,
  caseName,
  CORNERS,
  SHAPES,
} from "./support/matrix";

describe("Visual: badges", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = { name: "Alan Turing", size: 96, badge: 3 };

  it.each(cartesian(BADGE_VARIANTS, CORNERS))(
    "renders a %s badge at %s",
    async (badgeVariant, badgePosition) => {
      await visual.matchesGolden(
        caseName("badge", [badgeVariant, badgePosition]),
        { props: { ...base, badgeVariant, badgePosition } }
      );
    }
  );

  it.each(SHAPES)("insets the badge correctly on %s", async (shape) => {
    await visual.matchesGolden(caseName("badge-shape", [shape]), {
      props: { ...base, shape },
    });
  });

  it.each([1, 9, 42, 999, 1000, 12345])("renders the count %s", async (badge) => {
    await visual.matchesGolden(caseName("badge-count", [badge]), {
      props: { ...base, badge },
    });
  });

  it("renders a string badge", async () => {
    await visual.matchesGolden("badge-string", {
      props: { ...base, badge: "PRO" },
    });
  });

  describe("long labels", () => {
    // Regression: an uncapped label badge rendered 166% of the avatar's width
    // and ran off the far side, straight across the initials.
    it.each(["PRO", "Promotional", "Very Long Promotional Label"])(
      "keeps the label %s inside the avatar, trimmed to three letters",
      async (badge) => {
        const png = await visual.matchesGolden(caseName("badge-label", [badge]), {
          props: { ...base, badge },
        });

        const avatar = await visual.rectOf(".avatar");
        const chip = await visual.rectOf(".avatar-badge");

        expect(chip.x).toBeGreaterThanOrEqual(avatar.x - 0.5);
        expect(chip.x + chip.width).toBeLessThanOrEqual(
          avatar.x + avatar.width + 0.5
        );
        void png;
      }
    );

    it.each(CORNERS)("keeps a long label inside from %s", async (badgePosition) => {
      await visual.matchesGolden(caseName("badge-label-corner", [badgePosition]), {
        props: { ...base, badge: "Promotional", badgePosition, status: null },
      });
    });

    it("renders a label chip and a count bubble at different scales", async () => {
      await visual.matchesGolden("badge-chip-vs-bubble", {
        props: { ...base, badge: "NEW" },
      });
    });
  });

  it("renders the badge and status together without overlapping", async () => {
    await visual.matchesGolden("badge-with-status", {
      props: {
        ...base,
        status: "online",
        statusPosition: "bottom-right",
        badgePosition: "top-right",
      },
    });
  });

  it("paints the badge in the exact colour requested", async () => {
    // The dot variant carries no digit, so the centre pixel is the fill itself
    // rather than the white glyph sitting on top of it.
    const png = await visual.render({
      props: {
        ...base,
        size: 140,
        badgeVariant: "dot",
        badgeColor: "#0EA5E9",
      },
    });
    expectPixelAt(png, await visual.centerOf(".avatar-badge"), "#0EA5E9", 6);
  });

  it("chooses readable text for a light badge", async () => {
    // Only a background is supplied, so the component picks the text colour.
    await visual.matchesGolden("badge-auto-contrast-light", {
      props: { ...base, size: 140, badgeColor: "#FFFFFF" },
    });
  });
});
