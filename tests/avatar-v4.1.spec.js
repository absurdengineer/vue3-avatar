import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";
import { h } from "vue";

describe("Avatar v4.1 New Features", () => {
  describe("Enhanced Image Handling", () => {
    it('has loading prop with default value "lazy"', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
        },
      });
      const img = wrapper.find("img");
      expect(img.attributes("loading")).toBe("lazy");
    });

    it('respects loading="eager" prop', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
          loading: "eager",
        },
      });
      const img = wrapper.find("img");
      expect(img.attributes("loading")).toBe("eager");
    });

    it("applies transition classes when transition prop is true", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
          transition: true,
        },
      });
      const img = wrapper.find("img");
      expect(img.classes()).toContain("image-transition");
    });

    it("does not apply transition classes when transition prop is false", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
          transition: false,
        },
      });
      const img = wrapper.find("img");
      expect(img.classes()).not.toContain("image-transition");
    });

    it("emits load event when image loads", async () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
        },
      });
      const img = wrapper.find("img");
      await img.trigger("load");
      expect(wrapper.emitted("load")).toBeTruthy();
      expect(wrapper.emitted("load")).toHaveLength(1);
    });

    it("adds image-loaded class after image loads", async () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
        },
      });
      const img = wrapper.find("img");
      await img.trigger("load");
      await wrapper.vm.$nextTick();
      expect(img.classes()).toContain("image-loaded");
    });
  });

  describe("Status Indicator Positioning", () => {
    it('has default statusPosition of "bottom-right"', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          status: "online",
        },
      });
      const statusIndicator = wrapper.find(".status-indicator");
      const style = statusIndicator.attributes("style");
      expect(style).toContain("bottom: 0px");
      expect(style).toContain("right: 0px");
    });

    it("positions status indicator at top-right", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          status: "online",
          statusPosition: "top-right",
        },
      });
      const statusIndicator = wrapper.find(".status-indicator");
      const style = statusIndicator.attributes("style");
      expect(style).toContain("top: 0px");
      expect(style).toContain("right: 0px");
    });

    it("positions status indicator at top-left", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          status: "online",
          statusPosition: "top-left",
        },
      });
      const statusIndicator = wrapper.find(".status-indicator");
      const style = statusIndicator.attributes("style");
      expect(style).toContain("top: 0px");
      expect(style).toContain("left: 0px");
    });

    it("positions status indicator at bottom-left", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          status: "online",
          statusPosition: "bottom-left",
        },
      });
      const statusIndicator = wrapper.find(".status-indicator");
      const style = statusIndicator.attributes("style");
      expect(style).toContain("bottom: 0px");
      expect(style).toContain("left: 0px");
    });
  });

  describe("PixelGen - Pixel Art Avatars", () => {
    it("renders initials by default when variant is not specified", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
        },
      });
      expect(wrapper.find(".avatar").exists()).toBe(true);
      expect(wrapper.find(".avatar-pixel").exists()).toBe(false);
      expect(wrapper.text()).toBe("JD");
    });

    it('renders pixel avatar when variant="pixel"', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          variant: "pixel",
        },
      });
      expect(wrapper.find(".avatar-pixel").exists()).toBe(true);
      expect(wrapper.find(".avatar-pixel").html()).toContain("<svg");
    });

    it("generates deterministic pixel pattern for same name", () => {
      const wrapper1 = mount(Avatar, {
        props: { name: "John Doe", variant: "pixel" },
      });
      const wrapper2 = mount(Avatar, {
        props: { name: "John Doe", variant: "pixel" },
      });

      const svg1 = wrapper1.find(".avatar-pixel").html();
      const svg2 = wrapper2.find(".avatar-pixel").html();

      expect(svg1).toBe(svg2);
    });

    it("generates different pixel patterns for different names", () => {
      const wrapper1 = mount(Avatar, {
        props: { name: "Alice", variant: "pixel" },
      });
      const wrapper2 = mount(Avatar, {
        props: { name: "Bob", variant: "pixel" },
      });

      const svg1 = wrapper1.find(".avatar-pixel").html();
      const svg2 = wrapper2.find(".avatar-pixel").html();

      expect(svg1).not.toBe(svg2);
    });

    it("uses earth theme by default", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          variant: "pixel",
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      // Earth theme colors
      expect(svg).toContain("#8B7355");
      expect(svg).toContain("#D4A574");
    });

    it('applies neon theme when pixelTheme="neon"', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          variant: "pixel",
          pixelTheme: "neon",
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      // Neon theme colors
      expect(svg).toContain("#FF006E");
      expect(svg).toContain("#00F5FF");
    });

    it('applies ocean theme when pixelTheme="ocean"', () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          variant: "pixel",
          pixelTheme: "ocean",
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      // Ocean theme colors
      expect(svg).toContain("#006994");
      expect(svg).toContain("#4FC3F7");
    });

    it("swaps colors for light mode (dark=false) in PixelGen", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "Alice",
          variant: "pixel",
          pixelTheme: "earth",
          dark: false,
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      // In earth theme: background: "#8B7355", foreground: "#D4A574"
      // If dark=false, it should swap. BG becomes #D4A574
      // Match the first rect (background)
      expect(svg.toLowerCase()).toContain('fill="#d4a574"');
    });

    it("uses original theme colors for dark mode (dark=true) in PixelGen", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "Alice",
          variant: "pixel",
          pixelTheme: "earth",
          dark: true,
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      // Should NOT swap. BG remains #8B7355
      expect(svg.toLowerCase()).toContain('fill="#8b7355"');
    });

    it("respects explicit background and color props in PixelGen", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "Alice",
          variant: "pixel",
          background: "#FF0000",
          color: "#00FF00",
        },
      });
      const svg = wrapper.find(".avatar-pixel").html();
      expect(svg.toUpperCase()).toContain('FILL="#FF0000"'); // Background rect
      expect(svg.toUpperCase()).toContain('FILL="#00FF00"'); // Pixels
    });
  });

  describe("Scoped Slots", () => {
    it("uses #image slot when provided", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          imageSrc: "https://example.com/avatar.png",
        },
        slots: {
          image: '<div class="custom-image">Custom Image</div>',
        },
      });

      expect(wrapper.find(".custom-image").exists()).toBe(true);
      expect(wrapper.find(".custom-image").text()).toBe("Custom Image");
    });

    it("uses #placeholder slot when no name and no image", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "",
        },
        slots: {
          placeholder: '<div class="custom-placeholder">Placeholder</div>',
        },
      });

      expect(wrapper.find(".custom-placeholder").exists()).toBe(true);
      expect(wrapper.find(".custom-placeholder").text()).toBe("Placeholder");
    });

    it("does not use #placeholder slot when name is provided", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
        },
        slots: {
          placeholder: '<div class="custom-placeholder">Placeholder</div>',
        },
      });

      expect(wrapper.find(".custom-placeholder").exists()).toBe(false);
      expect(wrapper.text()).toBe("JD");
    });
  });

  describe("Auto-Contrast Engine", () => {
    it("does not apply auto-contrast by default", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          background: "#FFFFFF",
        },
      });
      const container = wrapper.find(".container");
      const style = container.attributes("style");
      // Should use default color logic, not auto-contrast
      expect(style).toContain("--va-color:");
    });

    it("applies black text on light background when autoContrast is true", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          background: "#FFFFFF",
          autoContrast: true,
        },
      });
      const container = wrapper.find(".container");
      const style = container.attributes("style");
      expect(style).toContain("--va-color: #000000");
    });

    it("applies white text on dark background when autoContrast is true", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          background: "#000000",
          autoContrast: true,
        },
      });
      const container = wrapper.find(".container");
      const style = container.attributes("style");
      expect(style).toContain("--va-color: #FFFFFF");
    });

    it("respects explicit color prop over autoContrast", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          background: "#FFFFFF",
          color: "#FF0000",
          autoContrast: true,
        },
      });
      const container = wrapper.find(".container");
      const style = container.attributes("style");
      expect(style).toContain("--va-color: #FF0000");
    });
  });

  describe("Backward Compatibility", () => {
    it("maintains all v4.0 functionality", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "John Doe",
          size: 50,
          rounded: true,
          status: "online",
          interactive: true,
        },
      });

      expect(wrapper.text()).toBe("JD");
      expect(wrapper.find(".status-indicator").exists()).toBe(true);
      expect(wrapper.find(".container").attributes("role")).toBe("button");
    });

    it("works without any new v4.1 props", () => {
      const wrapper = mount(Avatar, {
        props: {
          name: "Jane Smith",
        },
      });

      expect(wrapper.text()).toBe("JS");
      expect(wrapper.find(".avatar").exists()).toBe(true);
    });
  });

  describe("AvatarGroup v4.1 Interactivity", () => {
    it("emits two arguments on overflow-click: hidden users and all users", async () => {
      const wrapper = mount(AvatarGroup, {
        props: { max: 2 },
        slots: {
          default: () => [
            h(Avatar, { name: "Alice" }),
            h(Avatar, { name: "Bob" }),
            h(Avatar, { name: "Charlie" }),
            h(Avatar, { name: "David" }),
          ],
        },
      });

      const overflowBadge = wrapper.find(".avatar-overflow");
      await overflowBadge.trigger("click");

      const emitted = wrapper.emitted("overflow-click");
      expect(emitted).toBeTruthy();
      expect(emitted[0]).toHaveLength(2);

      const [hidden, all] = emitted[0];

      // Hidden should be Charlie and David
      expect(hidden).toHaveLength(2);
      expect(hidden[0].name).toBe("Charlie");
      expect(hidden[1].name).toBe("David");

      // All should be Alice, Bob, Charlie, David
      expect(all).toHaveLength(4);
      expect(all[0].name).toBe("Alice");
      expect(all[1].name).toBe("Bob");
      expect(all[2].name).toBe("Charlie");
      expect(all[3].name).toBe("David");
    });
  });
});
