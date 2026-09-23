# RFC: Tooltip Implementation Strategy

> **Superseded in v5.** This RFC chose Option 1 (the native `title` attribute)
> for v4. v5 reverses that and implements Option 2: a built-in tooltip with its
> own dependency-free positioning engine. The "cons" listed below were real, and
> are addressed rather than dismissed — positioning lives in a pure, tested
> module (`src/utils/position.js`), the tooltip teleports to `document.body`
> instead of fighting z-index, and the ~4 kB gzipped cost is held in place by a
> bundle-size budget in CI. `native-title` restores the behaviour described
> here. See `docs/components/tooltip.md` and `docs/migration/v4-to-v5.md`.

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
