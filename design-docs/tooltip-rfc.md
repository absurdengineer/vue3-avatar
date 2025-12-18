# RFC: Tooltip Implementation Strategy

## Context
We need a way to show user details (e.g., Name) when hovering over an Avatar, especially useful in `AvatarGroup` where names are hidden.

## Options

### Option 1: Native Title Attribute
**Pros:** Simple, lightweight, zero dependencies, accessible.
**Cons:** Not customizable, slow native delay, inconsistent cross-browser.
**Implementation:** Just add `title="props.name"` to the root element.

### Option 2: Built-in Tooltip Component
**Pros:** Full control over visuals (matches design system), instant.
**Cons:** Adds complexity (positioning logic, z-index hell), increases bundle size.

### Option 3: Slot/Event Hooks (Recommended)
**Pros:** Flexible. Allows users to hook up their own tooltip library (Tippy.js, Floating Vue) without us shipping one.
**Cons:** Requires setup by the user.

## Recommendation for v4.0
**Hybrid Approach:**
1.  **Default**: Use native `title` attribute if `props.name` is present.
2.  **Enhancement**: Emit events (`mouseenter`, `mouseleave`) so users can easily attach custom tooltips.
3.  **Future**: Maybe a lightweight "tooltip" slot that renders a div relative to the avatar?

## Decision
For **v4.0**, we will stick to the **Native Title Attribute** as the MVP. It solves the core "identification" problem without bloat.
We will add a simple `title` prop that defaults to `name` but can be overridden.
