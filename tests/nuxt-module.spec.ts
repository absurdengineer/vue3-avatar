import { describe, it, expect, vi, beforeEach } from "vitest";

const addComponent = vi.fn();
const addPlugin = vi.fn();
const addTemplate = vi.fn((options) => ({ dst: `/mock/${options.filename}` }));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (definition: any) => definition,
  addComponent,
  addPlugin,
  addTemplate,
}));

describe("Nuxt module", () => {
  beforeEach(() => {
    addComponent.mockClear();
    addPlugin.mockClear();
    addTemplate.mockClear();
  });

  it("declares module metadata", async () => {
    const nuxtModule = (await import("../src/nuxt/module.js")).default;

    expect(nuxtModule.meta).toEqual({
      name: "vue3-avatar",
      configKey: "vue3Avatar",
    });
    expect(nuxtModule.defaults).toEqual({ defaults: {} });
  });

  it("registers the components as auto-imported", async () => {
    const nuxtModule = (await import("../src/nuxt/module.js")).default;
    const nuxt = { options: { build: { transpile: [] } } };

    nuxtModule.setup({ defaults: {} }, nuxt);

    expect(nuxt.options.build.transpile).toContain("vue3-avatar");
    expect(addComponent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Avatar", filePath: "vue3-avatar" })
    );
    expect(addComponent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "AvatarGroup", filePath: "vue3-avatar" })
    );
    expect(addComponent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "AvatarTooltip", filePath: "vue3-avatar" })
    );
  });

  it("injects a plugin that applies global defaults", async () => {
    const nuxtModule = (await import("../src/nuxt/module.js")).default;
    const nuxt = { options: { build: { transpile: [] } } };

    nuxtModule.setup({ defaults: { size: 64 } }, nuxt);

    expect(addTemplate).toHaveBeenCalledTimes(1);
    const templateCall = addTemplate.mock.calls[0][0];
    expect(templateCall.getContents()).toContain('{"size":64}');
    expect(addPlugin).toHaveBeenCalledWith("/mock/vue3-avatar-plugin.mjs");
  });
});
