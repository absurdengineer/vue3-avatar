# vue3-avatar

> A lightweight, customizable, and accessible avatar component for Vue 3 and Nuxt.

**📖 [Read the Documentation & Try the Interactive Playground](https://vue3-avatar.vercel.app/)**

[![npm version](https://img.shields.io/npm/v/vue3-avatar.svg?style=flat-square)](https://www.npmjs.com/package/vue3-avatar)
[![Downloads](https://img.shields.io/npm/dt/vue3-avatar.svg?style=flat-square)](https://www.npmjs.com/package/vue3-avatar)
[![License](https://img.shields.io/npm/l/vue3-avatar.svg?style=flat-square)](https://github.com/absurdengineer/vue3-avatar/blob/master/LICENSE)
[![Docs](https://img.shields.io/badge/docs-live-brightgreen?style=flat-square)](https://vue3-avatar.vercel.app/)

**Avatar Vue** is a feature-rich component for displaying user profiles, team members, or entity icons. It supports **initials-based avatars**, **custom images** with lazy loading, **deterministic pixel art (identicons)**, and **avatar groups** with overflow handling.

Whether you need a simple profile picture or a complex team display, **Avatar Vue** handles fallback logic, accessibility, and responsiveness out of the box.

## Why vue3-avatar?

Most UI libraries include an avatar, but only as a primitive — a circle, maybe an image.
`vue3-avatar` is the choice when you need more without adding a full design system:

| Feature                  | vue3-avatar         | Vuetify `v-avatar` | PrimeVue `Avatar` |
| ------------------------ | ------------------- | ------------------ | ----------------- |
| Initials (multi-word)    | ✅ Smart extraction | ✅                 | ✅                |
| Pixel art / identicons   | ✅ 8 themes         | ❌                 | ❌                |
| Avatar groups + overflow | ✅                  | ❌                 | ❌                |
| Auto-contrast text       | ✅                  | ❌                 | ❌                |
| Status badges            | ✅ 4 positions      | ❌                 | ✅                |
| SSR / Nuxt safe          | ✅                  | ✅                 | ✅                |
| Zero dependencies        | ✅                  | ❌ (full lib)      | ❌ (full lib)     |
| Custom image slot        | ✅ (NuxtImg ready)  | ❌                 | ❌                |

Works with Tailwind CSS, UnoCSS, Headless UI, or any setup that doesn't include a UI library. Drop it in and it handles the rest.

## Key Features

- ⚡ **Lightweight & Fast**: Optimized for Vue 3.
- 🎨 **Smart Initials**: Automatically extracts initials from names (e.g., "Tony Stark" → "TS").
- 🖼️ **Image Support**: Seamlessly handles image URLs with automatic fallback to initials or pixel art on error.
- 👾 **PixelGen**: Generates consistent, deterministic pixel art (identicons) like GitHub/Gravatar.
- 👥 **Avatar Groups**: Easily stack avatars for teams with `+N` overflow badges.
- 🌗 **Auto-Contrast**: Automatically adjusts text color (black/white) based on background luminance.
- ♿ **Accessible**: Built with a11y in mind (ARIA roles, keyboard support).
- 🟢 **Status Indicators**: Built-in support for online/offline/busy status badges.
- ☁️ **SSR & Nuxt Ready**: Safe for server-side rendering with no hydration mismatches.

## Examples

- **Tony** will become **T**
- **Tony Stark** will become **TS**
- **Tony Howard-Stark** will become **THS**
- **Albert Tony Howard Stark** will become **ATS**

## Previews

### Shapes & Base Styles

![Shapes and base styles](img/shapes_base.png)

### Status & Presence

![Status and presence](img/status_presence.png)

### PixelGen Themes

![PixelGen themes](img/pixelgen.png)

### Auto-Contrast & Images

![Auto-contrast and images](img/auto_contrast.png)

### Interactive Avatar Groups

![Avatar groups](img/avatar_groups.png)

## Installation

```bash
npm install vue3-avatar
```

## Usage

**Avatar Vue** is very easy to use.

### ES6

**For Local Registration**

```javascript
import { Avatar, AvatarGroup } from "vue3-avatar";

export default {
  // ...
  components: {
    Avatar,
    AvatarGroup, // Optional: if you want to use grouping
    // ...
  },
  // ...
};
```

**For Global Registration (with optional defaults)**

Update main.js

```javascript
import { createApp } from "vue";
import App from "./App.vue";
import Avatar from "vue3-avatar";

const app = createApp(App);

// Configure global defaults (Optional)
app.use(Avatar, {
  defaults: {
    size: 50,
    autoContrast: true,
    transition: true,
    loading: "lazy",
    shape: "circle",
  },
});
```

After importing the component, use it in your template:

```html
<Avatar name="John Doe" />
```

## Nuxt.js Support

**Avatar Vue** v5.0 is fully SSR-safe and optimized for Nuxt.js 3+.

### 1. Installation in Nuxt

Create a plugin file `plugins/avatar.ts`:

```typescript
import { defineNuxtPlugin } from "#app";
import Avatar from "vue3-avatar";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Avatar, {
    defaults: {
      size: 40,
      autoContrast: true,
    },
  });
});
```

### 2. Standard Scoped Slot for NuxtImg

Use the `#image` slot to integrate with custom image components like `<NuxtImg>` for better performance and automatic optimization.

```html
<template>
  <Avatar name="John Doe" image-src="/profile.jpg">
    <template #image="{ src, alt, size, style }">
      <NuxtImg
        :src="src"
        :alt="alt"
        :width="size"
        :height="size"
        :style="style"
        loading="lazy"
      />
    </template>
  </Avatar>
</template>
```

### 3. SSR-Safe Deterministic Colors

Colors and Pixel patterns are generated deterministically based on the `name` prop, ensuring no hydration mismatches between server-side rendering and client-side activation.

## Props

| Property                                  | Type               | Default          | Description                                                                     |
| ----------------------------------------- | ------------------ | ---------------- | ------------------------------------------------------------------------------- |
| `name`                                    | String             | required         | Name used for initials, generated colours, pixel art, and the accessible label. |
| `imageSrc`                                | String             | —                | Image URL. Use `image-src` in templates.                                        |
| `size`                                    | Number             | `40`             | Avatar diameter in pixels.                                                      |
| `inline`                                  | Boolean            | `false`          | Displays the avatar inline.                                                     |
| `shape`                                   | String             | derived          | `circle`, `square`, `squircle`, or `hexagon`. Overrides `rounded`.              |
| `rounded`                                 | Boolean            | `true`           | Uses a circle when true or a square when false, if `shape` is omitted.          |
| `variant`                                 | String             | `initials`       | `initials` or `pixel`.                                                          |
| `pixelTheme`                              | String             | `earth`          | `earth`, `neon`, `ocean`, `forest`, `sunset`, `midnight`, `candy`, or `retro`.  |
| `color` / `background`                    | String             | generated        | Override the foreground or background colour.                                   |
| `dark` / `gradient`                       | Boolean            | `false`          | Use the dark palette or a name-based gradient.                                  |
| `autoContrast`                            | Boolean            | `false`          | Choose black or white text for a hexadecimal background colour.                 |
| `border` / `borderColor`                  | Boolean / String   | `true` / `white` | Control the native image border; initials and pixel avatars keep their outline. |
| `status`                                  | String             | —                | `online`, `away`, `offline`, or `busy`.                                         |
| `statusPosition`                          | String             | `bottom-right`   | `top-right`, `top-left`, `bottom-right`, or `bottom-left`.                      |
| `alt`                                     | String             | derived          | Accessible label; defaults to `Avatar of {name}`.                               |
| `loading` / `transition`                  | String / Boolean   | `lazy` / `true`  | Native image loading and image fade-in behaviour.                               |
| `interactive`                             | Boolean            | `false`          | Enables keyboard activation and emits `activate`.                               |
| `pointer` / `onClick`                     | Boolean / Function | `false` / —      | Shows a pointer cursor; `onClick` also receives activation events.              |
| `customAvatarStyle` / `customStatusStyle` | Object             | `{}`             | Inline style overrides.                                                         |
| `sameBorder` / `useTextColorForBorder`    | Boolean            | `false`          | Status-border and avatar-border colour options.                                 |
| `useLegacyColors`                         | Boolean            | `false`          | Uses the legacy `vue-avatar` palette.                                           |

## Events

| Event      | Arguments | Description                                                                 |
| ---------- | --------- | --------------------------------------------------------------------------- |
| `error`    | `event`   | Emitted when `imageSrc` fails to load                                       |
| `load`     | `event`   | Emitted when `imageSrc` successfully loads                                  |
| `activate` | `event`   | Emitted when an interactive avatar is clicked or activated with Enter/Space |

## Slots

| Slot          | Description                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `image`       | **NEW (v4.1)** Scoped slot for custom image components (e.g. `<NuxtImg>`). Provides `{ src, alt, size, style, class }`. |
| `placeholder` | **NEW (v4.1)** Scoped slot for custom placeholder when no name/image is present. Provides `{ size, style }`.            |
| `status`      | Custom status indicator content. Overrides default status rendering but keeps positioning.                              |
| `overlay`     | Custom overlay content (badges, icons). Positioned relative to container.                                               |

## CSS Variables

The component exposes CSS variables on the root element for easier theming:

```css
--va-size
--va-bg
--va-color
--va-border-color
--va-radius
--va-clip-path
--va-font-size
```

## AvatarGroup (New in v4)

You can group multiple avatars together with `AvatarGroup`.

```html
<AvatarGroup :max="3">
  <Avatar name="Tony Stark" />
  <Avatar name="Bruce Banner" />
  <Avatar name="Steve Rogers" />
  <Avatar name="Natasha Romanoff" />
</AvatarGroup>
```

**Props:**

- `max`: (Number) Maximum number of avatars to show. Overflow is shown as `+N`.
- `overlap`: (Number) Overlap size in pixels (default 10).
- `borderColor`: (String) Border color for separators (default 'white').
- `size`: (Number) Size for the overflow badge (default 40).
- `layout`: (String) Layout of the avatars.
  - `stack` (default): Horizontal overlapping stack.
  - `triangle`: Pyramid shape where the first avatar is on top, and subsequent avatars form the base. _Note: Triangle layout is limited to 3 items (2 visible + 1 overflow badge if needed)._
- `onClick`: (Function) Click callback for the entire group.
- `pointer`: (Boolean) If true, applies `pointer` cursor to the group.

**Events:**

| Event             | Arguments                     | Description                                                                                                  |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `@overflow-click` | `(hidden: Array, all: Array)` | **NEW (v4.1)** Emitted when user clicks the `+N` badge. Provides list of hidden users AND list of all users. |

**Tooltips:**

- Hovering the group background shows **all** member names.
- Hovering the overflow badge (`+N`) shows only the **hidden** member names.
- Individual avatars show their own name on hover.

You can also pass props to individual `Avatar` components within the group. For example, you can set the `status` of each avatar.

```html
<AvatarGroup :max="3">
  <Avatar name="Tony Stark" status="online" />
  <Avatar name="Bruce Banner" status="away" />
  <Avatar name="Steve Rogers" status="offline" />
  <Avatar name="Natasha Romanoff" />
</AvatarGroup>
```

## Accessibility

v4.0.0 focuses heavily on accessibility:

- **Roles:** Renders as `role="img"` by default, or `role="button"` if `interactive` is true.
- **Labels:** Automatically generates aria-labels from `alt` or `name` props.
- **Keyboard:** When `interactive` is true, supports `Tab` navigation and `Enter`/`Space` activation.
- **Status:** Status text is included in the accessible label (e.g., "Avatar of John Doe. User is online").

## Color Systems

**Avatar Vue** supports two color systems:

### Default Colors (Modern)

By default, the component uses a modern color palette with light colors for text and dark colors for backgrounds. This provides better contrast and readability.

```html
<avatar name="John Doe" />
```

### Legacy Colors (vue-avatar compatible)

**@deprecated** For backwards compatibility with the original vue-avatar component, you can enable the legacy color palette by setting `useLegacyColors` to `true`. This uses the original 18-color palette from vue-avatar.

```html
<avatar name="John Doe" :use-legacy-colors="true" />
```

## Migration Guide (v4.0 -> v4.1)

v4.1 is fully backward compatible. Summary of new features:

1.  **PixelGen:** Choose `variant="pixel"` for deterministic pixel art. Themes: `earth`, `neon`, `ocean`, `forest`, `sunset`, `midnight`, `candy`, `retro`.
2.  **Auto-Contrast:** Set `:auto-contrast="true"` to automatically pick black/white text based on background.
3.  **Global Config:** Pass `defaults` object to `app.use(Avatar, { defaults: { ... } })`.
4.  **Framework Ready:** Use the `#image` slot for `NuxtImg` or other custom image loading scenarios.
5.  **Interactive Groups:** Hear when the overflow badge is clicked with `@overflow-click`.

## Migration Guide (v3 -> v4)

v4 is mostly backward compatible. Key changes:

1.  **Deprecated:** `useLegacyColors` triggers a console warning.
2.  **Removed:** `inverted` prop is removed. The default theme is now light. Use the `dark` prop to enable the dark theme.
3.  **Accessibility:** The DOM structure has `role` attributes and improved labels. Ensure your tests don't rely on specific internal DOM structure if not needed.
4.  **Strict Initials:** The initials algorithm is now frozen and formalized.

## Developer Notes

This package is built with the **node v16.20.2 (npm v8.19.4)**

## Creator

[Mohammad Dilshad Alam](https://github.com/absurdengineer) created and maintains this component.
