<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="va-tooltip">
      <div
        v-if="open"
        :id="tooltipId"
        ref="floating"
        role="tooltip"
        class="va-tooltip"
        :class="[`va-tooltip--${theme}`, { 'va-tooltip--interactive': interactive }]"
        :data-placement="actualPlacement"
        :style="floatingStyle"
        v-bind="$attrs"
      >
        <slot></slot>
        <span v-if="arrow" class="va-tooltip__arrow" :style="arrowStyle"></span>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
export default { name: "AvatarTooltip", inheritAttrs: false };
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { CSSProperties, PropType } from "vue";
import { useFloating } from "../composables/useFloating";
import { PLACEMENTS } from "../utils/position";
import type { AvatarTooltipPlacement, AvatarTooltipTheme } from "../types";

let uid = 0;

const props = defineProps({
  open: { type: Boolean, default: false },
  /** The element the tooltip points at. */
  reference: {
    type: null as unknown as PropType<HTMLElement | null>,
    default: null,
  },
  id: { type: String, default: null },
  placement: {
    type: String as PropType<AvatarTooltipPlacement>,
    default: "top",
    validator: (value: AvatarTooltipPlacement) => PLACEMENTS.includes(value),
  },
  offset: { type: Number, default: 8 },
  padding: { type: Number, default: 8 },
  arrow: { type: Boolean, default: true },
  theme: {
    type: String as PropType<AvatarTooltipTheme>,
    default: "dark",
    validator: (value: string) => ["dark", "light", "auto"].includes(value),
  },
  interactive: { type: Boolean, default: false },
  maxWidth: { type: Number, default: 240 },
});

const ARROW_SIZE = 8;

// Teleport must not run during SSR, and measuring needs a real layout, so
// nothing renders until the client has mounted.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const tooltipId = computed(() => props.id || `va-tooltip-${(uid += 1)}`);

const floating = ref<HTMLElement | null>(null);
const referenceRef = computed<HTMLElement | null>(
  () => (props.reference as HTMLElement | null) || null
);

const { x, y, placement: actualPlacement, arrowX, arrowY, isPositioned, update } =
  useFloating(referenceRef, floating, () => ({
    placement: props.placement,
    offset: props.offset,
    padding: props.padding,
    arrowSize: ARROW_SIZE,
  }));

// Content can change while the tooltip is open (a status flipping, say), which
// changes its size and therefore its position.
watch(() => props.placement, update);

const floatingStyle = computed<CSSProperties>(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  transform: `translate3d(${Math.round(x.value)}px, ${Math.round(y.value)}px, 0)`,
  maxWidth: `${props.maxWidth}px`,
  // Avoid a flash at 0,0 on the first frame, before measurement has happened.
  visibility: isPositioned.value ? "visible" : "hidden",
}));

const arrowStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: `${ARROW_SIZE}px`,
    height: `${ARROW_SIZE}px`,
  };
  const side = String(actualPlacement.value).split("-")[0];
  const inset = `${-ARROW_SIZE / 2}px`;

  if (arrowX.value !== null) style.left = `${arrowX.value}px`;
  if (arrowY.value !== null) style.top = `${arrowY.value}px`;

  if (side === "top") style.bottom = inset;
  else if (side === "bottom") style.top = inset;
  else if (side === "left") style.right = inset;
  else style.left = inset;

  return style;
});

defineExpose({ tooltipId, update });
</script>

<style>
.va-tooltip {
  z-index: var(--va-tooltip-z-index, 9999);
  box-sizing: border-box;
  padding: var(--va-tooltip-padding, 6px 10px);
  border-radius: var(--va-tooltip-radius, 6px);
  background: var(--va-tooltip-bg, #1f2937);
  color: var(--va-tooltip-color, #ffffff);
  font-family: var(
    --va-tooltip-font-family,
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif
  );
  font-size: var(--va-tooltip-font-size, 13px);
  line-height: var(--va-tooltip-line-height, 1.4);
  font-weight: var(--va-tooltip-font-weight, 500);
  box-shadow: var(--va-tooltip-shadow, 0 4px 12px rgba(0, 0, 0, 0.18));
  pointer-events: none;
  word-break: break-word;
}
.va-tooltip--interactive {
  pointer-events: auto;
}
.va-tooltip__arrow {
  position: absolute;
  background: inherit;
  transform: rotate(45deg);
  border-radius: 1px;
  pointer-events: none;
}
.va-tooltip--light {
  --va-tooltip-bg: #ffffff;
  --va-tooltip-color: #1f2937;
  box-shadow: var(
    --va-tooltip-shadow,
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 0, 0, 0.06)
  );
}
@media (prefers-color-scheme: light) {
  .va-tooltip--auto {
    --va-tooltip-bg: #1f2937;
    --va-tooltip-color: #ffffff;
  }
}
@media (prefers-color-scheme: dark) {
  .va-tooltip--auto {
    --va-tooltip-bg: #f9fafb;
    --va-tooltip-color: #111827;
  }
}

.va-tooltip-enter-active,
.va-tooltip-leave-active {
  transition: opacity 0.15s ease;
}
.va-tooltip-enter-from,
.va-tooltip-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .va-tooltip-enter-active,
  .va-tooltip-leave-active {
    transition: none;
  }
}
</style>
