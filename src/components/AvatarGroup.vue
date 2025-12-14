<script>
import { h, defineComponent, Fragment, Comment, Text } from 'vue';

export default defineComponent({
  name: 'AvatarGroup',
  props: {
    max: { type: Number },
    overlap: { type: Number, default: 10 },
    borderColor: { type: String, default: 'white' },
    size: { type: Number, default: 40 },
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

      return h('div', { 
          class: 'avatar-group',
          style: {
             '--va-group-overlap': `-${props.overlap}px`,
          }
      }, [
          ...visible,
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
.avatar-group > * {
    margin-left: 0;
}
.avatar-group > * + * {
    margin-left: var(--va-group-overlap);
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
