# vue3-avatar

A user avatar component for vue3. By default it uses light colors for Background and dark colors for Text.

This component is highly inspired from [vue-avatar](https://github.com/eliep/vue-avatar).

This component computes the Initials from provided name with following rules:

1. Splits the name by spaces and hyphens.
2. Finds the first letter of each parts.
3. Maximum length of Avatar letters is 3.
4. If the name is splitted into more than 2 parts then picks the first letter of part1, part2 and last part.

This component can now also show an image by setting the `imageSrc` prop. If an error occurs in fetching the image from the provided source, the component falls back to Initials.

## Examples

- **Tony** will become **T**
- **Tony Stark** will become **TS**
- **Tony Howard-Stark** will become **THS**
- **Albert Tony Howard Stark** will become **ATS**

## Previews

### Single Avatars

![single avatar preview](/img/preview_single.png)

### Avatar Group

![avatar group preview](/img/preview_group.png)

## Installation

`npm install vue3-avatar`

## Usage

vue3-avatar is very easy to use.

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

**For Global Registration**

Update main.js

```javascript
import { createApp } from "vue";
import App from "./App.vue";
// ...
import Avatar from "vue3-avatar";

createApp(App).use(Avatar);
// or
// createApp(App).component("avatar", Avatar)
// ...
```

After importing the component, you can use it in your templates as:

```html
<avatar name="John Doe"></avatar>
```

## Props

| Property              | Required | Type     | Default | Description                                                                       |
| --------------------- | -------- | -------- | ------- | --------------------------------------------------------------------------------- |
| name                  | true     | String   | -       | Name to compute Avatar letters                                                    |
| color                 | false    | String   | white   | Text color for Avatar letters                                                     |
| background            | false    | String   | navy    | Background color for Avatar                                                       |
| size                  | false    | Number   | 40      | Pixel size for Avatar (Same Height and Width)                                     |
| dark                  | false    | Boolean  | false   | Use dark background with light text                                               |
| inline                | false    | Boolean  | false   | To create inline Avatar                                                           |
| rounded               | false    | Boolean  | true    | Square or Rounded                                                                 |
| imageSrc              | false    | String   | null    | To show an Image                                                                  |
| alt                   | false    | String   | derived | **NEW** Alt text for accessibility                                                |
| border                | false    | Boolean  | true    | Show or Hide the border                                                           |
| borderColor           | false    | String   | white   | Border color for avatar                                                           |
| status                | false    | String   | null    | To set user status as "online", "away", "offline", or "busy"                      |
| sameBorder            | false    | Boolean  | false   | To have same border in Avatar as well as Status Indicator                         |
| interactive           | false    | Boolean  | false   | **NEW** Enables keyboard interaction and role="button"                            |
| customAvatarStyle     | false    | Object   | {}      | A custom style object to personalize the avatar apperance                         |
| customStatusStyle     | false    | Object   | {}      | A custom style object to personalize the status indicator                         |
| useLegacyColors       | false    | Boolean  | false   | **@deprecated** Use original vue-avatar color palette for backwards compatibility |
| useTextColorForBorder | false    | Boolean  | false   | Use the text color for the border                                                 |
| gradient              | false    | Boolean  | false   | **NEW** Use name-based linear gradients for background                            |
| shape                 | false    | String   | circle  | **NEW** Avatar shape: `circle`, `square`, `squircle`, `hexagon`                   |
| pointer               | false    | Boolean  | false   | **NEW** If true, applies `cursor: pointer` even without callback                  |
| onClick               | false    | Function | null    | **NEW** Native click callback. Also enables `pointer` cursor.                     |

## Events

| Event | Arguments | Description |
|Data |---|---|
| `error` | `event` | Emitted when `imageSrc` fails to load |
| `activate` | `event` | Emitted when `interactive` is true and user clicks or presses Enter/Space |

## Slots

| Slot      | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| `status`  | Custom status indicator content. Overrides default status rendering but keeps positioning. |
| `overlay` | Custom overlay content (badges, icons). Positioned relative to container.                  |

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

vue3-avatar supports two color systems:

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
