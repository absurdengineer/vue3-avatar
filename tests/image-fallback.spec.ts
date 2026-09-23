import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, reactive } from "vue";
import Avatar from "../src/components/Avatar.vue";
import { payload } from "./helpers/emitted";
import type { AvatarFallbackPayload } from "../src/types";

const IMG = "https://example.com/avatar.png";

describe("Image state resets", () => {
  it("retries when imageSrc changes after an error", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://example.com/broken.png",
      },
    });

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("JD");

    await wrapper.setProps({ imageSrc: "https://example.com/working.png" });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/working.png");
  });

  it("clears the loaded flag when imageSrc changes", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: "https://example.com/a.png" },
    });

    await wrapper.find("img").trigger("load");
    expect(wrapper.find("img").classes()).toContain("image-loaded");

    await wrapper.setProps({ imageSrc: "https://example.com/b.png" });
    expect(wrapper.find("img").classes()).not.toContain("image-loaded");
  });
});

describe("Fallback chain", () => {
  it("moves to the next source instead of giving up", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://example.com/one.png",
        fallbackSrc: [
          "https://example.com/two.png",
          "https://example.com/three.png",
        ],
      },
    });

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/two.png"
    );

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/three.png"
    );

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("JD");
  });

  it("accepts a single string fallback", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://example.com/one.png",
        fallbackSrc: "https://example.com/two.png",
      },
    });

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/two.png"
    );
  });

  it("emits fallback while sources remain and error only once exhausted", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://example.com/one.png",
        fallbackSrc: ["https://example.com/two.png"],
      },
    });

    await wrapper.find("img").trigger("error");
    expect(wrapper.emitted("error")).toBeUndefined();
    const first = payload<AvatarFallbackPayload>(wrapper, "fallback");
    expect(first.failedSrc).toBe("https://example.com/one.png");
    expect(first.nextSrc).toBe("https://example.com/two.png");
    expect(first.remaining).toBe(0);

    await wrapper.find("img").trigger("error");
    expect(wrapper.emitted("error")).toHaveLength(1);
    expect(wrapper.emitted("fallback")).toHaveLength(1);
  });

  it("restarts the chain when imageSrc changes", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://example.com/one.png",
        fallbackSrc: ["https://example.com/two.png"],
      },
    });

    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/two.png"
    );

    await wrapper.setProps({ imageSrc: "https://example.com/fresh.png" });
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://example.com/fresh.png"
    );
  });

  it("retries a changed fallback chain after every source failed", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG, fallbackSrc: "broken.png" },
    });
    await wrapper.find("img").trigger("error");
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);

    await wrapper.setProps({ fallbackSrc: "replacement.png" });
    expect(wrapper.find("img").attributes("src")).toBe(IMG);
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe("replacement.png");
    await wrapper.find("img").trigger("load");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
    expect(wrapper.emitted("error")).toHaveLength(1);
  });

  it("clears loaded state when a loaded fallback is replaced", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG, fallbackSrc: "fallback.png" },
    });
    await wrapper.find("img").trigger("error");
    await wrapper.find("img").trigger("load");
    expect(wrapper.find("img").classes()).toContain("image-loaded");

    await wrapper.setProps({ fallbackSrc: "replacement.png" });
    expect(wrapper.find("img").classes()).not.toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    expect(wrapper.find("img").attributes("src")).toBe(IMG);
  });

  it("retries after an in-place reactive fallback-array update", async () => {
    const fallbackSrc = reactive(["broken.png"]);
    const wrapper = mount({
      render: () => h(Avatar, { name: "John Doe", fallbackSrc }),
    });
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);

    fallbackSrc.push("replacement.png");
    await nextTick();
    expect(wrapper.find("img").attributes("src")).toBe("broken.png");
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe("replacement.png");
  });

  it("preserves a loaded fallback when a new array has the same sources", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG, fallbackSrc: ["fallback.png"] },
    });
    await wrapper.find("img").trigger("error");
    await wrapper.find("img").trigger("load");
    const loadedImage = wrapper.find("img").element;

    await wrapper.setProps({ fallbackSrc: ["fallback.png"] });
    expect(wrapper.find("img").element).toBe(loadedImage);
    expect(wrapper.find("img").attributes("src")).toBe("fallback.png");
    expect(wrapper.find("img").classes()).toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
    expect(wrapper.emitted("load")).toHaveLength(1);
  });

  it("recovers when a fallback-only avatar gets a replacement source", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", fallbackSrc: "broken.png" },
    });
    await wrapper.find("img").trigger("error");
    expect(wrapper.text()).toBe("JD");

    await wrapper.setProps({ fallbackSrc: "replacement.png" });
    expect(wrapper.find("img").attributes("src")).toBe("replacement.png");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
  });

  it("ignores native load and error events from a replaced image", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG, fallbackSrc: "fallback.png" },
    });
    const oldImage = wrapper.find("img").element;

    await wrapper.setProps({ imageSrc: "replacement.png" });
    oldImage.dispatchEvent(new Event("load"));
    oldImage.dispatchEvent(new Event("error"));
    await nextTick();

    expect(wrapper.find("img").attributes("src")).toBe("replacement.png");
    expect(wrapper.find("img").classes()).not.toContain("image-loaded");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
    expect(wrapper.emitted("load")).toBeUndefined();
    expect(wrapper.emitted("fallback")).toBeUndefined();
    expect(wrapper.emitted("error")).toBeUndefined();

    await wrapper.find("img").trigger("load");
    expect(wrapper.find("img").classes()).toContain("image-loaded");
    expect(wrapper.emitted("load")).toHaveLength(1);
  });
});

describe("Image attributes", () => {
  it("passes srcset, sizes and the loading hints through", () => {
    const img = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: IMG,
        srcset: "a.png 1x, b.png 2x",
        sizes: "40px",
        crossorigin: "anonymous",
        referrerpolicy: "no-referrer",
      },
    }).find("img");

    expect(img.attributes("srcset")).toBe("a.png 1x, b.png 2x");
    expect(img.attributes("sizes")).toBe("40px");
    expect(img.attributes("crossorigin")).toBe("anonymous");
    expect(img.attributes("referrerpolicy")).toBe("no-referrer");
    expect(img.attributes("decoding")).toBe("async");
  });

  it("omits the optional attributes when unset", () => {
    const img = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG },
    }).find("img");
    expect(img.attributes("srcset")).toBeUndefined();
    expect(img.attributes("crossorigin")).toBeUndefined();
  });

  it("derives an @2x srcset from retina", () => {
    const img = mount(Avatar, {
      props: { name: "John Doe", imageSrc: "https://cdn.test/pic.png", retina: true },
    }).find("img");
    expect(img.attributes("srcset")).toBe(
      "https://cdn.test/pic.png 1x, https://cdn.test/pic@2x.png 2x"
    );
  });

  it("keeps the query string on the retina variant", () => {
    const img = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://cdn.test/pic.png?v=2",
        retina: true,
      },
    }).find("img");
    expect(img.attributes("srcset")).toBe(
      "https://cdn.test/pic.png?v=2 1x, https://cdn.test/pic@2x.png?v=2 2x"
    );
  });

  it("lets an explicit srcset beat retina", () => {
    const img = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: "https://cdn.test/pic.png",
        retina: true,
        srcset: "custom.png 2x",
      },
    }).find("img");
    expect(img.attributes("srcset")).toBe("custom.png 2x");
  });

  it("does not reuse the primary srcset after advancing to a fallback", async () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        imageSrc: IMG,
        srcset: "primary-small.png 1x, primary-large.png 2x",
        fallbackSrc: "fallback.png",
      },
    });
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").attributes("src")).toBe("fallback.png");
    expect(wrapper.find("img").attributes("srcset")).toBeUndefined();

    await wrapper.setProps({ imageSrc: "replacement.png" });
    expect(wrapper.find("img").attributes("srcset")).toBe(
      "primary-small.png 1x, primary-large.png 2x"
    );
  });
});

describe("Skeleton", () => {
  it("shows while the image is loading and clears once it paints", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG },
    });
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);

    await nextTick();
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);

    await wrapper.find("img").trigger("load");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
  });

  it("is absent when there is no image to wait for", () => {
    const wrapper = mount(Avatar, { props: { name: "John Doe" } });
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
  });

  it("can be turned off", () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG, skeleton: false },
    });
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);
  });

  it("comes back when a new source starts loading", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG },
    });
    await wrapper.find("img").trigger("load");
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(false);

    await wrapper.setProps({ imageSrc: "https://example.com/next.png" });
    expect(wrapper.find(".avatar-skeleton").exists()).toBe(true);
  });

  it("is hidden from assistive technology", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "John Doe", imageSrc: IMG },
    });
    await nextTick();
    expect(wrapper.find(".avatar-skeleton").attributes("aria-hidden")).toBe(
      "true"
    );
  });
});
