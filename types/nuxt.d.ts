import type { AvatarGroupProps, AvatarProps } from "./index";

export interface ModuleOptions {
  defaults?: Partial<AvatarProps & AvatarGroupProps>;
}

declare const nuxtModule: (options?: ModuleOptions) => unknown;
export default nuxtModule;

declare module "@nuxt/schema" {
  interface NuxtConfig {
    vue3Avatar?: ModuleOptions;
  }
  interface NuxtOptions {
    vue3Avatar?: ModuleOptions;
  }
}
