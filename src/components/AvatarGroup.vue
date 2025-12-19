<script>
import {
  h,
  defineComponent,
  Fragment,
  Comment,
  Text,
  cloneVNode,
  inject,
} from "vue";
import { AvatarConfigKey } from "../utils/config";

export default defineComponent({
  name: "AvatarGroup",
  props: {
    max: { type: Number },
    overlap: { type: Number, default: 10 },
    borderColor: { type: String, default: "white" },
    size: { type: Number, default: 40 },
    layout: {
      type: String,
      default: "stack", // stack | triangle
      validator: (value) => ["stack", "triangle"].includes(value),
    },
    onClick: { type: Function, default: null },
    pointer: { type: Boolean, default: false },
  },
  emits: ["overflow-click"],
  setup(props, { slots, emit }) {
    const flatten = (nodes) => {
      let result = [];
      for (const node of nodes) {
        if (node.type === Fragment && Array.isArray(node.children)) {
          result = result.concat(flatten(node.children));
        } else if (node.type !== Comment) {
          // Skip empty text nodes
          if (node.type === Text) {
            if (node.children.trim().length === 0) continue;
          }
          result.push(node);
        }
      }
      return result;
    };

    const globalConfig = inject(AvatarConfigKey, {});

    const getConfig = (key, localValue, defaultValue) => {
      if (localValue !== undefined && localValue !== defaultValue)
        return localValue;
      return globalConfig[key] !== undefined ? globalConfig[key] : defaultValue;
    };

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

      if (effectiveMax && children.length > effectiveMax) {
        visible = children.slice(0, effectiveMax);
        overflowCount = children.length - effectiveMax;
      }

      const allNames = children
        .map((child) => child.props && child.props.name)
        .filter(Boolean)
        .join(", ");

      const hiddenChildren =
        overflowCount > 0 ? children.slice(effectiveMax) : [];
      const hiddenNames = hiddenChildren
        .map((child) => child.props && child.props.name)
        .filter(Boolean)
        .join(", ");

      // Extract all user data
      const allUsers = children.map((child) => child.props).filter(Boolean);

      // Extract hidden user data for the event payload
      const hiddenUsers = hiddenChildren
        .map((child) => child.props)
        .filter(Boolean);

      const handleOverflowClick = (e) => {
        e.stopPropagation(); // Prevent triggering group onClick
        emit("overflow-click", hiddenUsers, allUsers);
      };

      const size = getConfig("size", props.size, 40);
      const borderColor = getConfig("borderColor", props.borderColor, "white");
      const overlap = getConfig("overlap", props.overlap, 10);

      const overflowBadge =
        overflowCount > 0
          ? h(
              "div",
              {
                class: "avatar-overflow",
                title: hiddenNames,
                onClick: handleOverflowClick,
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
          title: allNames,
          onClick: (e) => props.onClick && props.onClick(e),
          style: {
            "--va-group-overlap": `-${overlap}px`,
            "--va-size": `${size}px`,
          },
        },
        [...visibleWithProps, overflowBadge]
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
  background: #ccc;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-family: sans-serif;
  border: 2px solid white; /* Hardcoded default? */
  box-sizing: border-box;
  position: relative; /* To stack properly */
}
</style>
