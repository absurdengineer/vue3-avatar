import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Avatar from "../src/components/Avatar.vue";
import type {
  AvatarFallbackPayload,
  AvatarImageSlotProps,
} from "../src/entry.esm";
import { payload } from "./helpers/emitted";

enableAutoUnmount(afterEach);

const PRIMARY = "https://example.com/profile.png";
const FALLBACK = "https://example.com/fallback.png";
const REPLACEMENT = "https://example.com/replacement.png";

type TestProps = Partial<InstanceType<typeof Avatar>["$props"]>;

function mountImageSlot(props: TestProps = {}) {
  let currentSlot!: AvatarImageSlotProps;
  const wrapper = mount(Avatar, {
    props: {
      name: "Ada Lovelace",
      tooltip: false,
      imageSrc: PRIMARY,
      ...props,
    },
    slots: {
      image: (slot: AvatarImageSlotProps) => {
        currentSlot = slot;
        return h("img", {
          "data-custom-image": "",
          src: slot.src,
          srcset: slot.srcset,
          sizes: slot.sizes,
          alt: slot.alt,
          width: slot.size,
          height: slot.size,
          style: slot.style,
          class: slot.class,
          onLoad: slot.onLoad,
          onError: slot.onError,
        });
      },
    },
  });

  return { wrapper, getSlot: () => currentSlot };
}

describe("Custom image slot lifecycle", () => {
  it("provides image bindings and clears the skeleton when load is forwarded", async () => {
    const { wrapper, getSlot } = mountImageSlot({
      size: 64,
      alt: "Ada's profile photo",
      srcset: `${PRIMARY} 1x, https://example.com/profile@2x.png 2x`,
      sizes: "64px",
    });
    await nextTick();

    const img = wrapper.get("[data-custom-image]");
    expect(img.attributes("src")).toBe(PRIMARY);
    expect(img.attributes("srcset")).toContain("profile@2x.png 2x");
    expect(img.attributes("sizes")).toBe("64px");
    expect(img.attributes("alt")).toBe("Ada's profile photo");
    expect(img.attributes("width")).toBe("64");
    expect(img.attributes("height")).toBe("64");
    expect(img.attributes("style")).toContain("border-radius: 50%");
    expect(img.classes()).toContain("image-transition");
    expect(img.classes()).not.toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    expect(getSlot().onLoad).toBeTypeOf("function");
    expect(getSlot().onError).toBeTypeOf("function");

    const event = new Event("load");
    img.element.dispatchEvent(event);
    await nextTick();

    expect(img.classes()).toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
    expect(wrapper.emitted("load")).toEqual([[event]]);
  });

  it.each(["initials", "pixel"] as const)(
    "advances fallbacks and renders %s only after exhaustion",
    async (variant) => {
      const { wrapper, getSlot } = mountImageSlot({
        fallbackSrc: [FALLBACK, REPLACEMENT],
        variant,
      });
      await nextTick();

      const firstError = new Event("error");
      wrapper.get("img").element.dispatchEvent(firstError);
      await nextTick();

      expect(wrapper.get("img").attributes("src")).toBe(FALLBACK);
      expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
      expect(payload<AvatarFallbackPayload>(wrapper, "fallback")).toEqual({
        failedSrc: PRIMARY,
        nextSrc: FALLBACK,
        remaining: 1,
        event: firstError,
      });
      expect(wrapper.emitted("error")).toBeUndefined();

      const secondError = new Event("error");
      wrapper.get("img").element.dispatchEvent(secondError);
      await nextTick();

      expect(wrapper.get("img").attributes("src")).toBe(REPLACEMENT);
      expect(payload<AvatarFallbackPayload>(wrapper, "fallback", 1)).toEqual({
        failedSrc: FALLBACK,
        nextSrc: REPLACEMENT,
        remaining: 0,
        event: secondError,
      });

      const lastSlot = getSlot();
      const lastError = new Event("error");
      wrapper.get("img").element.dispatchEvent(lastError);
      await nextTick();

      expect(wrapper.find("img").exists()).toBe(false);
      expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
      expect(wrapper.emitted("error")).toEqual([[lastError]]);
      if (variant === "initials") expect(wrapper.get(".avatar").text()).toBe("AL");
      else expect(wrapper.find(".avatar-pixel svg").exists()).toBe(true);

      // Custom components can finish asynchronous work after being removed.
      lastSlot.onLoad(new Event("load"));
      lastSlot.onError(new Event("error"));
      await nextTick();

      expect(wrapper.emitted("load")).toBeUndefined();
      expect(wrapper.emitted("error")).toHaveLength(1);
      expect(wrapper.emitted("fallback")).toHaveLength(2);
      expect(wrapper.find("img").exists()).toBe(false);
    }
  );

  it("ignores captured callbacks from an earlier request even when its URL is reused", async () => {
    const { wrapper, getSlot } = mountImageSlot({ fallbackSrc: FALLBACK });
    const originalSlot = getSlot();

    await wrapper.setProps({ imageSrc: REPLACEMENT });
    await wrapper.setProps({ imageSrc: PRIMARY });

    originalSlot.onLoad(new Event("load"));
    originalSlot.onError(new Event("error"));
    await nextTick();

    expect(wrapper.get("img").attributes("src")).toBe(PRIMARY);
    expect(wrapper.get("img").classes()).not.toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    expect(wrapper.emitted("load")).toBeUndefined();
    expect(wrapper.emitted("fallback")).toBeUndefined();
    expect(wrapper.emitted("error")).toBeUndefined();

    await wrapper.get("img").trigger("load");

    expect(wrapper.get("img").classes()).toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
    expect(wrapper.emitted("load")).toHaveLength(1);
  });

  it("ignores late primary callbacks while its fallback is loading", async () => {
    const { wrapper, getSlot } = mountImageSlot({ fallbackSrc: FALLBACK });
    const primarySlot = getSlot();

    await wrapper.get("img").trigger("error");
    primarySlot.onLoad(new Event("load"));
    primarySlot.onError(new Event("error"));
    await nextTick();

    expect(wrapper.get("img").attributes("src")).toBe(FALLBACK);
    expect(wrapper.get("img").classes()).not.toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    expect(wrapper.emitted("load")).toBeUndefined();
    expect(wrapper.emitted("error")).toBeUndefined();
    expect(wrapper.emitted("fallback")).toHaveLength(1);

    await wrapper.get("img").trigger("load");

    expect(wrapper.get("img").classes()).toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
  });

  it("remounts custom images for new sources and fallback attempts", async () => {
    const { wrapper } = mountImageSlot({ fallbackSrc: FALLBACK });
    const firstImage = wrapper.get("img").element;

    await wrapper.setProps({ imageSrc: REPLACEMENT });
    const replacementImage = wrapper.get("img").element;

    expect(replacementImage).not.toBe(firstImage);
    expect(wrapper.get("img").attributes("src")).toBe(REPLACEMENT);

    await wrapper.get("img").trigger("error");

    expect(wrapper.get("img").element).not.toBe(replacementImage);
    expect(wrapper.get("img").attributes("src")).toBe(FALLBACK);
  });

  it("preserves a loaded custom image when only presentation props change", async () => {
    const { wrapper } = mountImageSlot();
    await wrapper.get("img").trigger("load");
    const image = wrapper.get("img").element;

    await wrapper.setProps({ name: "Grace Hopper", size: 56, transition: false });

    expect(wrapper.get("img").element).toBe(image);
    expect(wrapper.get("img").classes()).toContain("image-loaded");
    expect(wrapper.get("img").classes()).not.toContain("image-transition");
    expect(wrapper.get("img").attributes("width")).toBe("56");
    expect(wrapper.get("img").attributes("alt")).toBe("Avatar of Grace Hopper");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
    expect(wrapper.emitted("load")).toHaveLength(1);
  });
});
