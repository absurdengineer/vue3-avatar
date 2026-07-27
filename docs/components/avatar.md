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
| `status` | `'online' \| 'away' \| 'offline' \| 'busy'` | — | Displays a presence indicator. |
| `statusPosition` | `String` | `'bottom-right'` | `top-right`, `top-left`, `bottom-right`, or `bottom-left`. |
| `sameBorder` | `Boolean` | `false` | Makes the status indicator use the avatar border colour. |
| `alt` | `String` | derived | Accessible label. Defaults to `Avatar of {name}`. |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Native image loading behaviour. |
| `transition` | `Boolean` | `true` | Enables the image fade-in transition. |
| `interactive` | `Boolean` | `false` | Makes the avatar keyboard-activatable and emits `activate`. |
| `pointer` | `Boolean` | `false` | Uses a pointer cursor without making the avatar interactive. |
| `onClick` | `Function` | — | Click callback; also makes the avatar keyboard-activatable. |
| `customAvatarStyle` / `customStatusStyle` | `Object` | `{}` | Inline style overrides for the avatar or status indicator. |
| `useLegacyColors` | `Boolean` | `false` | Uses the legacy `vue-avatar` colour palette. |
| `useTextColorForBorder` | `Boolean` | `false` | Uses the calculated text colour as the border colour. |

## Events

| Event | Payload | When it fires |
| --- | --- | --- |
| `@error` | `Event` | The image fails to load. |
| `@load` | `Event` | The image loads. |
| `@activate` | `Event` | An interactive avatar is clicked or activated with Enter/Space. |

## Slots

| Slot | Scope | Description |
| --- | --- | --- |
| `image` | `{ src, alt, size, style, class }` | Replace the native image, for example with `NuxtImg`. |
| `placeholder` | `{ size, style }` | Render a placeholder when neither `name` nor `image-src` is present. |
| `status` | — | Replace the visual content of the status indicator. |
| `overlay` | — | Add content positioned within the avatar container. |

## Nuxt image slot

```vue
<Avatar name="Tony Stark" image-src="/tony.jpg">
  <template #image="{ src, alt, size, style }">
    <NuxtImg :src="src" :alt="alt" :width="size" :height="size" :style="style" />
  </template>
</Avatar>
```
