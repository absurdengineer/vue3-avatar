import { describe, it, beforeAll, afterAll } from "vitest";
import { VisualContext, expectPixelAt } from "./support/visual";
import { cartesian, caseName, ROOT_TAGS, SHAPES } from "./support/matrix";

/**
 * Interaction states are all CSS — focus rings, dimming, overlays. None of it
 * is observable from a mounted-component assertion, which is the whole reason
 * this suite exists.
 */
describe("Visual: interaction states", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const base = { name: "Edsger Dijkstra", size: 96 };

  it.each(ROOT_TAGS)("renders identically as a <%s>", async (as) => {
    await visual.matchesGolden(caseName("root-tag", [as]), {
      props: { ...base, as, href: as === "a" ? "#" : undefined },
    });
  });

  it.each(cartesian(ROOT_TAGS, [false, true] as const))(
    "renders <%s> with disabled=%s",
    async (as, disabled) => {
      await visual.matchesGolden(
        caseName("disabled", [as, `disabled-${disabled}`]),
        {
          props: {
            ...base,
            as,
            disabled,
            interactive: true,
            href: as === "a" ? "#" : undefined,
          },
        }
      );
    }
  );

  it.each(cartesian(SHAPES, [false, true] as const))(
    "renders %s with selected=%s",
    async (shape, selected) => {
      await visual.matchesGolden(
        caseName("selected", [shape, `selected-${selected}`]),
        { props: { ...base, shape, selected } }
      );
    }
  );

  it.each(SHAPES)("renders the edit overlay on hover for %s", async (shape) => {
    await visual.matchesGolden(caseName("editable-hover", [shape]), {
      props: { ...base, shape, editable: true },
      hover: ".container",
      hoverDelay: 50,
    });
  });

  it.each(SHAPES)("hides the edit overlay when idle for %s", async (shape) => {
    await visual.matchesGolden(caseName("editable-idle", [shape]), {
      props: { ...base, shape, editable: true },
    });
  });

  it("shows the focus ring on keyboard focus", async () => {
    await visual.render({ props: { ...base, interactive: true } });
    await visual.page.keyboard.press("Tab");
    await visual.matchesGolden("focus-ring", {
      props: { ...base, interactive: true },
      selector: "#stage",
    });
  });

  it.each(SHAPES)("renders the loading skeleton for %s", async (shape) => {
    // A source that never resolves leaves the avatar in its loading state.
    await visual.matchesGolden(caseName("skeleton", [shape]), {
      props: {
        ...base,
        shape,
        imageSrc: "/tests/visual/__fixtures__/never-resolves.png",
        skeleton: true,
      },
      hoverDelay: 0,
    });
  });

  it("paints the selection ring in the documented default colour", async () => {
    const png = await visual.render({
      props: { ...base, size: 140, shape: "square", selected: true },
    });

    const rect = await visual.rectOf(".container");
    // The ring is a 2px box-shadow just outside the container's own edge.
    expectPixelAt(
      png,
      { x: Math.round(rect.x - 1), y: Math.round(rect.y + rect.height / 2) },
      "#2563EB",
      8
    );
  });

  it("honours --va-ring-color from an ancestor", async () => {
    // The variable is read by the container's own box-shadow, so it has to be
    // set on or above the container — `customAvatarStyle` targets the inner
    // element and would never reach it.
    await visual.page.evaluate(() => {
      (document.querySelector("#stage") as HTMLElement).style.setProperty(
        "--va-ring-color",
        "#FF00FF"
      );
    });

    const png = await visual.render({
      props: { ...base, size: 140, shape: "square", selected: true },
    });
    const rect = await visual.rectOf(".container");
    expectPixelAt(
      png,
      { x: Math.round(rect.x - 1), y: Math.round(rect.y + rect.height / 2) },
      "#FF00FF",
      8
    );

    await visual.page.evaluate(() => {
      (document.querySelector("#stage") as HTMLElement).style.removeProperty(
        "--va-ring-color"
      );
    });
  });
});
