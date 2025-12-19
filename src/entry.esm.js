import Avatar from "@/components/Avatar.vue";
import AvatarGroup from "@/components/AvatarGroup.vue";
import { AvatarConfigKey } from "./utils/config";

// Default export is installable instance of component.
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),
const install = (app, options = {}) => {
  // Provide global configuration
  const globalDefaults = options.defaults || {};
  app.provide(AvatarConfigKey, globalDefaults);

  app.component("Avatar", Avatar);
  app.component("AvatarGroup", AvatarGroup);
};

Avatar.install = install;

export { Avatar, AvatarGroup, AvatarConfigKey };
export default Avatar;
