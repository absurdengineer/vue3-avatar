import {
  defineNuxtModule,
  addComponent,
  addPlugin,
  addTemplate,
} from "@nuxt/kit";
import type { AvatarPluginOptions } from "../types";

export interface ModuleOptions {
  defaults?: AvatarPluginOptions["defaults"];
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "vue3-avatar",
    configKey: "vue3Avatar",
  },
  defaults: {
    defaults: {},
  },
  setup(options: ModuleOptions, nuxt: any) {
    nuxt.options.build.transpile.push("vue3-avatar");

    addComponent({
      name: "Avatar",
      export: "Avatar",
      filePath: "vue3-avatar",
    });

    addComponent({
      name: "AvatarGroup",
      export: "AvatarGroup",
      filePath: "vue3-avatar",
    });

    addComponent({
      name: "AvatarTooltip",
      export: "AvatarTooltip",
      filePath: "vue3-avatar",
    });

    const globalDefaults = options.defaults || {};
    const template = addTemplate({
      filename: "vue3-avatar-plugin.mjs",
      getContents: () => `
import { defineNuxtPlugin } from '#app'
import Avatar from 'vue3-avatar'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Avatar, { defaults: ${JSON.stringify(globalDefaults)} })
})
`,
    });

    addPlugin(template.dst);
  },
});
