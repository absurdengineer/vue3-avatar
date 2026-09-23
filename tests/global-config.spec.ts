import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Avatar from "../src/components/Avatar.vue";
import AvatarGroup from "../src/components/AvatarGroup.vue";
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

  it("lets an explicitly passed library default override the global default", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        size: 40,
      },
      global: {
        provide: {
          [AvatarConfigKey]: { size: 100 },
        },
      },
    });

    expect(wrapper.find(".container").attributes("style")).toContain(
      "--va-size: 40px"
    );
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

  it("lets an explicitly passed false override a global true", () => {
    const wrapper = mount(Avatar, {
      props: {
        name: "John Doe",
        background: "#000000",
        autoContrast: false,
      },
      global: {
        provide: {
          [AvatarConfigKey]: { autoContrast: true },
        },
      },
    });

    expect(wrapper.find(".container").attributes("style")).not.toContain(
      "--va-color: #FFFFFF"
    );
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
    expect(style).toContain("top: 3px");
    expect(style).toContain("left: 3px");
  });

  it("applies the same precedence to AvatarGroup", () => {
    const wrapper = mount(AvatarGroup, {
      props: { size: 40 },
      slots: {
        default: '<Avatar name="John Doe" />',
      },
      global: {
        provide: {
          [AvatarConfigKey]: { size: 100 },
        },
        components: { Avatar },
      },
    });

    expect(wrapper.find(".avatar-group").attributes("style")).toContain(
      "--va-size: 40px"
    );
    expect(wrapper.find(".avatar").attributes("style")).toContain(
      "width: 40px"
    );
  });
});
