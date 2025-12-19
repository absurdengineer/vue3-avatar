<template>
  <div
    class="container"
    :style="rootStyle"
    :role="isClickable ? 'button' : 'img'"
    :tabindex="isClickable ? 0 : undefined"
    :aria-label="accessibleLabel"
    :title="name"
    :class="{ 'is-clickable': isClickable }"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <!-- Scoped slot for custom image component (e.g., NuxtImg) -->
    <slot
      v-if="showImage() && $slots.image"
      name="image"
      :src="imageSrc"
      :alt="accessibleLabel"
      :size="size"
      :style="imageStyle"
      :class="{ 'image-loaded': isLoaded, 'image-transition': transition }"
      @error="onImageError"
      @load="onImageLoad"
    ></slot>
    <img
      v-else-if="showImage()"
      :style="imageStyle"
      :height="size"
      :width="size"
      :src="imageSrc"
      :loading="loading"
      :class="{ 'image-loaded': isLoaded, 'image-transition': transition }"
      alt=""
      @error="onImageError"
      @load="onImageLoad"
    />
    <!-- Scoped slot for custom placeholder when no image and no name -->
    <slot
      v-else-if="!name && $slots.placeholder"
      name="placeholder"
      :size="size"
      :style="avatarStyle"
    ></slot>
    <div
      v-else-if="variant === 'pixel'"
      :style="avatarStyle"
      class="avatar avatar-pixel noselect"
      aria-hidden="true"
      v-html="pixelSVG"
    ></div>
    <div v-else :style="avatarStyle" class="avatar noselect" aria-hidden="true">
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
import { computed, ref, inject } from "vue";
import { getInitials } from "../utils/initials";
import { getAvatarColors } from "../utils/colors";
import {
  generatePixelGrid,
  generatePixelSVG,
  PIXEL_THEMES,
} from "../utils/pixelgen";
import { getContrastColor } from "../utils/contrast";
import { AvatarConfigKey } from "../utils/config";

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
  shape: {
    type: String,
    validator: (value) =>
      ["circle", "square", "squircle", "hexagon"].includes(value),
  },
  imageSrc: {
    type: String,
  },
  alt: {
    type: String,
    default: undefined,
  },
  loading: {
    type: String,
    default: "lazy",
    validator: (value) => ["lazy", "eager"].includes(value),
  },
  transition: {
    type: Boolean,
    default: true,
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
  statusPosition: {
    type: String,
    default: "bottom-right",
    validator: (value) =>
      ["top-right", "top-left", "bottom-right", "bottom-left"].includes(value),
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
  gradient: {
    type: Boolean,
    default: false,
  },
  pointer: {
    type: Boolean,
    default: false,
  },
  onClick: {
    type: Function,
    default: null,
  },
  variant: {
    type: String,
    default: "initials",
    validator: (value) => ["initials", "pixel"].includes(value),
  },
  pixelTheme: {
    type: String,
    default: "earth",
    validator: (value) => Object.keys(PIXEL_THEMES).includes(value),
  },
  autoContrast: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["error", "activate", "load"]);
const imageError = ref(false);
const isLoaded = ref(false);

const globalConfig = inject(AvatarConfigKey, {});

const getConfig = (key, localValue, defaultValue) => {
  if (localValue !== undefined && localValue !== defaultValue)
    return localValue;
  return globalConfig[key] !== undefined ? globalConfig[key] : defaultValue;
};

const isClickable = computed(() => {
  return (
    props.pointer || props.interactive || typeof props.onClick === "function"
  );
});

function onActivate(event) {
  if (typeof props.onClick === "function") {
    props.onClick(event);
  }
  if (props.interactive) {
    emit("activate", event);
  }
}

const computedColors = computed(() => {
  return getAvatarColors(props.name, props.useLegacyColors);
});

const displayName = computed(() => {
  return getInitials(props.name);
});

const pixelGrid = computed(() => {
  return generatePixelGrid(props.name);
});

const pixelSVG = computed(() => {
  const baseTheme = PIXEL_THEMES[props.pixelTheme] || PIXEL_THEMES.earth;

  // Allow custom overrides via props
  const customBg = getConfig("background", props.background);
  const customColor = getConfig("color", props.color);

  let theme = {
    background: customBg || baseTheme.background,
    foreground: customColor || baseTheme.foreground,
  };

  // If no custom overrides, handle dark/light toggle
  // Consistent with initials: dark=true is dark background, dark=false is light background
  if (!customBg && !customColor && !props.dark) {
    theme = {
      background: baseTheme.foreground,
      foreground: baseTheme.background,
    };
  }

  return generatePixelSVG(pixelGrid.value, theme, props.size);
});

const displayBackground = computed(() => {
  const bg = getConfig("background", props.background);
  if (bg) return bg;
  const colors = computedColors.value;
  if (props.useLegacyColors) return colors.background;
  if (props.gradient && colors.gradient) return colors.gradient;
  return props.dark ? colors.dark : colors.light;
});

const displayColor = computed(() => {
  const color = getConfig("color", props.color);
  if (color) return color;

  // If auto-contrast is enabled, calculate based on background
  if (getConfig("autoContrast", props.autoContrast, false)) {
    const bg = displayBackground.value;
    // Only apply auto-contrast if background is a valid hex color
    if (bg && bg.startsWith("#")) {
      return getContrastColor(bg);
    }
  }

  const colors = computedColors.value;
  if (props.useLegacyColors) return colors.color;
  return props.dark ? colors.light : colors.dark;
});

const displayBorderColor = computed(() => {
  return props.useTextColorForBorder
    ? displayColor.value
    : getConfig("borderColor", props.borderColor, "white");
});

const fontSize = computed(() => {
  const size = getConfig("size", props.size, 40);
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
  // Calculate position based on statusPosition prop
  const positionStyles = {};
  const offset = 0; // Can be adjusted based on shape

  const pos = getConfig("statusPosition", props.statusPosition, "bottom-right");

  if (pos.includes("bottom")) {
    positionStyles.bottom = `${offset}px`;
    positionStyles.top = "auto";
  } else {
    positionStyles.top = `${offset}px`;
    positionStyles.bottom = "auto";
  }

  if (pos.includes("right")) {
    positionStyles.right = `${offset}px`;
    positionStyles.left = "auto";
  } else {
    positionStyles.left = `${offset}px`;
    positionStyles.right = "auto";
  }

  const size = getConfig("size", props.size, 40);

  const defaultStatusStyle = {
    height: `${size / 4}px`,
    width: `${size / 4}px`,
    backgroundColor: statusBackgroundColor.value,
    border: `${size / 30}px solid ${
      props.sameBorder ? displayBorderColor.value : "white"
    }`,
    ...positionStyles,
  };
  return Object.assign({}, defaultStatusStyle, props.customStatusStyle);
});

const imageStyle = computed(() => {
  const size = getConfig("size", props.size, 40);
  const defaultImageStyle = {
    display: props.inline ? "inline-flex" : "flex",
    borderRadius: shapeStyle.value.borderRadius,
    clipPath: shapeStyle.value.clipPath,
    margin: 0,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    border: props.border
      ? `${size / 20}px solid ${displayBorderColor.value}`
      : "none",
  };
  return Object.assign({}, defaultImageStyle, props.customAvatarStyle);
});

const avatarStyle = computed(() => {
  const size = getConfig("size", props.size, 40);
  const defaultAvatarStyle = {
    color: displayColor.value,
    width: size + "px",
    height: size + "px",
    fontSize: fontSize.value + "px",
    background: displayBackground.value,
    display: props.inline && "inline-flex",
    borderRadius: shapeStyle.value.borderRadius,
    clipPath: shapeStyle.value.clipPath,
    border: props.border && `${size / 20}px solid ${displayBorderColor.value}`,
  };
  return Object.assign({}, defaultAvatarStyle, props.customAvatarStyle);
});

const shapeStyle = computed(() => {
  const shape = props.shape || (props.rounded ? "circle" : "square");

  if (shape === "square") return { borderRadius: "0" };
  if (shape === "circle") return { borderRadius: "50%" };
  if (shape === "squircle") return { borderRadius: "25%" };
  if (shape === "hexagon")
    return {
      borderRadius: "0",
      clipPath: "polygon(25% 5%, 75% 5%, 95% 50%, 75% 95%, 25% 95%, 5% 50%)",
    };
  return { borderRadius: "0" };
});

const rootStyle = computed(() => {
  const size = getConfig("size", props.size, 40);
  return {
    "--va-size": `${size}px`,
    "--va-bg": displayBackground.value,
    "--va-color": displayColor.value,
    "--va-border-color": displayBorderColor.value,
    "--va-radius": shapeStyle.value.borderRadius,
    "--va-clip-path": shapeStyle.value.clipPath || "none",
    "--va-font-size": `${fontSize.value}px`,
  };
});

const accessibleLabel = computed(() => {
  const label =
    props.alt || (props.name ? `Avatar of ${props.name}` : "User avatar");
  if (props.status) {
    return `${label}. User is ${props.status}`;
  }
  return label;
});

function onImageError(event) {
  imageError.value = true;
  isLoaded.value = false;
  emit("error", event);
}

function onImageLoad(event) {
  isLoaded.value = true;
  emit("load", event);
}

function showImage() {
  return props.imageSrc && !imageError.value;
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
.avatar-pixel {
  padding: 0;
  overflow: hidden;
}
.avatar-pixel svg {
  display: block;
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
  position: relative;
}
.container.is-clickable,
.container.is-clickable * {
  cursor: pointer !important;
}
.status-indicator {
  position: absolute;
  border-radius: 50%;
}
.container img.image-transition {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.container img.image-transition.image-loaded {
  opacity: 1;
}
</style>
