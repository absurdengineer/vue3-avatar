import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import { AvatarConfigKey } from "../src/utils/config";

describe("Global Configuration", () => {
  it("respects global size default", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
      },
      global: {
        provide: {
          [AvatarConfigKey]: {
            size: 100,
          },
        },
      },
    });

    const container = wrapper.find(".container");
    expect(container.attributes("style")).toContain("--va-size: 100px");
  });

  it("local prop overrides global default", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        size: 50,
      },
      global: {
        provide: {
          [AvatarConfigKey]: {
            size: 100,
          },
        },
      },
    });

    const container = wrapper.find(".container");
    expect(container.attributes("style")).toContain("--va-size: 50px");
  });

  it("respects global autoContrast default", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        background: "#FFFFFF",
      },
      global: {
        provide: {
          [AvatarConfigKey]: {
            autoContrast: true,
          },
        },
      },
    });

    const container = wrapper.find(".container");
    expect(container.attributes("style")).toContain("--va-color: #000000");
  });

  it("respects global statusPosition default", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        status: "online",
      },
      global: {
        provide: {
          [AvatarConfigKey]: {
            statusPosition: "top-left",
          },
        },
      },
    });

    const statusIndicator = wrapper.find(".status-indicator");
    const style = statusIndicator.attributes("style");
    expect(style).toContain("top: 0px");
    expect(style).toContain("left: 0px");
  });
});
