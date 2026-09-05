import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import { AvatarConfigKey } from "../src/utils/config";
import type { VueWrapper } from "@vue/test-utils";

const mountAvatar = (props = {}, options = {}) =>
  mount(Avatar, { props: { name: "John Doe", ...props }, ...options });

const statusStyle = (wrapper: VueWrapper<any>) =>
  wrapper.find(".status-indicator").attributes("style");

describe("Status colours", () => {
  it.each([
    ["online", "rgb(34, 197, 94)"],
    ["away", "rgb(245, 158, 11)"],
    ["busy", "rgb(239, 68, 68)"],
    ["offline", "rgb(156, 163, 175)"],
  ])("uses the %s token", (status, rgb) => {
    expect(statusStyle(mountAvatar({ status }))).toContain(
      `background-color: ${rgb}`
    );
  });

  it("falls back to the offline grey for an unknown status", () => {
    expect(statusStyle(mountAvatar({ status: "in-meeting" }))).toContain(
      "background-color: rgb(156, 163, 175)"
    );
  });

  it("lets statusColor win outright", () => {
    const wrapper = mountAvatar({ status: "online", statusColor: "#123456" });
    expect(statusStyle(wrapper)).toContain("background-color: rgb(18, 52, 86)");
  });

  it("resolves a custom status through the statusColors map", () => {
    const wrapper = mountAvatar({
      status: "in-meeting",
      statusColors: { "in-meeting": "#7c3aed" },
    });
    expect(statusStyle(wrapper)).toContain("background-color: rgb(124, 58, 237)");
  });

  it("reads statusColors from the global config", () => {
    const wrapper = mountAvatar(
      { status: "in-meeting" },
      {
        global: {
          provide: { [AvatarConfigKey]: { statusColors: { "in-meeting": "#7c3aed" } } },
        },
      }
    );
    expect(statusStyle(wrapper)).toContain("background-color: rgb(124, 58, 237)");
  });

  it("lets a local statusColors entry override the global one", () => {
    const wrapper = mountAvatar(
      { status: "in-meeting", statusColors: { "in-meeting": "#000000" } },
      {
        global: {
          provide: { [AvatarConfigKey]: { statusColors: { "in-meeting": "#7c3aed" } } },
        },
      }
    );
    expect(statusStyle(wrapper)).toContain("background-color: rgb(0, 0, 0)");
  });

  it("exposes the status colour and size as CSS variables", () => {
    const style = mountAvatar({ status: "online" })
      .find(".container")
      .attributes("style");
    expect(style).toContain("--va-status-color: #22c55e");
    expect(style).toContain("--va-status-size: 10px");
  });
});

describe("Status sizing", () => {
  it.each([
    ["sm", "8px"],
    ["md", "10px"],
    ["lg", "13.333333333333334px"],
  ])("supports the %s preset", (statusSize, expected) => {
    const style = statusStyle(mountAvatar({ status: "online", statusSize }));
    expect(style).toContain(`width: ${expected}`);
  });

  it("accepts an explicit pixel size", () => {
    const style = statusStyle(mountAvatar({ status: "online", statusSize: 6 }));
    expect(style).toContain("width: 6px");
  });

  it("scales with the avatar size", () => {
    const style = statusStyle(mountAvatar({ status: "online", size: 80 }));
    expect(style).toContain("width: 20px");
  });
});

describe("Status labels", () => {
  it("uses statusLabel in the accessible label", () => {
    const wrapper = mountAvatar({
      status: "away",
      statusLabel: "Back at 3pm",
    });
    expect(wrapper.find(".container").attributes("aria-label")).toBe(
      "Avatar of John Doe. Back at 3pm"
    );
  });

  it("falls back to the generated status sentence", () => {
    const wrapper = mountAvatar({ status: "away" });
    expect(wrapper.find(".container").attributes("aria-label")).toBe(
      "Avatar of John Doe. User is away"
    );
  });

  it("adds a pulse class only when asked", () => {
    expect(
      mountAvatar({ status: "online" }).find(".status-indicator").classes()
    ).not.toContain("status-pulse");
    expect(
      mountAvatar({ status: "online", statusPulse: true })
        .find(".status-indicator")
        .classes()
    ).toContain("status-pulse");
  });
});

describe("Badge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing by default", () => {
    expect(mountAvatar().find(".avatar-badge").exists()).toBe(false);
  });

  it("renders a count", () => {
    const wrapper = mountAvatar({ badge: 3 });
    expect(wrapper.find(".avatar-badge").text()).toBe("3");
  });

  it("clamps counts above badgeMax", () => {
    expect(mountAvatar({ badge: 1200 }).find(".avatar-badge").text()).toBe(
      "999+"
    );
    expect(
      mountAvatar({ badge: 1200, badgeMax: 9 }).find(".avatar-badge").text()
    ).toBe("9+");
  });

  it.each([1, 9, 42, 999])("leaves the count %s alone", (badge) => {
    expect(mountAvatar({ badge }).find(".avatar-badge").text()).toBe(
      String(badge)
    );
  });

  it("clamps a digit string the same way as a number", () => {
    // `badge="1200"` and `badge={1200}` must agree; otherwise the string form
    // slips past the cap as if it were a label.
    expect(mountAvatar({ badge: "1200" }).find(".avatar-badge").text()).toBe(
      "999+"
    );
  });

  it("keeps a three-letter label whole", () => {
    expect(mountAvatar({ badge: "PRO" }).find(".avatar-badge").text()).toBe(
      "PRO"
    );
  });

  it("renders an empty dot variant without a value", () => {
    const badge = mountAvatar({ badgeVariant: "dot" }).find(".avatar-badge");
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe("");
  });

  it("picks a readable text colour for a light badge", () => {
    const style = mountAvatar({ badge: 1, badgeColor: "#ffffff" })
      .find(".avatar-badge")
      .attributes("style");
    expect(style).toContain("color: rgb(0, 0, 0)");
  });

  it("honours an explicit badgeTextColor", () => {
    const style = mountAvatar({
      badge: 1,
      badgeColor: "#ffffff",
      badgeTextColor: "#ff0000",
    })
      .find(".avatar-badge")
      .attributes("style");
    expect(style).toContain("color: rgb(255, 0, 0)");
  });

  it("positions the badge in the requested corner", () => {
    const style = mountAvatar({ badge: 1, badgePosition: "bottom-left" })
      .find(".avatar-badge")
      .attributes("style");
    // 40 * 0.03 for a circle: a badge sits further out than the status dot.
    expect(style).toContain("bottom: 1px");
    expect(style).toContain("left: 1px");
  });

  it("sits further out than the status dot", () => {
    const wrapper = mountAvatar({
      badge: 1,
      badgePosition: "top-right",
      status: "online",
      statusPosition: "bottom-right",
      size: 200,
    });

    const badge = wrapper.find(".avatar-badge").attributes("style") ?? "";
    const dot = wrapper.find(".status-indicator").attributes("style") ?? "";

    // A round dot reads best tucked onto the outline; a wide pill pulled in by
    // the same amount drifts towards the middle of the face.
    expect(badge).toContain("right: 6px");
    expect(dot).toContain("right: 14px");
  });

  it.each([
    ["square", 0],
    ["squircle", 3],
    ["circle", 6],
    ["hexagon", 11],
  ])("insets a badge on %s by %spx at size 200", (shape, inset) => {
    const style = mountAvatar({ badge: 1, shape, size: 200 })
      .find(".avatar-badge")
      .attributes("style");
    expect(style).toContain(`right: ${inset}px`);
  });

  it("is hidden from screen readers and described by the label instead", () => {
    const wrapper = mountAvatar({ badge: 3 });
    expect(wrapper.find(".avatar-badge").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find(".container").attributes("aria-label")).toBe(
      "Avatar of John Doe. 3 notifications"
    );
  });

  it("uses badgeLabel when given", () => {
    const wrapper = mountAvatar({ badge: 3, badgeLabel: "3 unread messages" });
    expect(wrapper.find(".container").attributes("aria-label")).toBe(
      "Avatar of John Doe. 3 unread messages"
    );
  });

  describe("long labels", () => {
    it.each([
      ["Promotional", "Pro"],
      ["Very Long Promotional Label", "Ver"],
      ["NEW", "NEW"],
      ["v2", "v2"],
      ["", ""],
    ])("renders %s as %s", (badge, expected) => {
      expect(mountAvatar({ badge }).find(".avatar-badge").text()).toBe(expected);
    });

    it("honours a custom badgeMaxLength", () => {
      expect(
        mountAvatar({ badge: "Promotional", badgeMaxLength: 5 })
          .find(".avatar-badge")
          .text()
      ).toBe("Promo");
    });

    it("treats badgeMaxLength of 0 as no letters", () => {
      expect(
        mountAvatar({ badge: "Promotional", badgeMaxLength: 0 })
          .find(".avatar-badge")
          .text()
      ).toBe("");
    });

    // Regression: a label badge is corner-anchored and grows towards the middle,
    // so before the caps "Promotional" rendered 166% of the avatar's width and
    // spilled out the far side, straight across the initials.
    it("never grows wider than the avatar", () => {
      const style = mountAvatar({ badge: "Promotional", size: 96 })
        .find(".avatar-badge")
        .attributes("style");
      expect(style).toContain("max-width: 96px");
    });

    it("scales the cap with the avatar", () => {
      const style = mountAvatar({ badge: "Promotional", size: 200 })
        .find(".avatar-badge")
        .attributes("style");
      expect(style).toContain("max-width: 200px");
    });

    it("puts the label in its own box so it can still truncate", () => {
      // The character cap does the work, but a wide-glyph label at a large
      // size can still overrun; the CSS ellipsis is the backstop.
      const wrapper = mountAvatar({ badge: "Promotional" });
      const label = wrapper.find(".avatar-badge .avatar-badge__label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe("Pro");
    });

    it("leaves the dot variant uncapped, since it holds no text", () => {
      const style = mountAvatar({ badgeVariant: "dot" })
        .find(".avatar-badge")
        .attributes("style");
      expect(style).not.toContain("max-width");
    });

    it("uses one type scale for counts and labels alike", () => {
      // Both are short now, so there is no reason for them to differ.
      const label = mountAvatar({ badge: "PRO", size: 96 })
        .find(".avatar-badge")
        .attributes("style");
      const count = mountAvatar({ badge: 3, size: 96 })
        .find(".avatar-badge")
        .attributes("style");

      expect(label).toContain(`font-size: ${96 / 5.5}px`);
      expect(count).toContain(`font-size: ${96 / 5.5}px`);
      expect(label).toContain(`height: ${96 / 3.6}px`);
      expect(count).toContain(`height: ${96 / 3.6}px`);
    });

    it("still lets customBadgeStyle override the cap", () => {
      const style = mountAvatar({
        badge: "Promotional",
        size: 96,
        customBadgeStyle: { maxWidth: "300px" },
      })
        .find(".avatar-badge")
        .attributes("style");
      expect(style).toContain("max-width: 300px");
    });
  });

  it("renders the badge slot", () => {
    const wrapper = mountAvatar(
      {},
      { slots: { badge: '<span class="custom">!</span>' } }
    );
    expect(wrapper.find(".avatar-badge .custom").exists()).toBe(true);
  });

  it("warns when the badge and status share a corner", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({
      badge: 1,
      status: "online",
      badgePosition: "top-right",
      statusPosition: "top-right",
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("badgePosition and statusPosition")
    );
  });

  it("does not warn when they sit in different corners", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mountAvatar({
      badge: 1,
      status: "online",
      badgePosition: "top-right",
      statusPosition: "bottom-right",
    });
    expect(warn).not.toHaveBeenCalled();
  });
});
