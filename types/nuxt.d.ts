import type { AvatarGroupProps, AvatarProps } from "../src/types";

/**
 * Hand-written because it carries an ambient module augmentation, which cannot
 * be derived from `src/nuxt/module.ts`. Everything else in `dist/types` is
 * emitted from source by `npm run build:types`.
 */
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
