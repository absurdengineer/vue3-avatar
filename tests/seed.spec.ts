import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "@vue/server-renderer";
import Avatar from "../src/components/Avatar.vue";

enableAutoUnmount(afterEach);

type TestProps = Partial<InstanceType<typeof Avatar>["$props"]>;

const mountAvatar = (props: TestProps = {}) =>
  mount(Avatar, {
    props: { name: "Ada Lovelace", tooltip: false, ...props },
  });

// Compare the generated appearance independently of initials and font size.
const appearance = (wrapper: VueWrapper<any>) => {
  const root = wrapper.find<HTMLElement>(".container").element;
  const svg = wrapper.find("svg");
  return {
    background: root.style.getPropertyValue("--va-bg"),
    color: root.style.getPropertyValue("--va-color"),
    border: root.style.getPropertyValue("--va-border-color"),
    pixels: svg.exists() ? svg.html() : undefined,
  };
};

const modes: { label: string; props: TestProps }[] = [
  { label: "light colors", props: {} },
  { label: "dark colors", props: { dark: true } },
  { label: "gradient colors", props: { gradient: true } },
  { label: "legacy colors", props: { useLegacyColors: true } },
  { label: "pixel art", props: { variant: "pixel" } },
];

describe("Stable avatar seeds", () => {
  it.each(modes)(
    "keeps $label stable on rename and reacts to changing or removing the seed",
    async ({ props }) => {
      const wrapper = mountAvatar({
        ...props,
        seed: "account-42",
        nativeTitle: true,
      });
      const original = appearance(wrapper);
      expect(original).toEqual(
        appearance(mountAvatar({ ...props, name: "account-42" }))
      );
      expect(wrapper.attributes("seed")).toBeUndefined();

      await wrapper.setProps({ name: "Grace Hopper" });

      expect(appearance(wrapper)).toEqual(original);
      expect(wrapper.attributes("aria-label")).toBe("Avatar of Grace Hopper");
      expect(wrapper.attributes("title")).toBe("Grace Hopper");
      if (props.variant !== "pixel") expect(wrapper.text()).toBe("GH");

      await wrapper.setProps({ seed: "account-12345" });

      expect(appearance(wrapper)).not.toEqual(original);
      expect(appearance(wrapper)).toEqual(
        appearance(mountAvatar({ ...props, name: "account-12345" }))
      );

      await wrapper.setProps({ seed: undefined });

      expect(appearance(wrapper)).toEqual(
        appearance(mountAvatar({ ...props, name: "Grace Hopper" }))
      );
    }
  );

  it.each([0, 42, ""])(
    "uses seed %j as its string value, including zero and empty strings",
    (seed) => {
      const wrapper = mountAvatar({ seed, variant: "pixel" });
      const reference = mountAvatar({ name: String(seed), variant: "pixel" });

      expect(appearance(wrapper)).toEqual(appearance(reference));
      expect(appearance(wrapper)).not.toEqual(
        appearance(mountAvatar({ variant: "pixel" }))
      );
      expect(wrapper.attributes("aria-label")).toBe("Avatar of Ada Lovelace");
    }
  );

  it("continues to update the default tooltip from the display name", async () => {
    const wrapper = mount(Avatar, {
      props: { name: "Ada Lovelace", seed: "account-42", tooltipDelay: 0 },
      attachTo: document.body,
    });

    await wrapper.setProps({ name: "Grace Hopper" });
    await wrapper.trigger("mouseenter");
    await nextTick();
    await nextTick();

    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Grace Hopper"
    );
  });

  it.each(["initials", "pixel"] as const)(
    "uses the seed for the %s fallback after an image fails",
    async (variant) => {
      const wrapper = mountAvatar({
        seed: "account-42",
        variant,
        imageSrc: "https://example.com/broken.png",
      });
      await wrapper.setProps({ name: "Grace Hopper" });

      expect(wrapper.attributes("aria-label")).toBe("Avatar of Grace Hopper");
      expect(wrapper.find("img").attributes("alt")).toBe("");
      await wrapper.find("img").trigger("error");

      expect(wrapper.find("img").exists()).toBe(false);
      expect(appearance(wrapper)).toEqual(
        appearance(mountAvatar({ seed: "account-42", variant }))
      );
      if (variant === "initials") expect(wrapper.text()).toBe("GH");
    }
  );

  it.each(["initials", "pixel"] as const)(
    "hydrates seeded %s without replacing or correcting the server markup",
    async (variant) => {
      const props = { name: "Ada Lovelace", seed: 0, variant, tooltip: false };
      const createApp = () => createSSRApp({ render: () => h(Avatar, props) });
      const host = document.createElement("div");
      host.innerHTML = await renderToString(createApp());
      document.body.appendChild(host);
      const serverRoot = host.firstElementChild;
      const serverMarkup = host.innerHTML;
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const app = createApp();

      try {
        app.mount(host);
        await nextTick();

        expect(host.firstElementChild).toBe(serverRoot);
        expect(host.innerHTML).toBe(serverMarkup);
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
      } finally {
        app.unmount();
        host.remove();
        warn.mockRestore();
        error.mockRestore();
      }
    }
  );
});
