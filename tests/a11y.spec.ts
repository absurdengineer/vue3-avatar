import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import { payload } from "./helpers/emitted";
import type { AvatarFileSelectPayload } from "../src/types";

const mountAvatar = (props = {}, options = {}) =>
  mount(Avatar, { props: { name: "John Doe", ...props }, ...options });

describe("Root element (`as`)", () => {
  it("stays a div by default", () => {
    const wrapper = mountAvatar();
    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.find(".container").attributes("role")).toBe("img");
  });

  it("renders a real button", () => {
    const wrapper = mountAvatar({ as: "button" });
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    // Native semantics replace the ARIA patch-up the div needs.
    expect(wrapper.attributes("role")).toBeUndefined();
    expect(wrapper.attributes("tabindex")).toBeUndefined();
  });

  it("renders a link with href", () => {
    const wrapper = mountAvatar({ as: "a", href: "/users/john" });
    expect(wrapper.element.tagName).toBe("A");
    expect(wrapper.attributes("href")).toBe("/users/john");
  });

  it("adds rel=noopener noreferrer for target=_blank", () => {
    const wrapper = mountAvatar({
      as: "a",
      href: "https://example.com",
      target: "_blank",
    });
    expect(wrapper.attributes("rel")).toBe("noopener noreferrer");
  });

  it("lets an explicit rel win", () => {
    const wrapper = mountAvatar({
      as: "a",
      href: "https://example.com",
      target: "_blank",
      rel: "nofollow",
    });
    expect(wrapper.attributes("rel")).toBe("nofollow");
  });

  it("leaves rel off for same-tab links", () => {
    const wrapper = mountAvatar({ as: "a", href: "/users/john" });
    expect(wrapper.attributes("rel")).toBeUndefined();
  });

  it("does not fire the handler twice on Enter for a native button", async () => {
    const onClick = vi.fn();
    const wrapper = mountAvatar({ as: "button", onClick });

    // A real browser turns Enter on a button into a click; jsdom does not, so
    // this asserts the keydown handler is absent rather than counting both.
    await wrapper.trigger("keydown.enter");
    expect(onClick).not.toHaveBeenCalled();

    await wrapper.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("still handles keyboard activation on a div", async () => {
    const onClick = vi.fn();
    const wrapper = mountAvatar({ onClick });
    await wrapper.trigger("keydown.enter");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Disabled", () => {
  it("blocks activation", async () => {
    const onClick = vi.fn();
    const wrapper = mountAvatar({ onClick, interactive: true, disabled: true });

    await wrapper.trigger("click");
    await wrapper.trigger("keydown.enter");

    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper.emitted("activate")).toBeUndefined();
  });

  it("marks a div with aria-disabled and drops it from the tab order", () => {
    const wrapper = mountAvatar({ interactive: true, disabled: true });
    expect(wrapper.attributes("aria-disabled")).toBe("true");
    expect(wrapper.attributes("tabindex")).toBeUndefined();
  });

  it("uses the native disabled attribute on a button", () => {
    const wrapper = mountAvatar({ as: "button", disabled: true });
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("removes the href from a disabled link", () => {
    const wrapper = mountAvatar({ as: "a", href: "/x", disabled: true });
    expect(wrapper.attributes("href")).toBeUndefined();
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });

  it("drops the clickable class", () => {
    expect(mountAvatar({ interactive: true }).classes()).toContain(
      "is-clickable"
    );
    expect(
      mountAvatar({ interactive: true, disabled: true }).classes()
    ).not.toContain("is-clickable");
  });
});

describe("Selected", () => {
  it("stays out of the markup when unset", () => {
    expect(mountAvatar().attributes("aria-pressed")).toBeUndefined();
  });

  it("reports both toggle states once opted in", () => {
    expect(mountAvatar({ selected: true }).attributes("aria-pressed")).toBe(
      "true"
    );
    expect(mountAvatar({ selected: false }).attributes("aria-pressed")).toBe(
      "false"
    );
  });

  it("adds a selection class only when pressed", () => {
    expect(mountAvatar({ selected: true }).classes()).toContain("is-selected");
    expect(mountAvatar({ selected: false }).classes()).not.toContain(
      "is-selected"
    );
  });
});

describe("Editable", () => {
  it("renders nothing by default", () => {
    expect(mountAvatar().find(".avatar-edit").exists()).toBe(false);
  });

  it("renders a labelled overlay button", () => {
    const wrapper = mountAvatar({ editable: true });
    const button = wrapper.find(".avatar-edit");
    expect(button.exists()).toBe(true);
    expect(button.attributes("aria-label")).toBe("Change picture");
  });

  it("accepts a custom label", () => {
    const wrapper = mountAvatar({ editable: true, editLabel: "Upload photo" });
    expect(wrapper.find(".avatar-edit").attributes("aria-label")).toBe(
      "Upload photo"
    );
  });

  it("emits edit without swallowing it into the avatar's own click", async () => {
    const onClick = vi.fn();
    const wrapper = mountAvatar({ editable: true, onClick });

    await wrapper.find(".avatar-edit").trigger("click");

    expect(wrapper.emitted("edit")).toHaveLength(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the edit-overlay slot", () => {
    const wrapper = mountAvatar(
      { editable: true },
      { slots: { "edit-overlay": '<span class="pencil">edit</span>' } }
    );
    expect(wrapper.find(".avatar-edit .pencil").exists()).toBe(true);
  });

  it("adds a file input only when accept is set", () => {
    expect(mountAvatar({ editable: true }).find("input[type=file]").exists()).toBe(
      false
    );
    const wrapper = mountAvatar({ editable: true, accept: "image/*" });
    expect(wrapper.find("input[type=file]").attributes("accept")).toBe("image/*");
  });

  it("opens the file picker from the overlay button", async () => {
    const wrapper = mountAvatar({ editable: true, accept: "image/*" });
    const input = wrapper.find("input[type=file]").element as HTMLInputElement;
    const click = vi.spyOn(input, "click").mockImplementation(() => {});

    await wrapper.find(".avatar-edit").trigger("click");
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("emits file-select with the chosen files", async () => {
    const wrapper = mountAvatar({ editable: true, accept: "image/*" });
    const input = wrapper.find("input[type=file]");

    await input.trigger("change");

    const selected = payload<AvatarFileSelectPayload>(wrapper, "file-select");
    expect(selected.files).toBe((input.element as HTMLInputElement).files);
  });

  it("does not emit edit while disabled", async () => {
    const wrapper = mountAvatar({ editable: true, disabled: true });
    await wrapper.find(".avatar-edit").trigger("click");
    expect(wrapper.emitted("edit")).toBeUndefined();
  });
});
