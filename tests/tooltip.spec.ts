import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";

const findTooltip = () => document.body.querySelector('[role="tooltip"]');

/** Same lookup, but for the assertions that have already proven it is open. */
const openTooltip = (): HTMLElement => {
  const el = findTooltip();
  if (!el) throw new Error("Expected a tooltip to be open.");
  return el as HTMLElement;
};

// Components stay mounted until torn down explicitly; clearing document.body
// out from under a live component leaves Vue patching into detached nodes.
const mounted: VueWrapper<any>[] = [];
const track = (wrapper: VueWrapper<any>) => {
  mounted.push(wrapper);
  return wrapper;
};
const unmountAll = () => {
  while (mounted.length) mounted.pop()!.unmount();
  document.body.innerHTML = "";
};

// jsdom has no layout engine, so every rect is zero. Positioning maths is
// covered properly in tests/utils/position.spec.js; here we only care that the
// tooltip appears, disappears and is wired up correctly.
const mountAvatar = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) =>
  track(
    mount(Avatar, {
      props: { name: "John Doe", ...props },
      attachTo: document.body,
      ...options,
    })
  );

/** Advances past the open delay and lets Vue flush. */
async function settle(ms = 300) {
  vi.advanceTimersByTime(ms);
  await nextTick();
  await nextTick();
}

describe("Avatar tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    unmountAll();
    vi.useRealTimers();
  });

  it("does not render a native title by default", () => {
    const wrapper = mountAvatar();
    expect(wrapper.find(".container").attributes("title")).toBeUndefined();
  });

  it("restores the native title with nativeTitle", () => {
    const wrapper = mountAvatar({ nativeTitle: true });
    expect(wrapper.find(".container").attributes("title")).toBe("John Doe");
  });

  it("renders nothing until hovered", async () => {
    mountAvatar();
    expect(findTooltip()).toBeNull();
  });

  it("opens on hover after the delay and closes on leave", async () => {
    const wrapper = mountAvatar();
    const container = wrapper.find(".container");

    await container.trigger("mouseenter");
    expect(findTooltip()).toBeNull(); // still inside the open delay

    await settle();
    expect(findTooltip()).not.toBeNull();
    expect(openTooltip().textContent).toContain("John Doe");

    await container.trigger("mouseleave");
    await settle();
    expect(findTooltip()).toBeNull();
  });

  it("respects a custom open delay", async () => {
    const wrapper = mountAvatar({ tooltipDelay: 0 });
    await wrapper.find(".container").trigger("mouseenter");
    await nextTick();
    await nextTick();
    expect(findTooltip()).not.toBeNull();
  });

  it("uses the tooltip prop as content when given a string", async () => {
    const wrapper = mountAvatar({ tooltip: "Product Designer" });
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    expect(openTooltip().textContent).toContain("Product Designer");
  });

  it("renders nothing when tooltip is false", async () => {
    const wrapper = mountAvatar({ tooltip: false });
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    expect(findTooltip()).toBeNull();
  });

  it("renders nothing when tooltipDisabled is true", async () => {
    const wrapper = mountAvatar({ tooltipDisabled: true });
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    expect(findTooltip()).toBeNull();
  });

  it("takes options from an object tooltip prop", async () => {
    const wrapper = mountAvatar({
      tooltip: { content: "On leave", placement: "right", theme: "light" },
    });
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    const tooltip = openTooltip();
    expect(tooltip.textContent).toContain("On leave");
    expect(tooltip.classList.contains("va-tooltip--light")).toBe(true);
  });

  it("closes on Escape", async () => {
    const wrapper = mountAvatar();
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    expect(findTooltip()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await settle();
    expect(findTooltip()).toBeNull();
  });

  it("renders the tooltip slot with avatar context", async () => {
    const wrapper = mountAvatar(
      {},
      {
        slots: {
          tooltip: `<template #tooltip="{ initials }"><span class="rich">{{ initials }} card</span></template>`,
        },
      }
    );
    await wrapper.find(".container").trigger("mouseenter");
    await settle();
    expect(document.body.querySelector(".rich")?.textContent).toBe("JD card");
  });

  describe("aria-describedby", () => {
    it("is omitted when the tooltip only repeats the accessible label", async () => {
      const wrapper = mountAvatar({ alt: "John Doe" });
      await wrapper.find(".container").trigger("mouseenter");
      await settle();
      expect(
        wrapper.find(".container").attributes("aria-describedby")
      ).toBeUndefined();
    });

    it("is set when the tooltip adds information", async () => {
      const wrapper = mountAvatar({ tooltip: "Product Designer" });
      await wrapper.find(".container").trigger("mouseenter");
      await settle();

      const describedBy = wrapper.find(".container").attributes("aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(openTooltip().getAttribute("id")).toBe(describedBy);
    });

    it("is absent while the tooltip is closed", () => {
      const wrapper = mountAvatar({ tooltip: "Product Designer" });
      expect(
        wrapper.find(".container").attributes("aria-describedby")
      ).toBeUndefined();
    });
  });
});

describe("AvatarGroup overflow tooltip", () => {
  const groupOptions = {
    attachTo: document.body,
    props: { max: 2 },
    slots: {
      default: [
        `<Avatar name="Ada Lovelace" />`,
        `<Avatar name="Grace Hopper" />`,
        `<Avatar name="Alan Turing" />`,
        `<Avatar name="Katherine Johnson" />`,
      ].join(""),
    },
    global: { components: { Avatar } },
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    unmountAll();
    vi.useRealTimers();
  });

  it("drops the native title from the group root", () => {
    const wrapper = track(mount(AvatarGroup, groupOptions));
    expect(wrapper.find(".avatar-group").attributes("title")).toBeUndefined();
  });

  it("shows the hidden names on hovering the overflow badge", async () => {
    const wrapper = track(mount(AvatarGroup, groupOptions));
    await wrapper.find(".avatar-overflow").trigger("mouseenter");
    await settle();

    const tooltip = openTooltip();
    expect(tooltip.textContent).toContain("Alan Turing");
    expect(tooltip.textContent).toContain("Katherine Johnson");
  });

  it("restores native titles with nativeTitle", () => {
    const wrapper = track(
      mount(AvatarGroup, {
        ...groupOptions,
        props: { ...groupOptions.props, nativeTitle: true },
      })
    );
    expect(wrapper.find(".avatar-group").attributes("title")).toContain(
      "Ada Lovelace"
    );
    expect(wrapper.find(".avatar-overflow").attributes("title")).toContain(
      "Alan Turing"
    );
  });
});
