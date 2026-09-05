---
title: Migrating from v4 to v5
description: The two breaking changes in vue3-avatar v5, and what is new.
---

# Migrating from v4 to v5

v5 is additive apart from two changes. Most projects need no code changes at
all; the two below are worth a look before you upgrade.

## Breaking: the native `title` attribute is gone

**What changed.** In v4 every avatar rendered `title="{name}"`, and
`AvatarGroup` rendered `title` on both the group root and the `+N` badge. v5
replaces these with a styled tooltip that is positioned properly, appears
without the browser's ~1 second delay, works on touch, and can be themed.

**Why.** The native `title` could not be styled, never appeared on touch
devices, rendered inconsistently across browsers, and duplicated the
`aria-label` that was already present.

**What to do.** Nothing, in most cases — you get a better tooltip for free.

If you were selecting or asserting on the attribute, note that it is no longer
there:

```js
// v4
wrapper.find(".container").attributes("title"); // "John Doe"

// v5
wrapper.find(".container").attributes("title"); // undefined
```

If you styled or relied on the browser's own tooltip, restore it with
`nativeTitle`, which also turns the styled tooltip off:

```vue
<Avatar name="Tony Stark" native-title />
<AvatarGroup native-title>...</AvatarGroup>
```

To have neither, use `:tooltip="false"`.

The group root no longer carries a tooltip listing every name at all. Each
child avatar has its own, so the container version was always a duplicate.
`native-title` restores it if you need it.

## Breaking: status colours and positioning changed

**What changed.**

- The four presence colours moved from CSS keywords to hexadecimal tokens:
  `green` → `#22c55e`, `orange` → `#f59e0b`, `red` → `#ef4444`,
  `grey` → `#9ca3af`.
- An unknown `status` value now falls back to the offline grey rather than the
  busy red.
- The indicator is inset from the corner by an amount that depends on `shape`,
  so it sits on the avatar's outline instead of in the empty corner of its
  bounding box. Squares are unchanged; a 40 px circle moves in by 3 px.

**Why.** The CSS keywords sit at wildly different luminances, so a white ring
around them read inconsistently, and a circular avatar's corner is nowhere near
its visible edge.

**What to do.** Nothing, unless you asserted on the old values or matched the
old colours elsewhere in your design. To pin the previous look:

```vue
<Avatar
  name="Tony Stark"
  status="online"
  :status-colors="{ online: 'green', away: 'orange', busy: 'red', offline: 'grey' }"
  :custom-status-style="{ bottom: '0px', right: '0px' }"
/>
```

`statusColors` is also accepted in the plugin's `defaults`, so you can set it
once for the whole app.

## What is new

- **[Tooltips](/components/tooltip)** — a built-in, dependency-free positioning
  engine with twelve placements, flip and shift collision handling, an arrow,
  themes, and a `tooltip` slot for rich hover cards.
- **Status** — `statusColor`, `statusColors`, `statusSize`, `statusLabel`,
  `statusPulse`, and custom status names.
- **Badges** — `badge`, `badgeVariant`, `badgeMax`, `badgePosition`,
  `badgeColor`, `badgeTextColor`, `badgeLabel`, and a `badge` slot.
- **Images** — `fallbackSrc` chains, a loading `skeleton`, `retina`, and
  `srcset` / `sizes` / `crossorigin` / `referrerpolicy` / `decoding`
  passthrough. A `@fallback` event fires between attempts; `@error` now fires
  only once every source has failed.
- **Interaction** — `as="button"` / `as="a"`, `href` / `target` / `rel`,
  `disabled`, `selected`, and an `editable` overlay with file-input wiring.
- **A fixed bug**: changing `imageSrc` after a load failure left the avatar
  stuck on initials. It now retries with the new source.
- **A fixed accessibility gap**: the avatar had no focus ring at all. It now
  has one, styleable through `--va-focus-ring`.

## Upgrading

```bash
npm install vue3-avatar@5
```
