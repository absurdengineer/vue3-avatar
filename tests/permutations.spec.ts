import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";
import {
  BADGE_VARIANTS,
  cartesian,
  CORNERS,
  GROUP_LAYOUTS,
  pairwise,
  PIXEL_THEMES,
  ROOT_TAGS,
  SHAPES,
  STATUS_SIZES,
  STATUSES,
  TOOLTIP_PLACEMENTS,
  TOOLTIP_THEMES,
  VARIANTS,
} from "./visual/support/matrix";

/**
 * The combinatorial half of the suite, run in jsdom where it is cheap.
 *
 * Enumerable dimensions are exhausted; boolean flags are covered pairwise. Full
 * coverage of 19 booleans would be 524,288 mounts to catch bugs that, in
 * practice, come from two flags interacting — `dark` with `autoContrast`, or
 * `border` with `sameBorder` — not from all nineteen at once.
 */

const NAME = "Ada Lovelace";
const IMAGE = "https://example.com/avatar.png";

const mountAvatar = (props: Record<string, unknown>) =>
  mount(Avatar, { props: { name: NAME, ...props } });

describe("Permutations: enumerable props", () => {
  it.each(cartesian(SHAPES, VARIANTS))(
    "renders shape=%s variant=%s",
    (shape, variant) => {
      const wrapper = mountAvatar({ shape, variant });
      expect(wrapper.find(".container").exists()).toBe(true);
      expect(wrapper.find(".avatar").exists()).toBe(true);
    }
  );

  it.each(cartesian(STATUSES, CORNERS))(
    "positions status=%s at %s",
    (status, statusPosition) => {
      const style =
        mountAvatar({ status, statusPosition }).find(".status-indicator")
          .attributes("style") ?? "";

      const vertical = statusPosition.startsWith("top") ? "top" : "bottom";
      const horizontal = statusPosition.endsWith("left") ? "left" : "right";
      expect(style).toContain(`${vertical}: 3px`);
      expect(style).toContain(`${horizontal}: 3px`);
      // The unused axis must be explicitly released, not left at its default.
      const oppositeV = vertical === "top" ? "bottom" : "top";
      const oppositeH = horizontal === "left" ? "right" : "left";
      expect(style).toContain(`${oppositeV}: auto`);
      expect(style).toContain(`${oppositeH}: auto`);
    }
  );

  it.each(cartesian(STATUSES, SHAPES))(
    "insets status=%s correctly on %s",
    (status, shape) => {
      const expectedInset: Record<string, number> = {
        square: 0,
        squircle: 1,
        circle: 3,
        hexagon: 5,
      };
      const style =
        mountAvatar({ status, shape }).find(".status-indicator").attributes(
          "style"
        ) ?? "";
      expect(style).toContain(`bottom: ${expectedInset[shape]}px`);
    }
  );

  it.each(cartesian(STATUS_SIZES, [24, 40, 96, 160] as const))(
    "sizes a %s dot on a %spx avatar",
    (statusSize, size) => {
      const ratios: Record<string, number> = { sm: 5, md: 4, lg: 3 };
      const style =
        mountAvatar({ status: "online", statusSize, size }).find(
          ".status-indicator"
        ).attributes("style") ?? "";
      expect(style).toContain(`width: ${size / ratios[statusSize]}px`);
    }
  );

  it.each(cartesian(BADGE_VARIANTS, CORNERS))(
    "positions a %s badge at %s",
    (badgeVariant, badgePosition) => {
      const wrapper = mountAvatar({
        badge: 5,
        badgeVariant,
        badgePosition,
        // Keep the dev-only collision warning out of this permutation.
        status: null,
      });
      const style = wrapper.find(".avatar-badge").attributes("style") ?? "";
      const vertical = badgePosition.startsWith("top") ? "top" : "bottom";
      // Badges use their own, smaller inset than the status dot: 40 * 0.03.
      expect(style).toContain(`${vertical}: 1px`);
    }
  );

  it.each(cartesian(PIXEL_THEMES, [false, true] as const))(
    "renders pixel theme %s with dark=%s",
    (pixelTheme, dark) => {
      const wrapper = mountAvatar({ variant: "pixel", pixelTheme, dark });
      const svg = wrapper.find(".avatar-pixel").html();
      expect(svg).toContain("<svg");
      expect(svg).toContain("<rect");
    }
  );

  it.each(TOOLTIP_PLACEMENTS)("accepts tooltipPlacement=%s", (placement) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({ tooltipPlacement: placement });
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(TOOLTIP_THEMES)("accepts tooltipTheme=%s", (theme) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({ tooltipTheme: theme });
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(ROOT_TAGS)("renders root element <%s>", (as) => {
    const wrapper = mountAvatar({ as, href: as === "a" ? "/x" : undefined });
    expect(wrapper.element.tagName.toLowerCase()).toBe(as);
  });

  it.each(cartesian(GROUP_LAYOUTS, [1, 2, 3, 4, 5] as const))(
    "renders group layout=%s max=%s",
    (layout, max) => {
      const wrapper = mount(AvatarGroup, {
        props: { layout, max },
        slots: {
          default: Array.from(
            { length: 5 },
            (_, i) => `<Avatar name="Person ${i}" />`
          ).join(""),
        },
        global: { components: { Avatar } },
      });

      const rendered = wrapper.findAllComponents(Avatar).length;
      const badge = wrapper.find(".avatar-overflow");

      // The triangle layout gives up one slot to the overflow badge so the
      // composition stays a triangle; the stack layout does not.
      const effective =
        layout === "triangle"
          ? (() => {
              const limit = Math.min(max, 3);
              return 5 > limit ? limit - 1 : limit;
            })()
          : max;

      expect(rendered).toBe(Math.min(effective, 5));
      expect(badge.exists()).toBe(5 > effective);
      if (badge.exists()) expect(badge.text()).toBe(`+${5 - effective}`);
    }
  );
});

describe("Permutations: boolean flags (pairwise)", () => {
  const FLAGS = [
    "dark",
    "inline",
    "rounded",
    "gradient",
    "autoContrast",
    "border",
    "sameBorder",
    "useTextColorForBorder",
    "transition",
    "skeleton",
    "retina",
    "statusPulse",
    "disabled",
    "editable",
    "nativeTitle",
    "tooltipDisabled",
    "tooltipArrow",
    "tooltipInteractive",
    "interactive",
    "pointer",
  ] as const;

  const combinations = pairwise(
    FLAGS.map((name) => ({ name, values: [false, true] }))
  );

  it("covers every flag pair in far fewer than the full product", () => {
    // 2^20 is 1,048,576; all-pairs needs a couple of dozen rows.
    expect(combinations.length).toBeGreaterThan(5);
    expect(combinations.length).toBeLessThan(40);
  });

  it("covers every pair of flag values at least once", () => {
    for (let i = 0; i < FLAGS.length; i++) {
      for (let j = i + 1; j < FLAGS.length; j++) {
        for (const a of [false, true]) {
          for (const b of [false, true]) {
            const found = combinations.some(
              (row) => row[FLAGS[i]] === a && row[FLAGS[j]] === b
            );
            expect(
              found,
              `Pair ${FLAGS[i]}=${a} with ${FLAGS[j]}=${b} was never generated.`
            ).toBe(true);
          }
        }
      }
    }
  });

  it.each(combinations.map((row, index) => [index, row] as const))(
    "mounts flag combination %i without warnings",
    (_index, flags) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      const wrapper = mountAvatar({
        ...flags,
        status: "online",
        imageSrc: IMAGE,
      });

      expect(wrapper.find(".container").exists()).toBe(true);
      expect(wrapper.find(".container").attributes("aria-label")).toBeTruthy();
      // `useLegacyColors` is the only deprecation that legitimately warns, and
      // it is not in this matrix.
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      wrapper.unmount();
    }
  );

  it.each(combinations.map((row, index) => [index, row] as const))(
    "renders combination %i as a pixel avatar too",
    (_index, flags) => {
      const wrapper = mountAvatar({ ...flags, variant: "pixel" });
      expect(wrapper.find(".avatar-pixel").exists()).toBe(true);
      wrapper.unmount();
    }
  );
});

describe("Permutations: prop validators", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const invalid: [string, unknown][] = [
    ["shape", "octagon"],
    ["variant", "photo"],
    ["loading", "whenever"],
    ["decoding", "maybe"],
    ["crossorigin", "sometimes"],
    ["statusPosition", "middle"],
    ["badgePosition", "middle"],
    ["badgeVariant", "sticker"],
    ["statusSize", "enormous"],
    ["tooltipPlacement", "sideways"],
    ["tooltipTheme", "neon"],
    ["as", "section"],
    ["pixelTheme", "chartreuse"],
  ];

  it.each(invalid)("rejects an invalid %s", (prop, value) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({ [prop]: value });

    // Vue splits its warning across arguments and appends a component trace,
    // so the whole call is flattened before matching.
    const message = warn.mock.calls
      .flat()
      .map((part) => String(part))
      .join(" ");
    expect(message).toContain("custom validator check failed");
    expect(message).toContain(prop);
  });

  it("accepts any string status, so custom presences are possible", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({ status: "in-meeting" });
    expect(warn).not.toHaveBeenCalled();
  });
});
