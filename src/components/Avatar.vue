<template>
  <div
    class="container"
    :style="rootStyle"
    :role="interactive ? 'button' : 'img'"
    :tabindex="interactive ? 0 : undefined"
    :aria-label="accessibleLabel"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <img
      :style="imageStyle"
      :height="size"
      :width="size"
      v-if="showImage()"
      :src="imageSrc"
      alt=""
      @error="onImageError"
    />
    <div
      v-else
      :style="avatarStyle"
      class="avatar noselect"
      aria-hidden="true"
    >
      {{ displayName }}
    </div>
    <div
      v-if="status || $slots.status"
      class="status-indicator"
      :style="statusStyle"
      aria-hidden="true"
    >
      <slot name="status"></slot>
    </div>
    <slot name="overlay"></slot>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getInitials } from '../utils/initials';
import { getAvatarColors } from '../utils/colors';

const BORDERCOLORS = {
  ONLINE: "green",
  OFFLINE: "grey",
  AWAY: "orange",
  BUSY: "red",
};

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  background: {
    type: String,
  },
  size: {
    type: Number,
    default: 40,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  imageSrc: {
    type: String,
  },
  alt: {
    type: String,
    default: undefined,
  },
  border: {
    type: Boolean,
    default: true,
  },
  borderColor: {
    type: String,
    default: "white",
  },
  customAvatarStyle: {
    type: Object,
    default: () => ({}), 
  },
  status: {
    type: String,
    default: null,
    validator: function (value) {
      return ["away", "online", "offline", "busy"].includes(value);
    },
  },
  customStatusStyle: {
    type: Object,
    default: () => ({}), 
  },
  sameBorder: {
    type: Boolean,
    default: false,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  /**
   * @deprecated Use original vue-avatar color palette for backwards compatibility
   */
  useLegacyColors: {
    type: Boolean,
    default: false,
  },
  useTextColorForBorder: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['error', 'activate']);

const imageError = ref(false);

const computedColors = computed(() => {
  return getAvatarColors(props.name, props.useLegacyColors);
});

const displayName = computed(() => {
  return getInitials(props.name);
});

const displayBackground = computed(() => {
  if (props.background) return props.background;
  const colors = computedColors.value;
  if (props.useLegacyColors) return colors.background;
  return props.dark ? colors.dark : colors.light;
});

const displayColor = computed(() => {
  if (props.color) return props.color;
  const colors = computedColors.value;
  if (props.useLegacyColors) return colors.color;
  return props.dark ? colors.light : colors.dark;
});

const displayBorderColor = computed(() => {
  return props.useTextColorForBorder ? displayColor.value : props.borderColor;
});

const fontSize = computed(() => {
  const size = props.size || 40;
  if (displayName.value.length == 1) return size / 2;
  else if (displayName.value.length == 2) return size / 2.5;
  if (displayName.value.length == 3) return size / 3;
  else return 14;
});

const statusBackgroundColor = computed(() => {
  let color;
  switch (props.status && props.status.toLowerCase()) {
    case "away":
      color = BORDERCOLORS.AWAY;
      break;
    case "online":
      color = BORDERCOLORS.ONLINE;
      break;
    case "offline":
      color = BORDERCOLORS.OFFLINE;
      break;
    default:
      color = BORDERCOLORS.BUSY;
  }
  return color;
});

const statusStyle = computed(() => {
  const defaultStatusStyle = {
    height: `${props.size / 4}px`,
    width: `${props.size / 4}px`,
    backgroundColor: statusBackgroundColor.value,
    border: `${props.size / 30}px solid ${props.sameBorder ? displayBorderColor.value : 'white'}`,
  };
  return Object.assign({}, defaultStatusStyle, props.customStatusStyle);
});

const imageStyle = computed(() => {
  const defaultImageStyle = {
    display: props.inline ? 'inline-flex' : 'flex',
    borderRadius: props.rounded ? '50%' : '0',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    border: props.border ? `${props.size / 20}px solid ${displayBorderColor.value}` : 'none',
  };
  return Object.assign({}, defaultImageStyle, props.customAvatarStyle);
});

const avatarStyle = computed(() => {
  const defaultAvatarStyle = {
    color: displayColor.value,
    width: props.size + 'px',
    height: props.size + 'px',
    fontSize: fontSize.value + 'px',
    background: displayBackground.value,
    display: props.inline && 'inline-flex',
    borderRadius: props.rounded && '50%',
    border: props.border && `${props.size / 20}px solid ${displayBorderColor.value}`,
  };
  return Object.assign({}, defaultAvatarStyle, props.customAvatarStyle);
});

const rootStyle = computed(() => {
  return {
    '--va-size': `${props.size}px`,
    '--va-bg': displayBackground.value,
    '--va-color': displayColor.value,
    '--va-border-color': displayBorderColor.value,
    '--va-radius': props.rounded ? '50%' : '0',
    '--va-font-size': `${fontSize.value}px`,
  };
});

const accessibleLabel = computed(() => {
  const label = props.alt || (props.name ? `Avatar of ${props.name}` : "User avatar");
  if (props.status) {
    return `${label}. User is ${props.status}`;
  }
  return label;
});

function onImageError(event) {
  imageError.value = true;
  emit('error', event);
}

function showImage() {
  return props.imageSrc && !imageError.value;
}

function onActivate(event) {
  if (props.interactive) {
    emit('activate', event);
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Domine:wght@700&display=swap");
.avatar {
  font-family: "Domine", serif;
  color: white;
  background: navy;
  font-size: 14px;
  width: 45px;
  height: 45px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
.container {
  position:relative;
}
.status-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 50%;
}
</style>
