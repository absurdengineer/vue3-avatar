<template>
  <component
    :is="as"
    ref="container"
    class="container"
    :style="rootStyle"
    :aria-label="accessibleLabel"
    :aria-describedby="describedBy"
    :title="nativeTitle ? name : undefined"
    :class="{
      'is-clickable': isClickable && !disabled,
      'is-disabled': disabled,
      'is-selected': selected === true,
      'reset-native': as !== 'div',
    }"
    v-bind="rootBindings"
  >
    <div
      v-if="showSkeleton"
      class="avatar-skeleton"
      :style="skeletonStyle"
      aria-hidden="true"
    ></div>
    <!-- Scoped slot for custom image component (e.g., NuxtImg) -->
    <slot
      v-if="showImage() && $slots.image"
      name="image"
      :src="currentSrc"
      :srcset="resolvedSrcset"
      :sizes="sizes"
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
      :src="currentSrc"
      :srcset="resolvedSrcset || undefined"
      :sizes="sizes || undefined"
      :crossorigin="crossorigin || undefined"
      :referrerpolicy="referrerpolicy || undefined"
      :decoding="decoding"
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
      :class="{ 'status-pulse': statusPulse }"
      :style="statusStyle"
      aria-hidden="true"
    >
      <slot name="status"></slot>
    </div>
    <div v-if="hasBadge" class="avatar-badge" :style="badgeStyle" aria-hidden="true">
      <span class="avatar-badge__label">
        <slot name="badge">{{ displayBadge }}</slot>
      </span>
    </div>
    <slot name="overlay"></slot>
    <AvatarTooltip
      v-if="tooltipEnabled"
      :id="tooltipId"
      :open="tooltipOpen"
      :reference="container"
      :placement="tooltipConfig.placement"
      :offset="tooltipConfig.offset"
      :arrow="tooltipConfig.arrow"
      :theme="tooltipConfig.theme"
      :interactive="tooltipConfig.interactive"
      v-bind="tooltipFloatingListeners"
    >
      <slot
        name="tooltip"
        :name-value="name"
        :initials="displayName"
        :status="status"
        :image-src="imageSrc"
        >{{ tooltipContent }}</slot
      >
    </AvatarTooltip>
    <component
      :is="editOverlayIsButton ? 'button' : 'span'"
      v-if="editable"
      class="avatar-edit"
      v-bind="editOverlayAttrs"
    >
      <slot name="edit-overlay">
        <svg viewBox="0 0 24 24" width="45%" height="45%" aria-hidden="true">
          <path
            fill="currentColor"
            d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
          />
        </svg>
      </slot>
    </component>
    <input
      v-if="editable && accept"
      ref="fileInput"
      type="file"
      class="avatar-file-input"
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      @change="onFileSelect"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, inject, watch, onMounted, useSlots } from "vue";
import type { CSSProperties, PropType } from "vue";
import AvatarTooltip from "./AvatarTooltip.vue";
import { useTooltip } from "../composables/useTooltip";
import { PLACEMENTS } from "../utils/position";
import { getInitials } from "../utils/initials";
import { getAvatarColors } from "../utils/colors";
import {
  generatePixelGrid,
  generatePixelSVG,
  PIXEL_THEMES,
} from "../utils/pixelgen";
import { getContrastColor } from "../utils/contrast";
import { AvatarConfigKey, createConfigResolver } from "../utils/config";
import type {
  AvatarAs,
  AvatarReferrerPolicy,
  AvatarBadgePosition,
  AvatarBadgeVariant,
  AvatarCrossOrigin,
  AvatarDecoding,
  AvatarLoading,
  AvatarShape,
  AvatarStatusColors,
  AvatarStatusPosition,
  AvatarStatusSize,
  AvatarTooltipOptions,
  AvatarTooltipPlacement,
  AvatarTooltipTheme,
  AvatarVariant,
} from "../types";
import {
  STATUS_COLORS,
  STATUS_SIZE_RATIOS,
  SHAPE_BADGE_INSET,
  SHAPE_CORNER_INSET,
} from "../utils/status";

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
    type: String as PropType<AvatarShape>,
    validator: (value: string) =>
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
    type: String as PropType<AvatarLoading>,
    default: "lazy",
    validator: (value: string) => ["lazy", "eager"].includes(value),
  },
  srcset: {
    type: String,
    default: null,
  },
  sizes: {
    type: String,
    default: null,
  },
  crossorigin: {
    type: String as PropType<AvatarCrossOrigin>,
    default: null,
    validator: (value: string) =>
      ["anonymous", "use-credentials"].includes(value),
  },
  referrerpolicy: {
    type: String as PropType<AvatarReferrerPolicy>,
    default: null,
  },
  decoding: {
    type: String as PropType<AvatarDecoding>,
    default: "async",
    validator: (value: string) => ["async", "sync", "auto"].includes(value),
  },
  /** Derives an `@2x` srcset from `imageSrc` when no explicit srcset is set. */
  retina: {
    type: Boolean,
    default: false,
  },
  /** One or more sources to try, in order, before giving up on images. */
  fallbackSrc: {
    type: [String, Array] as PropType<string | string[]>,
    default: null,
  },
  /** Placeholder shown while the image loads. */
  skeleton: {
    type: Boolean,
    default: true,
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
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  status: {
    type: String,
    default: null,
    // Any string is allowed so custom presences ("in-meeting") can resolve
    // through `statusColors`; unknown values just fall back to the offline grey.
    validator: (value: unknown) => typeof value === "string",
  },
  statusPosition: {
    type: String as PropType<AvatarStatusPosition>,
    default: "bottom-right",
    validator: (value: string) =>
      ["top-right", "top-left", "bottom-right", "bottom-left"].includes(value),
  },
  customStatusStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  /** Overrides the colour for this avatar's status, whatever the status is. */
  statusColor: {
    type: String,
    default: null,
  },
  /** Extra or replacement status colours, merged over the built-in four. */
  statusColors: {
    type: Object as PropType<AvatarStatusColors>,
    default: () => ({}),
  },
  statusSize: {
    type: [String, Number] as PropType<AvatarStatusSize>,
    default: "md",
    validator: (value: string | number) =>
      typeof value === "number" ||
      Object.keys(STATUS_SIZE_RATIOS).includes(value),
  },
  /** Replaces "User is {status}" in the accessible label. */
  statusLabel: {
    type: String,
    default: null,
  },
  statusPulse: {
    type: Boolean,
    default: false,
  },
  badge: {
    type: [String, Number],
    default: null,
  },
  badgeVariant: {
    type: String as PropType<AvatarBadgeVariant>,
    default: "count",
    validator: (value: string) => ["count", "dot", "icon"].includes(value),
  },
  /** Counts above this render as "{max}+". */
  badgeMax: {
    type: Number,
    default: 999,
  },
  /**
   * Letters kept in a non-numeric badge. Three is the same budget the initials
   * use, and it is about all that stays legible in a corner marker.
   */
  badgeMaxLength: {
    type: Number,
    default: 3,
  },
  badgePosition: {
    type: String as PropType<AvatarBadgePosition>,
    default: "top-right",
    validator: (value: string) =>
      ["top-right", "top-left", "bottom-right", "bottom-left"].includes(value),
  },
  badgeColor: {
    type: String,
    default: null,
  },
  badgeTextColor: {
    type: String,
    default: null,
  },
  /** Wording for the badge in the accessible label. */
  badgeLabel: {
    type: String,
    default: null,
  },
  customBadgeStyle: {
    type: Object as PropType<CSSProperties>,
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
    type: Function as unknown as PropType<
      ((event: MouseEvent | KeyboardEvent) => void) | null
    >,
    default: null,
  },
  variant: {
    type: String as PropType<AvatarVariant>,
    default: "initials",
    validator: (value: string) => ["initials", "pixel"].includes(value),
  },
  pixelTheme: {
    type: String,
    default: "earth",
    validator: (value: string) => Object.keys(PIXEL_THEMES).includes(value),
  },
  autoContrast: {
    type: Boolean,
    default: false,
  },
  /**
   * Tooltip content. `undefined` falls back to `name`, `false` disables the
   * tooltip, and an object supplies inline overrides for the options below.
   */
  tooltip: {
    type: [String, Boolean, Object] as PropType<
      string | boolean | AvatarTooltipOptions
    >,
    default: undefined,
  },
  tooltipPlacement: {
    type: String as PropType<AvatarTooltipPlacement>,
    default: "top",
    validator: (value: AvatarTooltipPlacement) => PLACEMENTS.includes(value),
  },
  tooltipTrigger: {
    type: String,
    default: "hover focus",
  },
  tooltipDelay: {
    type: Number,
    default: 200,
  },
  tooltipHideDelay: {
    type: Number,
    default: 100,
  },
  tooltipOffset: {
    type: Number,
    default: 8,
  },
  tooltipArrow: {
    type: Boolean,
    default: true,
  },
  tooltipTheme: {
    type: String as PropType<AvatarTooltipTheme>,
    default: "dark",
    validator: (value: string) => ["dark", "light", "auto"].includes(value),
  },
  tooltipInteractive: {
    type: Boolean,
    default: false,
  },
  tooltipDisabled: {
    type: Boolean,
    default: false,
  },
  /** Restores the v4 behaviour of a native `title` attribute. */
  nativeTitle: {
    type: Boolean,
    default: false,
  },
  /**
   * Root element. `button` and `a` bring real semantics and keyboard handling;
   * `div` (the default) preserves the v4 output.
   */
  as: {
    type: String as PropType<AvatarAs>,
    default: "div",
    validator: (value: string) => ["div", "button", "a"].includes(value),
  },
  href: {
    type: String,
    default: null,
  },
  target: {
    type: String,
    default: null,
  },
  rel: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** Opt-in toggle state. Leave unset for avatars that are not toggles. */
  selected: {
    type: Boolean,
    default: null,
  },
  /** Shows an overlay affordance for changing the picture. */
  editable: {
    type: Boolean,
    default: false,
  },
  /** With `editable`, wires a hidden file input accepting these types. */
  accept: {
    type: String,
    default: null,
  },
  editLabel: {
    type: String,
    default: "Change picture",
  },
});

const emit = defineEmits([
  "error",
  "activate",
  "load",
  "fallback",
  "edit",
  "file-select",
]);
const slots = useSlots();
const imageError = ref(false);
const isLoaded = ref(false);
const fallbackIndex = ref(0);

// Teleports, skeletons and anything else that measures must wait for the
// client, or the server render and the first client render disagree.
const hasMounted = ref(false);
onMounted(() => {
  hasMounted.value = true;
});

const globalConfig = inject(AvatarConfigKey, {});
const getConfig = createConfigResolver(globalConfig);

const isClickable = computed(() => {
  return (
    props.pointer || props.interactive || typeof props.onClick === "function"
  );
});

/** `button` and `a` already handle Enter/Space and focus themselves. */
const isNativeInteractive = computed(
  () => props.as === "button" || props.as === "a"
);

const resolvedRel = computed(() => {
  if (props.rel) return props.rel;
  // Opening a new tab without this leaves the opener reachable from the new
  // document, which is both a security and a performance problem.
  return props.target === "_blank" ? "noopener noreferrer" : null;
});

const rootAttrs = computed<Record<string, unknown>>(() => {
  const attrs: Record<string, unknown> = {};

  if (props.as === "button") {
    attrs.type = "button";
    if (props.disabled) attrs.disabled = true;
  } else if (props.as === "a") {
    if (!props.disabled) attrs.href = props.href || undefined;
    attrs.target = props.target || undefined;
    attrs.rel = resolvedRel.value || undefined;
    if (props.disabled) attrs["aria-disabled"] = "true";
  } else {
    // Children of `role="img"` are presentational, so an editable avatar that
    // claimed it would hide the only control for changing the picture.
    attrs.role = isClickable.value
      ? "button"
      : props.editable
      ? "group"
      : "img";
    attrs.tabindex =
      isClickable.value && !props.disabled ? 0 : undefined;
    if (props.disabled) attrs["aria-disabled"] = "true";
  }

  if (props.selected !== null) attrs["aria-pressed"] = String(props.selected);

  return attrs;
});

function onActivate(event: MouseEvent | KeyboardEvent): void {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  if (typeof props.onClick === "function") {
    props.onClick(event);
  }
  if (props.interactive) {
    emit("activate", event);
  }
  // A native root cannot carry a nested edit button, so its own activation is
  // what opens the picker. See `editOverlayIsButton`.
  if (props.editable && isNativeInteractive.value) {
    openEditor(event);
  }
}

/**
 * Merges attribute maps, composing handlers rather than letting the last one
 * win. The avatar and the tooltip both want `onClick` once `tooltipTrigger`
 * includes `click`, and a plain spread would silently drop one of them.
 */
function mergeBindings(
  ...maps: Record<string, unknown>[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const map of maps) {
    for (const key of Object.keys(map)) {
      const value = map[key];
      const existing = merged[key];
      if (
        /^on[A-Z]/.test(key) &&
        typeof value === "function" &&
        typeof existing === "function"
      ) {
        const first = existing as (event: unknown) => void;
        const second = value as (event: unknown) => void;
        merged[key] = (event: unknown) => {
          first(event);
          second(event);
        };
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
}

const rootListeners = computed<Record<string, (event: any) => void>>(() => {
  const listeners: Record<string, (event: any) => void> = {
    onClick: onActivate,
  };

  // Binding these on a <button> or <a> would fire the handler twice: once for
  // the key, once for the click the browser synthesises from it.
  if (!isNativeInteractive.value) {
    listeners.onKeydown = (event: KeyboardEvent) => {
      // `key` is lowercased before comparing because environments disagree on
      // its casing, and "Spacebar"/"space" are the older spellings of " ".
      const key = String(event.key || "").toLowerCase();
      const isActivation =
        key === "enter" ||
        key === " " ||
        key === "spacebar" ||
        key === "space" ||
        (event as KeyboardEvent).keyCode === 13 ||
        (event as KeyboardEvent).keyCode === 32;
      if (!isActivation) return;
      event.preventDefault();
      onActivate(event);
    };
  }

  return listeners;
});

const fileInput = ref<HTMLInputElement | null>(null);

function openEditor(event: MouseEvent | KeyboardEvent): void {
  if (props.disabled) return;
  emit("edit", event);
  if (props.accept && fileInput.value) fileInput.value.click();
}

/**
 * A `<button>` inside a `<button>` or an `<a>` is invalid HTML and the parser
 * reparents it, so on those roots the overlay is decoration and the root's own
 * activation drives the edit.
 */
const editOverlayIsButton = computed(() => !isNativeInteractive.value);

const editOverlayAttrs = computed<Record<string, unknown>>(() => {
  if (!editOverlayIsButton.value) return { "aria-hidden": "true" };
  return {
    type: "button",
    disabled: props.disabled || undefined,
    "aria-label": props.editLabel,
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      openEditor(event);
    },
  };
});

function onFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit("file-select", { files: target.files, event });
  // Without this the browser sees no change when the same file is chosen a
  // second time, so re-picking after a cancelled crop emits nothing.
  target.value = "";
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

const statusColorMap = computed(() =>
  Object.assign(
    {},
    STATUS_COLORS,
    globalConfig.statusColors || {},
    props.statusColors || {}
  )
);

const statusBackgroundColor = computed(() => {
  if (props.statusColor) return props.statusColor;
  const key = props.status && String(props.status).toLowerCase();
  const map = statusColorMap.value;
  return map[key] || map.offline;
});

const currentShape = computed(
  () => props.shape || (props.rounded ? "circle" : "square")
);

/** Corner inset in pixels for the status dot on the current shape. */
const cornerInset = computed(() => {
  const size = getConfig("size", props.size, 40);
  const ratio = SHAPE_CORNER_INSET[currentShape.value];
  return Math.round(size * (ratio === undefined ? 0 : ratio));
});

/** The badge sits further out than the dot; see SHAPE_BADGE_INSET. */
const badgeInset = computed(() => {
  const size = getConfig("size", props.size, 40);
  const ratio = SHAPE_BADGE_INSET[currentShape.value];
  return Math.round(size * (ratio === undefined ? 0 : ratio));
});

/** Turns `"bottom-right"` into the matching absolute-position offsets. */
function cornerStyles(
  position: AvatarStatusPosition | AvatarBadgePosition,
  offset: number
): CSSProperties {
  const styles: CSSProperties = {};
  if (String(position).includes("bottom")) {
    styles.bottom = `${offset}px`;
    styles.top = "auto";
  } else {
    styles.top = `${offset}px`;
    styles.bottom = "auto";
  }
  if (String(position).includes("right")) {
    styles.right = `${offset}px`;
    styles.left = "auto";
  } else {
    styles.left = `${offset}px`;
    styles.right = "auto";
  }
  return styles;
}

const statusDotSize = computed(() => {
  const size = getConfig("size", props.size, 40);
  const value = getConfig("statusSize", props.statusSize, "md");
  if (typeof value === "number") return value;
  return size / (STATUS_SIZE_RATIOS[value] || STATUS_SIZE_RATIOS.md);
});

const statusStyle = computed<CSSProperties>(() => {
  const size = getConfig("size", props.size, 40);
  const pos = getConfig("statusPosition", props.statusPosition, "bottom-right");

  const defaultStatusStyle = {
    height: `${statusDotSize.value}px`,
    width: `${statusDotSize.value}px`,
    backgroundColor: statusBackgroundColor.value,
    border: `${size / 30}px solid ${
      props.sameBorder ? displayBorderColor.value : "white"
    }`,
    ...cornerStyles(pos, cornerInset.value),
  };
  return Object.assign({}, defaultStatusStyle, props.customStatusStyle);
});

const hasBadge = computed(
  () =>
    props.badgeVariant === "dot" ||
    props.badge !== null ||
    Boolean(slots.badge)
);

/**
 * `1200` with the default `badgeMax` renders as `999+`; `"Promotional"` with
 * the default `badgeMaxLength` renders as `"Pro"`.
 *
 * Digit strings are clamped like numbers, so `badge="1200"` and `badge={1200}`
 * agree rather than one of them slipping past the cap as a label.
 */
const displayBadge = computed(() => {
  if (props.badgeVariant === "dot") return "";

  const value = props.badge;
  if (value === null || value === undefined) return "";

  const text = String(value);
  const numeric = typeof value === "number" ? value : Number(text);
  const isNumeric = /^\d+$/.test(text) && Number.isFinite(numeric);

  if (isNumeric)
    return numeric > props.badgeMax ? `${props.badgeMax}+` : text;

  return text.slice(0, Math.max(0, props.badgeMaxLength));
});

const badgeStyle = computed<CSSProperties>(() => {
  const size = getConfig("size", props.size, 40);
  const background = props.badgeColor || "#ef4444";
  const isDot = props.badgeVariant === "dot";
  // Content is capped at "999+" or three letters, so every badge is short and
  // one geometry serves them all — no measuring the text to pick a scale.
  const dimension = isDot ? size / 4 : size / 3.6;

  const defaultBadgeStyle = {
    minWidth: `${dimension}px`,
    // A label badge is anchored to a corner and grows towards the middle, so
    // without a cap a long string ("Promotional") runs across the face and out
    // the far side of the avatar. Capping at the avatar's own width keeps it
    // legible and contained; the label truncates instead. Override with
    // `customBadgeStyle: { maxWidth: ... }`.
    maxWidth: isDot ? undefined : `${size}px`,
    height: `${dimension}px`,
    padding: isDot ? "0" : `0 ${size / 12}px`,
    fontSize: `${size / 5.5}px`,
    borderRadius: `${dimension}px`,
    background,
    // Callers who set only a background still get readable text.
    color:
      props.badgeTextColor ||
      (background.startsWith("#") ? getContrastColor(background) : "#ffffff"),
    border: `${size / 30}px solid ${
      props.sameBorder ? displayBorderColor.value : "white"
    }`,
    ...cornerStyles(props.badgePosition, badgeInset.value),
  };
  return Object.assign({}, defaultBadgeStyle, props.customBadgeStyle);
});

if (process.env.NODE_ENV !== "production") {
  watch(
    () =>
      [
        props.badgePosition,
        props.statusPosition,
        hasBadge.value,
        props.status,
      ] as const,
    ([badgePos, statusPos, badgeShown, status]) => {
      if (badgeShown && status && badgePos === statusPos) {
        console.warn(
          `vue3-avatar: badgePosition and statusPosition are both "${badgePos}", so they will overlap.`
        );
      }
    },
    { immediate: true }
  );
}

const imageStyle = computed<CSSProperties>(() => {
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
      : "0px",
  };
  return Object.assign({}, defaultImageStyle, props.customAvatarStyle);
});

const avatarStyle = computed<CSSProperties>(() => {
  const size = getConfig("size", props.size, 40);
  const defaultAvatarStyle = {
    color: displayColor.value,
    width: size + "px",
    height: size + "px",
    fontSize: fontSize.value + "px",
    background: displayBackground.value,
    display: props.inline ? "inline-flex" : undefined,
    borderRadius: shapeStyle.value.borderRadius,
    clipPath: shapeStyle.value.clipPath,
    // Initials/pixel-art avatars always keep their outline; `border` only
    // toggles the native image border (see README props table).
    border: `${size / 20}px solid ${displayBorderColor.value}`,
  };
  return Object.assign({}, defaultAvatarStyle, props.customAvatarStyle);
});

const shapeStyle = computed<CSSProperties>(() => {
  const shape = currentShape.value;

  if (shape === "square") return { borderRadius: "0" };
  if (shape === "circle") return { borderRadius: "50%" };
  if (shape === "squircle") return { borderRadius: "25%" };
  if (shape === "hexagon")
    return {
      borderRadius: "0",
      // A regular hexagon, not a squashed one. The box is square, so spanning
      // both axes equally would stretch the shape vertically and make it read
      // as taller than it is wide. A regular hexagon with points left and
      // right is `side * sqrt(3)` tall for `side * 2` wide, so the flat top
      // and bottom sit at 50% +/- 42.43% while the points reach 1% and 99%.
      clipPath:
        "polygon(25.5% 7.57%, 74.5% 7.57%, 99% 50%, 74.5% 92.43%, 25.5% 92.43%, 1% 50%)",
    };
  return { borderRadius: "0" };
});

const rootStyle = computed<CSSProperties>(() => {
  const size = getConfig("size", props.size, 40);
  return {
    "--va-size": `${size}px`,
    "--va-bg": displayBackground.value,
    "--va-color": displayColor.value,
    "--va-border-color": displayBorderColor.value,
    "--va-radius": shapeStyle.value.borderRadius,
    "--va-clip-path": shapeStyle.value.clipPath || "none",
    "--va-font-size": `${fontSize.value}px`,
    "--va-status-color": statusBackgroundColor.value,
    "--va-status-size": `${statusDotSize.value}px`,
    "--va-badge-bg": badgeStyle.value.background,
    "--va-badge-color": badgeStyle.value.color,
  };
});

const accessibleLabel = computed(() => {
  let label =
    props.alt || (props.name ? `Avatar of ${props.name}` : "User avatar");

  if (props.statusLabel) label = `${label}. ${props.statusLabel}`;
  else if (props.status) label = `${label}. User is ${props.status}`;

  // The badge itself is aria-hidden, so its meaning has to arrive here or it is
  // announced twice — once as the label, once as loose text.
  if (hasBadge.value) {
    if (props.badgeLabel) label = `${label}. ${props.badgeLabel}`;
    else if (displayBadge.value)
      label = `${label}. ${displayBadge.value} notifications`;
  }

  return label;
});

const container = ref<HTMLElement | null>(null);
const tooltipId = `va-avatar-tooltip-${Math.random().toString(36).slice(2, 10)}`;

/** Inline overrides passed as `:tooltip="{ placement: 'right' }"`. */
const tooltipOverrides = computed<AvatarTooltipOptions>(() =>
  props.tooltip && typeof props.tooltip === "object"
    ? (props.tooltip as AvatarTooltipOptions)
    : {}
);

function pick<T>(
  key: keyof AvatarTooltipOptions,
  propKey: keyof typeof props,
  defaultValue: T
): T {
  const override = tooltipOverrides.value[key];
  if (override !== undefined) return override as T;
  return getConfig(propKey as string, props[propKey] as T, defaultValue);
}

const tooltipContent = computed<string | null>(() => {
  const value = props.tooltip;
  if (value === false) return null;
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const { content } = value as AvatarTooltipOptions;
    return content === undefined ? props.name : content;
  }
  return props.name;
});

interface ResolvedTooltipConfig {
  placement: AvatarTooltipPlacement;
  trigger: string;
  openDelay: number;
  closeDelay: number;
  offset: number;
  arrow: boolean;
  theme: AvatarTooltipTheme;
  interactive: boolean;
  disabled: boolean;
}

const tooltipConfig = computed<ResolvedTooltipConfig>(() => ({
  placement: pick("placement", "tooltipPlacement", "top"),
  trigger: pick("trigger", "tooltipTrigger", "hover focus"),
  openDelay: pick("delay", "tooltipDelay", 200),
  closeDelay: pick("hideDelay", "tooltipHideDelay", 100),
  offset: pick("offset", "tooltipOffset", 8),
  arrow: pick("arrow", "tooltipArrow", true),
  theme: pick("theme", "tooltipTheme", "dark"),
  interactive: pick("interactive", "tooltipInteractive", false),
  disabled: pick("disabled", "tooltipDisabled", false),
}));

const tooltipEnabled = computed(() => {
  if (props.nativeTitle) return false;
  if (tooltipConfig.value.disabled) return false;
  if (slots.tooltip) return true;
  return Boolean(tooltipContent.value);
});

const {
  isOpen: tooltipOpen,
  referenceProps: tooltipListeners,
  floatingProps: tooltipFloatingListeners,
} = useTooltip(() => ({
  trigger: tooltipConfig.value.trigger,
  openDelay: tooltipConfig.value.openDelay,
  closeDelay: tooltipConfig.value.closeDelay,
  interactive: tooltipConfig.value.interactive,
  disabled: !tooltipEnabled.value,
}));

/**
 * Everything bound to the root, with the avatar's own handlers and the
 * tooltip's composed rather than one overwriting the other.
 */
const rootBindings = computed(() =>
  mergeBindings(rootAttrs.value, rootListeners.value, tooltipListeners.value)
);

/**
 * A tooltip that only repeats the accessible label would be announced twice,
 * so it is described only when it actually adds something.
 */
const describedBy = computed(() => {
  if (!tooltipEnabled.value || !tooltipOpen.value) return undefined;
  if (slots.tooltip) return tooltipId;
  return tooltipContent.value === accessibleLabel.value ? undefined : tooltipId;
});

/** `imageSrc` followed by every `fallbackSrc`, in the order they are tried. */
const sourceChain = computed(() => {
  const chain = [];
  if (props.imageSrc) chain.push(props.imageSrc);
  if (Array.isArray(props.fallbackSrc))
    props.fallbackSrc.forEach((src) => src && chain.push(src));
  else if (props.fallbackSrc) chain.push(props.fallbackSrc);
  return chain;
});

const currentSrc = computed(() => sourceChain.value[fallbackIndex.value]);

/** `/a/pic.png` -> `/a/pic.png 1x, /a/pic@2x.png 2x`. */
function retinaSrcset(src: string): string | null {
  const match = /^(.*?)(\.[a-z0-9]+)((?:\?|#).*)?$/i.exec(src);
  if (!match) return null;
  const [, base, extension, suffix] = match;
  return `${src} 1x, ${base}@2x${extension}${suffix || ""} 2x`;
}

const resolvedSrcset = computed(() => {
  if (props.srcset) return props.srcset;
  if (props.retina && currentSrc.value) return retinaSrcset(currentSrc.value);
  return null;
});

/** True while an image is expected but has not painted yet. */
const showSkeleton = computed(
  () => hasMounted.value && props.skeleton && showImage() && !isLoaded.value
);

const skeletonStyle = computed<CSSProperties>(() => {
  const size = getConfig("size", props.size, 40);
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: shapeStyle.value.borderRadius,
    clipPath: shapeStyle.value.clipPath,
  };
});

// A new source deserves a fresh attempt: without this, an avatar that failed
// once stays stuck on initials even after `imageSrc` is swapped for a good URL.
watch(
  () => props.imageSrc,
  () => {
    imageError.value = false;
    isLoaded.value = false;
    fallbackIndex.value = 0;
  }
);

function onImageError(event: Event): void {
  isLoaded.value = false;

  const failedSrc = currentSrc.value;
  const nextIndex = fallbackIndex.value + 1;

  if (nextIndex < sourceChain.value.length) {
    fallbackIndex.value = nextIndex;
    emit("fallback", {
      failedSrc,
      nextSrc: sourceChain.value[nextIndex],
      remaining: sourceChain.value.length - nextIndex - 1,
      event,
    });
    return;
  }

  // Chain exhausted: fall through to initials or pixel art.
  imageError.value = true;
  emit("error", event);
}

function onImageLoad(event: Event): void {
  isLoaded.value = true;
  emit("load", event);
}

function showImage(): boolean {
  return Boolean(currentSrc.value) && !imageError.value;
}
</script>

<style scoped>
.avatar {
  font-family: Georgia, "Times New Roman", serif;
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
.container.reset-native {
  appearance: none;
  -webkit-appearance: none;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: none;
  display: inline-block;
  line-height: 0;
}
.container.is-disabled {
  opacity: 0.5;
}
.container.is-disabled,
.container.is-disabled * {
  cursor: not-allowed !important;
  pointer-events: none;
}
.container.is-selected {
  box-shadow: 0 0 0 2px var(--va-ring-color, #2563eb);
  border-radius: var(--va-radius);
}
.container:focus-visible {
  outline: 2px solid var(--va-focus-ring, #2563eb);
  outline-offset: 2px;
}
.status-indicator {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
}
.status-pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  animation: va-status-pulse 2s ease-out infinite;
}
@keyframes va-status-pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}
.avatar-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
}
/*
 * The label is a separate box because `text-overflow` applies to the element
 * holding the text, not to a flex container wrapping it.
 */
.avatar-badge__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.container img.image-transition {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.container img.image-transition.image-loaded {
  opacity: 1;
}
.avatar-edit {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  padding: 0;
  border: 0;
  border-radius: var(--va-radius);
  clip-path: var(--va-clip-path);
  background: var(--va-edit-overlay-bg, rgba(0, 0, 0, 0.45));
  color: var(--va-edit-overlay-color, #ffffff);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.container:hover .avatar-edit,
.avatar-edit:focus-visible {
  opacity: 1;
}
.avatar-edit:focus-visible {
  outline: 2px solid var(--va-focus-ring, #2563eb);
  outline-offset: 2px;
}
/* Visually hidden but still clickable from onEdit(). */
.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.avatar-skeleton {
  position: absolute;
  inset: 0;
  background-color: var(--va-skeleton-bg, #e5e7eb);
  background-image: linear-gradient(
    90deg,
    transparent,
    var(--va-skeleton-shimmer, rgba(255, 255, 255, 0.6)),
    transparent
  );
  background-size: 200% 100%;
  animation: va-skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes va-skeleton-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

/* Kept last so it wins over the animated defaults above. */
@media (prefers-reduced-motion: reduce) {
  .status-pulse::after {
    animation: none;
    display: none;
  }
  .container img.image-transition {
    transition: none;
  }
  .avatar-skeleton {
    animation: none;
    background-image: none;
  }
  .avatar-edit {
    transition: none;
  }
}
</style>
