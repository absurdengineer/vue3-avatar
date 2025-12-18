<script>
import { h, defineComponent, Fragment, Comment, Text, cloneVNode } from 'vue';

export default defineComponent({
  name: 'AvatarGroup',
  props: {
    max: { type: Number },
    overlap: { type: Number, default: 10 },
    borderColor: { type: String, default: 'white' },
    size: { type: Number, default: 40 },
    layout: {
      type: String,
      default: 'stack', // stack | triangle
      validator: (value) => ['stack', 'triangle'].includes(value),
    },
  },
  setup(props, { slots }) {
    
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

    return () => {
      const defaultSlot = slots.default ? slots.default() : [];
      const children = flatten(defaultSlot);
      
      let visible = children;
      let overflowCount = 0;
      
      if (props.max && children.length > props.max) {
        visible = children.slice(0, props.max);
        overflowCount = children.length - props.max;
      }
      
      const overflowBadge = overflowCount > 0 ? h('div', { 
         class: 'avatar-overflow',
         style: {
             width: `${props.size}px`,
             height: `${props.size}px`,
             fontSize: `${props.size / 2.5}px`
         }
      }, `+${overflowCount}`) : null;

      const visibleWithProps = visible.map(child => {
        return cloneVNode(child, {
          size: props.size,
          borderColor: props.borderColor,
        });
      });

      return h('div', { 
          class: ['avatar-group', `layout-${props.layout}`],
          style: {
             '--va-group-overlap': `-${props.overlap}px`,
             '--va-size': `${props.size}px`,
          }
      }, [
          ...visibleWithProps,
          overflowBadge
      ]);
    };
  }
});
</script>

<style>
.avatar-group {
    display: flex;
    align-items: center;
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
    width: calc(var(--va-size) * 1.55); /* Increased for less overlap */
    height: calc(var(--va-size) * 1.35);
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
