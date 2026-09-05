---
title: Avatar Component
description: Full props, events, slots, and CSS variable reference for the vue3-avatar Avatar component.
---

# Avatar Component

`<Avatar />` renders an accessible initials, image, or deterministic pixel-art avatar. Images fall back to the selected avatar variant if they fail to load.

## Common usage

```vue
<Avatar
  name="Tony Stark"
  image-src="/tony.jpg"
  status="online"
  :size="64"
  :auto-contrast="true"
/>
```

## Props reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `String` | required | Name used for initials, generated colours, pixel art, and the accessible label. |
| `imageSrc` | `String` | — | Image URL. In templates use `image-src`. |
| `variant` | `'initials' \| 'pixel'` | `'initials'` | Selects initials or deterministic pixel art. |
| `pixelTheme` | `String` | `'earth'` | Pixel theme: `earth`, `neon`, `ocean`, `forest`, `sunset`, `midnight`, `candy`, or `retro`. |
| `size` | `Number` | `40` | Avatar diameter in pixels. |
| `inline` | `Boolean` | `false` | Displays the avatar inline. |
| `shape` | `'circle' \| 'square' \| 'squircle' \| 'hexagon'` | derived | Explicit shape. Overrides `rounded` when set. |
| `rounded` | `Boolean` | `true` | Legacy circle/square switch when `shape` is not supplied. |
| `color` / `background` | `String` | generated | Override the foreground or background colour. |
| `dark` | `Boolean` | `false` | Uses the dark generated palette. |
| `gradient` | `Boolean` | `false` | Uses a name-based background gradient. |
| `autoContrast` | `Boolean` | `false` | Uses black or white text for a hexadecimal background colour. |
| `border` / `borderColor` | `Boolean` / `String` | `true` / `'white'` | Controls the native image border; initials and pixel avatars keep their outline. |
| `alt` | `String` | derived | Accessible label. Defaults to `Avatar of {name}`. |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Native image loading behaviour. |
| `transition` | `Boolean` | `true` | Enables the image fade-in transition. |
| `interactive` | `Boolean` | `false` | Makes the avatar keyboard-activatable and emits `activate`. |
| `pointer` | `Boolean` | `false` | Uses a pointer cursor without making the avatar interactive. |
| `onClick` | `Function` | — | Click callback; also makes the avatar keyboard-activatable. |
| `customAvatarStyle` / `customStatusStyle` | `Object` | `{}` | Inline style overrides for the avatar or status indicator. |
| `useLegacyColors` | `Boolean` | `false` | Uses the legacy `vue-avatar` colour palette. |
| `useTextColorForBorder` | `Boolean` | `false` | Uses the calculated text colour as the border colour. |

### Images

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fallbackSrc` | `String \| String[]` | — | Sources tried in order when `imageSrc` fails, before falling back to initials or pixel art. |
| `skeleton` | `Boolean` | `true` | Shows a shimmer placeholder while the image loads. Rendered only after mount, so server output and the first client render agree. |
| `retina` | `Boolean` | `false` | Derives an `@2x` `srcset` from `imageSrc` when no explicit `srcset` is set. |
| `srcset` / `sizes` | `String` | — | Passed straight through to the `<img>`. An explicit `srcset` wins over `retina`. |
| `crossorigin` | `'anonymous' \| 'use-credentials'` | — | Passed through to the `<img>`. |
| `referrerpolicy` | `String` | — | Passed through to the `<img>`. |
| `decoding` | `'async' \| 'sync' \| 'auto'` | `'async'` | Passed through to the `<img>`. |

Changing `imageSrc` resets the whole chain, so an avatar that failed once retries
as soon as it is given a new source.

```vue
<Avatar
  name="Tony Stark"
  image-src="https://cdn.example.com/tony.jpg"
  :fallback-src="['https://backup.example.com/tony.jpg', '/default.png']"
  retina
  @fallback="({ failedSrc, remaining }) => console.warn(failedSrc, remaining)"
/>
```

### Status

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `status` | `String` | — | `online`, `away`, `offline`, `busy`, or any key present in `statusColors`. |
| `statusPosition` | `String` | `'bottom-right'` | `top-right`, `top-left`, `bottom-right`, or `bottom-left`. |
| `statusColor` | `String` | — | Overrides the colour for this avatar, whatever the status is. |
| `statusColors` | `Object` | `{}` | Extra or replacement colours, merged over the built-in four. Also accepted in the global config. |
| `statusSize` | `'sm' \| 'md' \| 'lg' \| Number` | `'md'` | Dot size, as a fraction of the avatar (`sm` = 1/5, `md` = 1/4, `lg` = 1/3) or explicit pixels. |
| `statusLabel` | `String` | — | Replaces "User is {status}" in the accessible label. |
| `statusPulse` | `Boolean` | `false` | Animates a pulsing ring. Suppressed under `prefers-reduced-motion`. |
| `sameBorder` | `Boolean` | `false` | Makes the status indicator use the avatar border colour. |

The indicator is inset to sit on the avatar's outline rather than in the empty
corner of its bounding box, by an amount that depends on `shape` — squares get
no inset, hexagons the most.

```vue
<Avatar
  name="Tony Stark"
  status="in-meeting"
  status-label="In a meeting until 4pm"
  :status-colors="{ 'in-meeting': '#7c3aed' }"
  status-size="lg"
  status-pulse
/>
```

### Badge

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `badge` | `String \| Number` | — | Badge content. Renders the badge when set. |
| `badgeVariant` | `'count' \| 'dot' \| 'icon'` | `'count'` | `dot` renders an empty marker and needs no `badge` value. |
| `badgeMax` | `Number` | `999` | Counts above this render as `{max}+`. Digit strings are clamped the same way as numbers. |
| `badgeMaxLength` | `Number` | `3` | Letters kept in a non-numeric badge. `"Promotional"` renders as `"Pro"`. |
| `badgePosition` | `String` | `'top-right'` | Same four corners as `statusPosition`. A development warning fires if the two collide. |
| `badgeColor` / `badgeTextColor` | `String` | `'#ef4444'` / derived | Background and text colour. Given only a hexadecimal background, the text colour is chosen for contrast. |
| `badgeLabel` | `String` | derived | Wording for the badge in the accessible label. |
| `customBadgeStyle` | `Object` | `{}` | Inline style overrides for the badge. |

The badge is `aria-hidden`; its meaning is folded into the avatar's
`aria-label` so screen readers announce it once rather than twice.

Badge content is capped so a corner marker stays a corner marker: counts above
`badgeMax` become `999+`, and other content is trimmed to `badgeMaxLength`
letters — the same three-character budget the initials use. A label badge is
anchored to a corner and grows towards the middle, so without a cap a long
string runs across the face and out the far side.

```vue
<Avatar name="Tony Stark" :badge="1200" />          <!-- 999+ -->
<Avatar name="Tony Stark" badge="Promotional" />    <!-- Pro  -->
```

The badge sits further out from the corner than the status dot, and is allowed
to overhang the avatar's edge: a round dot reads best tucked onto the outline,
whereas a wide pill pulled in by the same amount drifts towards the middle of
the face.

The badge is also capped at the avatar's own width, with a CSS ellipsis as a
backstop for wide glyphs. To allow a longer or wider badge:

```vue
<Avatar
  name="Tony Stark"
  badge="Promotional"
  :badge-max-length="6"
  :custom-badge-style="{ maxWidth: '180px' }"
/>
```

### Tooltip

See the [Tooltip](/components/tooltip) page for the full reference.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tooltip` | `String \| Boolean \| Object` | — | Tooltip content. Unset uses `name`; `false` disables it; an object supplies inline overrides. |
| `nativeTitle` | `Boolean` | `false` | Restores the v4 `title` attribute instead of the styled tooltip. |

### Interaction

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `'div' \| 'button' \| 'a'` | `'div'` | Root element. `button` and `a` bring real semantics and native keyboard handling. |
| `href` / `target` / `rel` | `String` | — | Used when `as="a"`. `target="_blank"` adds `rel="noopener noreferrer"` unless `rel` is set. |
| `disabled` | `Boolean` | `false` | Blocks activation, dims the avatar, and sets `aria-disabled` (or the native `disabled` attribute on a button). |
| `selected` | `Boolean` | — | Opt-in toggle state, rendered as `aria-pressed`. Leave unset for avatars that are not toggles. |
| `editable` | `Boolean` | `false` | Adds an overlay for changing the picture. Emits `edit`. On a `div` root the overlay is its own button; with `as="button"` or `as="a"` it is decoration and the root's own activation emits `edit`, because a button cannot be nested inside a button or a link. |
| `accept` | `String` | — | With `editable`, wires a hidden file input and emits `file-select`. |
| `editLabel` | `String` | `'Change picture'` | Accessible label for the edit overlay. |

```vue
<Avatar
  name="Tony Stark"
  as="a"
  href="/users/tony"
  target="_blank"
  image-src="/tony.jpg"
/>

<Avatar
  name="Tony Stark"
  editable
  accept="image/*"
  @file-select="({ files }) => upload(files[0])"
/>
```

## Events

| Event | Payload | When it fires |
| --- | --- | --- |
| `@error` | `Event` | The image fails to load. |
| `@load` | `Event` | The image loads. |
| `@activate` | `Event` | An interactive avatar is clicked or activated with Enter/Space. |
| `@fallback` | `{ failedSrc, nextSrc, remaining, event }` | An image fails and another source remains to try. `@error` fires only once the chain is exhausted. |
| `@edit` | `MouseEvent` | The edit overlay is activated. |
| `@file-select` | `{ files, event }` | A file is chosen through the `accept` file input. |

## Slots

| Slot | Scope | Description |
| --- | --- | --- |
| `image` | `{ src, srcset, sizes, alt, size, style, class }` | Replace the native image, for example with `NuxtImg`. `src` is the current link in the fallback chain. |
| `placeholder` | `{ size, style }` | Render a placeholder when neither `name` nor `image-src` is present. |
| `status` | — | Replace the visual content of the status indicator. |
| `badge` | — | Replace the visual content of the badge. |
| `overlay` | — | Add content positioned within the avatar container. |
| `tooltip` | `{ nameValue, initials, status, imageSrc }` | Replace the tooltip body with a rich hover card. |
| `edit-overlay` | — | Replace the camera icon on the edit overlay. |

## Nuxt image slot

```vue
<Avatar name="Tony Stark" image-src="/tony.jpg">
  <template #image="{ src, srcset, sizes, alt, size, style }">
    <NuxtImg
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="alt"
      :width="size"
      :height="size"
      :style="style"
    />
  </template>
</Avatar>
```

## CSS variables

The root element exposes the avatar's resolved values so surrounding styles can
follow along: `--va-size`, `--va-bg`, `--va-color`, `--va-border-color`,
`--va-radius`, `--va-clip-path`, `--va-font-size`, `--va-status-color`,
`--va-status-size`, `--va-badge-bg`, and `--va-badge-color`.

These are read by the component and can be set by you:
`--va-focus-ring` (focus outline colour), `--va-ring-color` (selected ring),
`--va-skeleton-bg`, `--va-skeleton-shimmer`, `--va-edit-overlay-bg`, and
`--va-edit-overlay-color`.
