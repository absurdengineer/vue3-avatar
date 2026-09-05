import { describe, it, beforeAll, afterAll } from "vitest";
import { VisualContext } from "./support/visual";
import {
  cartesian,
  caseName,
  GROUP_LAYOUTS,
  ROSTER,
} from "./support/matrix";

describe("Visual: AvatarGroup", () => {
  let visual: VisualContext;

  beforeAll(async () => {
    visual = await VisualContext.create();
  });

  afterAll(async () => {
    await visual?.dispose();
  });

  const children = ROSTER.map((person) => ({ ...person, size: 56 }));

  it.each(cartesian(GROUP_LAYOUTS, [1, 2, 3, 4, 5] as const))(
    "renders the %s layout with max=%s",
    async (layout, max) => {
      await visual.matchesGolden(caseName("group", [layout, `max-${max}`]), {
        component: "AvatarGroup",
        props: { layout, max, size: 56 },
        children,
      });
    }
  );

  it.each([0, 8, 16, 24] as const)("overlaps stacked avatars by %spx", async (overlap) => {
    await visual.matchesGolden(caseName("group-overlap", [overlap]), {
      component: "AvatarGroup",
      props: { layout: "stack", overlap, size: 56 },
      children,
    });
  });

  it("renders the overflow badge with a custom border colour", async () => {
    await visual.matchesGolden("group-border-color", {
      component: "AvatarGroup",
      props: { max: 3, size: 56, borderColor: "#1E293B" },
      children,
    });
  });

  it("passes size down to every child", async () => {
    await visual.matchesGolden("group-size-inheritance", {
      component: "AvatarGroup",
      props: { max: 4, size: 80 },
      children: ROSTER.map((person) => ({ ...person })),
    });
  });

  it("renders children carrying their own statuses", async () => {
    await visual.matchesGolden("group-with-statuses", {
      component: "AvatarGroup",
      props: { max: 4, size: 64 },
      children: [
        { name: "Ada Lovelace", status: "online" },
        { name: "Grace Hopper", status: "away" },
        { name: "Alan Turing", status: "busy" },
        { name: "Katherine Johnson", status: "offline" },
        { name: "Edsger Dijkstra" },
      ],
    });
  });

  it("shows the overflow tooltip on hover", async () => {
    await visual.matchesGolden("group-overflow-tooltip", {
      component: "AvatarGroup",
      props: { max: 2, size: 56 },
      children,
      hover: ".avatar-overflow",
      fullPage: true,
    });
  });
});
