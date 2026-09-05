---
title: What's new in v5
description: Tooltips with a real positioning engine, badges, image fallback chains, proper interaction semantics, and a TypeScript source.
---

# What's new in v5

v5 is the largest release since the package was written. Four areas that were
thin are now the reason to reach for it, and the whole source is TypeScript.

If you are upgrading, read the [migration guide](/migration/v4-to-v5) first —
there are three breaking changes, each with a one-line escape hatch. The
[changelog](https://github.com/absurdengineer/vue3-avatar/blob/master/CHANGELOG.md)
has the exhaustive list.

## Tooltips that actually work

v4 used the native `title` attribute. It cannot be styled, waits about a second
before appearing, never shows on touch, renders differently in every browser,
and repeats the `aria-label` that is already there.

v5 ships a real tooltip with its own positioning engine — no dependency, no
Floating UI, about 3 kB of the bundle:

- **Twelve placements.** `top`, `bottom`, `left`, `right`, each with `-start`
  and `-end`.
- **Collision handling.** Flips to the opposite side when it would overflow,
  and slides along the cross axis to stay in view. When both sides overflow it
  picks the roomier one rather than giving up.
- **An arrow that keeps pointing at the avatar** after the bubble has been slid
  sideways.
- **Escapes clipping ancestors.** It renders through a `<Teleport>`, so an
  `overflow: hidden` parent no longer cuts it in half. Real scroll boxes still
  constrain it, which is what you want inside a scrollable list.
- **Hover, keyboard focus, click and long-press** triggers, with independent
  open and close delays and `Escape` to close.

```vue
<Avatar
  name="Ada Lovelace"
  tooltip="Countess of Lovelace"
  tooltip-placement="right"
  tooltip-theme="auto"
/>
```

The `#tooltip` slot takes arbitrary content, so a hover card with a name, a
role and a presence dot is a slot away. `tooltip-interactive` keeps the bubble
open while the pointer is inside it, so links and buttons in there are
reachable.

Accessibility detail worth knowing: `aria-describedby` is wired **only** when
the tooltip says something the accessible label does not. A tooltip that merely
repeats the name would otherwise be announced twice.

`computePosition`, `useFloating` and `useTooltip` are exported if you want to
build your own floating elements on the same engine.

[Full tooltip documentation →](/components/tooltip)

## Status and badges

Status was one prop and four hardcoded CSS keywords. Now:

- **Contrast-checked colour tokens** replace the keywords — `#22c55e`,
  `#f59e0b`, `#ef4444`, `#9ca3af`. The old keywords sat at wildly different
  luminances, which made the white ring read inconsistently.
- **`status-colors`** takes a map, app-wide or per-avatar, so `status="in-meeting"`
  is a normal thing to write.
- **`status-size`** (`sm`, `md`, `lg` or a number) and **`status-pulse`**, which
  is suppressed under `prefers-reduced-motion`.
- **The dot is inset to sit on the outline**, by an amount that depends on the
  shape — a hexagon's corner is nowhere near a circle's.

Badges are new:

```vue
<Avatar name="Ada Lovelace" :badge="1200" badge-color="#7c3aed" />
<!-- renders 999+ -->
```

`badge`, `badge-variant` (`count`, `dot`, `icon`), `badge-max`,
`badge-max-length`, `badge-position`, `badge-color`, `badge-text-color` and a
`#badge` slot. Text colour is derived from the background when you only set
one. The badge is `aria-hidden` with its meaning folded into the avatar's
label, so it is announced once rather than twice.

## Images that survive a bad URL

```vue
<Avatar
  name="Ada Lovelace"
  image-src="https://cdn.example.com/ada.jpg"
  :fallback-src="['https://backup.example.com/ada.jpg', '/local/ada.jpg']"
  retina
/>
```

- **`fallback-src`** takes an ordered chain, tried one at a time. `@fallback`
  fires between attempts; `@error` now fires only once every source has failed.
- **`skeleton`** shows a shimmer while the image loads, clipped to the avatar's
  own shape. It renders only after mount, so a cached image causes no hydration
  mismatch.
- **`retina`** derives a `1x/2x` srcset from `image-src`.
- **`srcset`, `sizes`, `crossorigin`, `referrerpolicy` and `decoding`** pass
  straight through.

## Interaction and accessibility

- **`as`** renders a real `<button>` or `<a>` instead of a `div` with
  `role="button"` bolted on. Native elements bring their own keyboard handling,
  so v5 skips its manual handlers there rather than firing twice.
- **A focus ring.** v4 had none at all on `Avatar` — a genuine defect in a
  package that advertises accessibility. Style it with `--va-focus-ring`.
- **`disabled`** and **`selected`** (rendered as `aria-pressed`, so an avatar
  can be a toggle in a picker).
- **`editable`** adds a hover and focus overlay for changing the picture, with
  optional file-input wiring through `accept`. `@edit` and `@file-select`, plus
  an `#edit-overlay` slot for your own icon.
- **Every animation** respects `prefers-reduced-motion: reduce` — the image
  fade, the status pulse, the skeleton shimmer and the tooltip transition.

## TypeScript, end to end

The source is TypeScript: every util, composable, entry point and SFC. More
importantly, `dist/types` is now **emitted from the source** by `vue-tsc`
instead of being hand-written, so the published types can no longer drift from
the implementation. `src/types.ts` is the single source of truth for the
exported types.

Nothing changes for consumers importing from `"vue3-avatar"`. If you were
deep-importing `vue3-avatar/src/components/Avatar.vue`, those files now use
`lang="ts"` and need a TypeScript-aware build — import from the package entry.

## How it is tested

- **416 unit tests** in jsdom.
- **259 pixel comparisons** against 242 committed reference images, rendered in
  real Chromium and diffed with `pixelmatch`, plus exact-colour probes that hold
  the documented palettes in place. jsdom has no renderer, so it cannot tell you
  a status dot drifted off the edge of a hexagon.
- **Pairwise permutation coverage**: enumerable props are exhausted, and 20
  boolean flags are covered all-pairs in a couple of dozen mounts rather than
  the 1,048,576 the full product would need.
- **A bundle-size budget** enforced in CI, because a positioning engine is
  exactly the kind of thing that quietly doubles a package.

## Shape fixes worth mentioning

The `hexagon` shape was drawn as tall as it is wide, which stretched it. A
regular hexagon with points to the left and right is only `√3/2` as tall as it
is wide, and the clip path now uses those proportions — so it reads wider than
tall, and fills nearly the full width of the avatar box instead of being inset
on both axes.
