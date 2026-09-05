<script lang="ts">
import {
  h,
  defineComponent,
  Fragment,
  Comment,
  Text,
  cloneVNode,
  inject,
  ref,
} from "vue";
import type { PropType, VNode } from "vue";
import type {
  AvatarGroupLayout,
  AvatarTooltipPlacement,
  AvatarTooltipTheme,
} from "../types";
import { AvatarConfigKey, createConfigResolver } from "../utils/config";
import AvatarTooltip from "./AvatarTooltip.vue";
import { useTooltip } from "../composables/useTooltip";
import { PLACEMENTS } from "../utils/position";

export default defineComponent({
  name: "AvatarGroup",
  props: {
    max: { type: Number },
    overlap: { type: Number, default: 10 },
    borderColor: { type: String, default: "white" },
    size: { type: Number, default: 40 },
    layout: {
      type: String as PropType<AvatarGroupLayout>,
      default: "stack", // stack | triangle
      validator: (value: string) => ["stack", "triangle"].includes(value),
    },
    onClick: {
      type: Function as unknown as PropType<
        ((event: MouseEvent | KeyboardEvent) => void) | null
      >,
      default: null,
    },
    pointer: { type: Boolean, default: false },
    /** Tooltip listing the hidden names on the "+N" badge. `false` disables it. */
    overflowTooltip: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: undefined,
    },
    tooltipPlacement: {
      type: String as PropType<AvatarTooltipPlacement>,
      default: "top",
      validator: (value: any) => PLACEMENTS.includes(value),
    },
    tooltipTheme: {
      type: String as PropType<AvatarTooltipTheme>,
      default: "dark",
      validator: (value: string) => ["dark", "light", "auto"].includes(value),
    },
    /** Restores the v4 behaviour of native `title` attributes. */
    nativeTitle: { type: Boolean, default: false },
  },
  emits: ["overflow-click"],
  setup(props, { slots, emit }) {
    const flatten = (nodes: VNode[]): VNode[] => {
      let result: VNode[] = [];
      for (const node of nodes) {
        if (node.type === Fragment && Array.isArray(node.children)) {
          result = result.concat(flatten(node.children as VNode[]));
        } else if (node.type !== Comment) {
          // Skip empty text nodes
          if (node.type === Text) {
            if (String(node.children).trim().length === 0) continue;
          }
          result.push(node);
        }
      }
      return result;
    };

    const globalConfig = inject(AvatarConfigKey, {});
    const getConfig = createConfigResolver(globalConfig);

    const overflowEl = ref<HTMLElement | null>(null);
    const overflowTooltipId = `va-group-tooltip-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const {
      isOpen: overflowTooltipOpen,
      referenceProps: overflowTooltipListeners,
    } = useTooltip(() => ({
      disabled: props.nativeTitle || props.overflowTooltip === false,
    }));

    return () => {
      const defaultSlot = slots.default ? slots.default() : [];
      const children = flatten(defaultSlot);

      let visible = children;
      let overflowCount = 0;

      let effectiveMax = props.max;
      if (props.layout === "triangle") {
        const limit = props.max ? Math.min(props.max, 3) : 3;
        if (children.length > limit) {
          effectiveMax = limit - 1;
        } else {
          effectiveMax = limit;
        }
      }

      // `!= null` rather than a truthiness check: the triangle layout can
      // legitimately compute an effective maximum of 0 (max=1 leaves the single
      // slot to the overflow badge), and a falsy test would skip the limit
      // entirely and render every child.
      if (effectiveMax != null && children.length > effectiveMax) {
        visible = children.slice(0, effectiveMax);
        overflowCount = children.length - effectiveMax;
      }

      const allNames = children
        .map((child) => child.props && (child.props as any).name)
        .filter(Boolean)
        .join(", ");

      const hiddenChildren =
        overflowCount > 0 ? children.slice(effectiveMax) : [];
      const hiddenNames = hiddenChildren
        .map((child) => child.props && (child.props as any).name)
        .filter(Boolean)
        .join(", ");

      // Extract all user data
      const allUsers = children
        .map((child) => child.props)
        .filter(Boolean) as Record<string, unknown>[];

      // Extract hidden user data for the event payload
      const hiddenUsers = hiddenChildren
        .map((child) => child.props)
        .filter(Boolean) as Record<string, unknown>[];

      const handleOverflowClick = (e: MouseEvent) => {
        e.stopPropagation();
        emit("overflow-click", hiddenUsers, allUsers);
      };

      const handleGroupKeydown = (event: KeyboardEvent) => {
        if (!props.onClick) return;
        // Same normalisation as Avatar: environments disagree on the casing of
        // `key`, and "Spacebar"/"space" are the older spellings of " ".
        const key = String(event.key || "").toLowerCase();
        const isActivation =
          key === "enter" ||
          key === " " ||
          key === "spacebar" ||
          key === "space" ||
          event.keyCode === 13 ||
          event.keyCode === 32;
        if (!isActivation) return;
        event.preventDefault();
        props.onClick(event);
      };

      const size = getConfig("size", props.size, 40);
      const borderColor = getConfig("borderColor", props.borderColor, "white");
      const overlap = getConfig("overlap", props.overlap, 10);

      const overflowTooltipContent =
        typeof props.overflowTooltip === "string"
          ? props.overflowTooltip
          : hiddenNames;
      const showOverflowTooltip =
        overflowCount > 0 &&
        !props.nativeTitle &&
        props.overflowTooltip !== false &&
        Boolean(overflowTooltipContent || slots["overflow-tooltip"]);

      const overflowBadge =
        overflowCount > 0
          ? h(
              "button",
              {
                ref: overflowEl,
                type: "button",
                class: "avatar-overflow",
                title: props.nativeTitle ? hiddenNames : undefined,
                "aria-label": `Show ${overflowCount} more avatar${
                  overflowCount === 1 ? "" : "s"
                }${hiddenNames ? `: ${hiddenNames}` : ""}`,
                // The aria-label already names the hidden users, so the tooltip
                // is decoration here rather than a description.
                onClick: handleOverflowClick,
                ...(showOverflowTooltip ? overflowTooltipListeners.value : {}),
                style: {
                  width: `${size}px`,
                  height: `${size}px`,
                  fontSize: `${size / 2.5}px`,
                  cursor: "pointer",
                },
              },
              `+${overflowCount}`
            )
          : null;

      const overflowTooltipNode = showOverflowTooltip
        ? h(
            AvatarTooltip,
            {
              id: overflowTooltipId,
              open: overflowTooltipOpen.value,
              reference: overflowEl.value,
              placement: props.tooltipPlacement,
              theme: props.tooltipTheme,
              "aria-hidden": "true",
            },
            {
              default: () =>
                slots["overflow-tooltip"]
                  ? slots["overflow-tooltip"]({
                      hiddenUsers,
                      allUsers,
                      overflowCount,
                      hiddenNames,
                    })
                  : overflowTooltipContent,
            }
          )
        : null;

      const visibleWithProps = visible.map((child) => {
        return cloneVNode(child, {
          size: size,
          borderColor: borderColor,
        });
      });

      return h(
        "div",
        {
          class: [
            "avatar-group",
            `layout-${props.layout}`,
            { "is-clickable": props.pointer || !!props.onClick },
          ],
          title: props.nativeTitle ? allNames : undefined,
          role: props.onClick ? "button" : undefined,
          tabindex: props.onClick ? 0 : undefined,
          "aria-label": props.onClick
            ? `Avatar group${allNames ? `: ${allNames}` : ""}`
            : undefined,
          onClick: (e: MouseEvent) => props.onClick && props.onClick(e),
          onKeydown: handleGroupKeydown,
          style: {
            "--va-group-overlap": `-${overlap}px`,
            "--va-size": `${size}px`,
          },
        },
        [...visibleWithProps, overflowBadge, overflowTooltipNode]
      );
    };
  },
});
</script>

<style>
.avatar-group {
  display: flex;
  align-items: center;
}
.avatar-group.is-clickable {
  cursor: pointer;
}
.avatar-group:focus-visible {
  outline: 2px solid var(--va-focus-ring, #2563eb);
  outline-offset: 2px;
}
.avatar-group.is-clickable * {
  cursor: pointer !important;
}
.avatar-group.layout-stack > * {
  margin-left: 0;
}
.avatar-group.layout-stack > * + * {
  margin-left: var(--va-group-overlap);
}
.avatar-group.layout-triangle {
  position: relative;
  display: inline-block;
  width: calc(
    var(--va-size) * 1.8
  ); /* Wider for better visibility of back avatars */
  height: calc(var(--va-size) * 1.45);
}
.avatar-group.layout-triangle > * {
  position: absolute !important;
}
.avatar-group.layout-triangle > *:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10 !important;
}
.avatar-group.layout-triangle > *:nth-child(2) {
  bottom: 0;
  left: 0;
  z-index: 5 !important;
}
.avatar-group.layout-triangle > *:nth-child(3) {
  bottom: 0;
  right: 0;
  z-index: 1 !important;
}
.avatar-overflow {
  display: flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  background: #ccc;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-family: sans-serif;
  border: 2px solid white; /* Hardcoded default? */
  box-sizing: border-box;
  position: relative; /* To stack properly */
  padding: 0;
}
.avatar-overflow:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
</style>
