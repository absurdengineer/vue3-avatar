import type { App, Plugin } from "vue";
import Avatar from "./components/Avatar.vue";
import AvatarGroup from "./components/AvatarGroup.vue";
import AvatarTooltip from "./components/AvatarTooltip.vue";
import { AvatarConfigKey } from "./utils/config";
import { useTooltip } from "./composables/useTooltip";
import { useFloating } from "./composables/useFloating";
import { computePosition, PLACEMENTS } from "./utils/position";
import type { AvatarPluginOptions } from "./types";

// Default export is an installable instance of the component: the IIFE build
// attaches this `install` function so the component can be registered with
// `app.use()` as well as `app.component()`.
const install = (app: App, options: AvatarPluginOptions = {}): void => {
  // Provide global configuration
  const globalDefaults = options.defaults || {};
  app.provide(AvatarConfigKey, globalDefaults);

  app.component("Avatar", Avatar);
  app.component("AvatarGroup", AvatarGroup);
  app.component("AvatarTooltip", AvatarTooltip);
};

(Avatar as typeof Avatar & { install: typeof install }).install = install;

export * from "./types";
export {
  Avatar,
  AvatarGroup,
  AvatarTooltip,
  AvatarConfigKey,
  useTooltip,
  useFloating,
  computePosition,
  PLACEMENTS,
  install,
};

export default Avatar as typeof Avatar & Plugin<[AvatarPluginOptions?]>;
