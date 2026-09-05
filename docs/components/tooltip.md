---
title: Tooltips
description: Styled, collision-aware tooltips for the vue3-avatar Avatar and AvatarGroup components.
---

# Tooltips

Every avatar carries a tooltip. By default it shows the avatar's `name`, and it
replaces the native `title` attribute used up to v4.

```vue
<Avatar name="Tony Stark" />
```

The tooltip is positioned by a dependency-free engine built into the package —
there is no `@floating-ui` or Popper dependency to install. It flips to the
opposite side when it would overflow, slides along the cross axis to stay
inside the viewport, and keeps its arrow pointing at the avatar while it does.
It renders through a `<Teleport>` to `document.body`, so it escapes
`overflow: hidden` ancestors such as scrolling lists and table cells.

## Content

| Value | Result |
| --- | --- |
| unset | Uses `name`. |
| a string | Uses that string. |
| `false` | No tooltip at all. |
| an object | `{ content, ...options }`, overriding the individual props below. |

```vue
<Avatar name="Tony Stark" tooltip="Product Designer" />
<Avatar name="Tony Stark" :tooltip="false" />
<Avatar name="Tony Stark" :tooltip="{ content: 'On leave', placement: 'right' }" />
```

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tooltipPlacement` | `String` | `'top'` | One of twelve placements: `top`, `bottom`, `left`, `right`, each optionally suffixed `-start` or `-end`. |
| `tooltipTrigger` | `String` | `'hover focus'` | Space-separated combination of `hover`, `focus`, `click`, and `manual`. |
| `tooltipDelay` | `Number` | `200` | Milliseconds before opening. |
| `tooltipHideDelay` | `Number` | `100` | Milliseconds before closing. |
| `tooltipOffset` | `Number` | `8` | Gap between the avatar and the tooltip. |
| `tooltipArrow` | `Boolean` | `true` | Shows the arrow. |
| `tooltipTheme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | `auto` follows `prefers-color-scheme`. |
| `tooltipInteractive` | `Boolean` | `false` | Keeps the tooltip open while the pointer is inside it, so links and buttons in it are reachable. |
| `tooltipDisabled` | `Boolean` | `false` | Runtime kill switch, separate from `tooltip: false`. |
| `nativeTitle` | `Boolean` | `false` | Restores the v4 `title` attribute and disables the styled tooltip. |

Any of these can also be set app-wide through the plugin's `defaults`:

```js
app.use(Avatar, {
  defaults: { tooltipTheme: "light", tooltipDelay: 400 },
});
```

## Rich tooltips

The `tooltip` slot replaces the body, which is how you build a hover card.
Pair it with `tooltipInteractive` when the card contains anything clickable.

```vue
<Avatar name="Tony Stark" image-src="/tony.jpg" status="busy" tooltip-interactive>
  <template #tooltip="{ nameValue, status }">
    <strong>{{ nameValue }}</strong>
    <div>Chief Engineer &middot; {{ status }}</div>
    <a href="/users/tony">View profile</a>
  </template>
</Avatar>
```

## Triggers and touch

`hover focus` is the default. Focus only opens the tooltip on keyboard focus,
so clicking an avatar does not leave one hanging around, and only avatars that
are already focusable — `interactive`, `pointer`, `onClick`, or `as="button"` /
`as="a"` — can be reached by the keyboard. Making every decorative avatar a tab
stop would clutter keyboard navigation, so the component does not do it for you.

On touch devices a long press (500 ms) opens the tooltip; a quick tap does not,
which leaves taps free to activate a clickable avatar.

`Escape` closes an open tooltip.

## Accessibility

The tooltip is a `role="tooltip"` element referenced by `aria-describedby` —
but only when its content differs from the avatar's accessible label. A tooltip
that merely repeats the name would otherwise be announced twice.

Transitions are disabled under `prefers-reduced-motion: reduce`.

## Group overflow

`AvatarGroup` gives the "+N" badge a tooltip listing the hidden names.

```vue
<AvatarGroup :max="3">
  <Avatar v-for="user in users" :key="user.id" :name="user.name" />

  <template #overflow-tooltip="{ hiddenUsers, overflowCount }">
    {{ overflowCount }} more: {{ hiddenUsers.map((u) => u.name).join(", ") }}
  </template>
</AvatarGroup>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `overflowTooltip` | `Boolean \| String` | — | Overrides the tooltip content, or disables it with `false`. |
| `tooltipPlacement` | `String` | `'top'` | Placement for the overflow tooltip. |
| `tooltipTheme` | `String` | `'dark'` | Theme for the overflow tooltip. |
| `nativeTitle` | `Boolean` | `false` | Restores the v4 `title` attributes on the group and its badge. |

## Styling

Colours and metrics are CSS variables, so no `!important` is needed:

```css
.va-tooltip {
  --va-tooltip-bg: #111827;
  --va-tooltip-color: #f9fafb;
  --va-tooltip-radius: 4px;
  --va-tooltip-font-size: 12px;
  --va-tooltip-padding: 4px 8px;
  --va-tooltip-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  --va-tooltip-z-index: 9999;
}
```

## Using the pieces directly

The positioning engine and the state machine are exported, so you can build
your own floating elements on them:

```js
import { computePosition, useFloating, useTooltip } from "vue3-avatar";

const { x, y, placement, arrow } = computePosition(referenceRect, floatingRect, {
  placement: "bottom-start",
  boundary: { x: 0, y: 0, width: innerWidth, height: innerHeight },
});
```

`computePosition` is pure — rects in, coordinates out — with no DOM access, so
it is safe on the server and easy to test. `useFloating` adds the measurement,
scroll and resize tracking; `useTooltip` owns delays, triggers and Escape.
