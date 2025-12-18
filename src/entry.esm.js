import Avatar from '@/components/Avatar.vue';
import AvatarGroup from '@/components/AvatarGroup.vue';

// Default export is installable instance of component.
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),
const install = (app) => {
  app.component('Avatar', Avatar);
  app.component('AvatarGroup', AvatarGroup);
};

Avatar.install = install;

export { Avatar, AvatarGroup };
export default Avatar;