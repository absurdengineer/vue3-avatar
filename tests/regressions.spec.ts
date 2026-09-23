import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";
import { emissions } from "./helpers/emitted";

/**
 * One test per defect found in the v5 review, named after the behaviour that
 * was wrong. These are the cases that were reproduced by hand first, so they
 * are the ones most likely to regress silently.
 */
describe("Regressions", () => {
  describe("listener composition", () => {
    it("keeps the avatar's own click handler when the tooltip also wants clicks", async () => {
      const onClick = vi.fn();
      const wrapper = mount(Avatar, {
        props: {
          name: "Ada Lovelace",
          tooltipTrigger: "click",
          interactive: true,
          onClick,
        },
      });

      await wrapper.find(".container").trigger("click");

      // The tooltip's onClick used to be spread last and win outright.
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(emissions(wrapper, "activate")).toHaveLength(1);
    });

    it("still opens the tooltip on the shared click", async () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "Ada Lovelace",
          tooltip: "Countess of Lovelace",
          tooltipTrigger: "click",
          onClick: () => {},
        },
        attachTo: document.body,
      });

      await wrapper.find(".container").trigger("click");
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.querySelector(".va-tooltip")).not.toBeNull();
      wrapper.unmount();
    });
  });

  describe("editable roots", () => {
    it("does not claim role=img while hosting the edit control", () => {
      const wrapper = mount(Avatar, {
        props: { name: "Ada Lovelace", editable: true },
      });
      // Children of role="img" are presentational, which hid the edit button.
      expect(wrapper.find(".container").attributes("role")).not.toBe("img");
      expect(wrapper.find("button.avatar-edit").exists()).toBe(true);
    });

    it("keeps role=img on a plain avatar", () => {
      const wrapper = mount(Avatar, { props: { name: "Ada Lovelace" } });
      expect(wrapper.find(".container").attributes("role")).toBe("img");
    });

    it.each(["button", "a"] as const)(
      "does not nest an interactive overlay inside an %s root",
      (as) => {
        const wrapper = mount(Avatar, {
          props: { name: "Ada Lovelace", as, href: "/profile", editable: true },
        });
        expect(wrapper.findAll("button")).toHaveLength(as === "button" ? 1 : 0);
        expect(wrapper.find("span.avatar-edit").exists()).toBe(true);
        expect(wrapper.find(".avatar-edit").attributes("aria-hidden")).toBe(
          "true"
        );
      }
    );

    it("edits from the root's own activation when the root is native", async () => {
      const wrapper = mount(Avatar, {
        props: { name: "Ada Lovelace", as: "button", editable: true },
      });
      await wrapper.find(".container").trigger("click");
      expect(emissions(wrapper, "edit")).toHaveLength(1);
    });

    it("hides the file input from the keyboard", () => {
      const wrapper = mount(Avatar, {
        props: { name: "Ada Lovelace", editable: true, accept: "image/*" },
      });
      const input = wrapper.find("input[type=file]");
      expect(input.attributes("tabindex")).toBe("-1");
      expect(input.attributes("aria-hidden")).toBe("true");
    });

    it("clears the file input so the same file can be picked twice", async () => {
      const wrapper = mount(Avatar, {
        props: { name: "Ada Lovelace", editable: true, accept: "image/*" },
      });
      const input = wrapper.find("input[type=file]");
      await input.trigger("change");

      expect(emissions(wrapper, "file-select")).toHaveLength(1);
      expect((input.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("AvatarGroup", () => {
    it("normalises activation keys the way Avatar does", async () => {
      const onClick = vi.fn();
      const wrapper = mount(AvatarGroup, {
        props: { onClick },
        slots: { default: '<div class="child"></div>' },
      });

      await wrapper.find(".avatar-group").trigger("keydown", { key: "enter" });
      await wrapper.find(".avatar-group").trigger("keydown", { key: "space" });

      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("gives its focusable root a focus ring", () => {
      // A focusable element with no visible focus state is the defect this
      // fixes, and it lives in CSS, so the stylesheet is what gets asserted.
      const source = readFileSync(
        resolve(process.cwd(), "src/components/AvatarGroup.vue"),
        "utf8"
      );
      expect(source).toContain(".avatar-group:focus-visible");
      expect(source).toContain("var(--va-focus-ring");
    });
  });
});
