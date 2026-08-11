# Changelog

All notable changes to this project will be documented in this file.

## [4.2.1] - 2026-08-11

### Fixed

- `border: false` on initials/pixel-art avatars no longer removes their outline — per the documented behavior, the `border` prop only controls the native `<img>` border; initials and pixel avatars always keep theirs. Previously `avatarStyle` incorrectly applied the same conditional as the image, contradicting the README's props table.
- Image border removal (`border: false`) now sets `border: 0px` instead of `none`, avoiding a shorthand-serialization inconsistency and matching the component's own test suite.

## [4.2.0] - 2026-08-10

### Added

- **Official Nuxt module** (`vue3-avatar/nuxt`): register `vue3-avatar` in a Nuxt `modules` array to get `Avatar` and `AvatarGroup` auto-imported, with global `defaults` configurable via the `vue3Avatar` config key. No more manual plugin registration required for Nuxt projects.
- **First-class TypeScript declarations**: shipped `.d.ts` files for the core package and the Nuxt module, exposed through a proper `exports` map (`"."` and `"./nuxt"` subpaths), plus `nuxt.config.ts` autocompletion for the `vue3Avatar` key.
- **CI**: GitHub Actions now builds and tests every push/PR (Node 18.x/20.x matrix), and tag-triggered releases build, test, publish to npm, and cut a GitHub Release automatically.
- Issue and pull request templates for a more structured contribution flow.

### Changed

- Removed the external Google Fonts (`Domine`) network request from `Avatar.vue` in favor of a bundled system-font stack — the component now makes zero external network calls, improving CSP compatibility, SSR reliability, and offline use.

## [4.1.2] - 2026-07-27

### Accessibility

- Made interactive avatar groups keyboard-accessible with Enter and Space.
- Changed the AvatarGroup overflow control to a labelled native button.

### Documentation

- Added a live VitePress documentation site and interactive playground.
- Corrected the API reference to match the component's public props, events, and slots.

## [4.1.1] - 2025-12-29

### Documentation & SEO

- **SEO Overhaul:**

  - Updated `package.json` description with rich keywords for better NPM/Google discoverability.
  - Added repository, homepage, and bugs links to `package.json`.
  - Added comprehensive "Key Features" section to `README.md`.
  - Added relevant keywords (SSR, Nuxt, a11y, pixel-art) to package metadata.

- **Community Standards:**
  - Added `CONTRIBUTING.md` guide.
  - Added `LICENSE` file (MIT).
  - Added status badges to README (Version, Downloads, License).

### Added

- **Enhanced Image Handling:**

  - Added `loading` prop (`'lazy'` | `'eager'`) for native lazy loading control (default: `'lazy'`).
  - Added `transition` prop (default: `true`) to enable/disable smooth fade-in transitions.
  - Added `@load` event emitted when image successfully loads.
  - Images now fade in smoothly with CSS transitions when loaded.

- **AvatarGroup Interactivity:**

  - Overflow badge (`+N`) is now clickable.
  - Added `@overflow-click` event that emits two arguments: `hiddenUsers` and `allUsers`.
  - Enables integration with modals/popovers to show hidden users.

- **Status Indicator Positioning:**

  - Added `statusPosition` prop supporting: `'top-right'`, `'top-left'`, `'bottom-right'`, `'bottom-left'`.
  - Default position changed to `'bottom-right'`.
  - Dynamic positioning based on avatar shape.

- **PixelGen - Pixel Art Avatars:**

  - Added `variant` prop (`'initials'` | `'pixel'`) for avatar type selection.
  - Added `pixelTheme` prop with 8 color themes: `earth`, `neon`, `ocean`, `forest`, `sunset`, `midnight`, `candy`, `retro`.
  - Deterministic 8x8 pixel grid generation from names.
  - Symmetric pixel patterns for aesthetic appeal.

- **Scoped Slots for Framework Integration:**

  - Added `#image` scoped slot for custom image components (e.g., `<NuxtImg>`).
  - Added `#placeholder` scoped slot for custom fallback when no image/name.
  - Perfect for Nuxt.js and other framework integrations.

- **Auto-Contrast Engine:**

  - Added `autoContrast` prop (default: `false`) for automatic text color selection.
  - Uses YIQ luminance calculation to choose black or white text.
  - Ensures optimal readability on any background color.

- **Global Configuration:**

  - Plugin installer now accepts `defaults` object for global prop configuration.
  - Uses Vue's `provide/inject` for configuration distribution.
  - Component-level props override global defaults.

- **SSR & Framework Support:**
  - Verified deterministic color generation for SSR safety.
  - No hydration mismatches between server and client.
  - Full Nuxt.js compatibility with scoped slots.

### Changed

- Status indicator positioning is now fully dynamic and customizable.
- Image loading behavior is now explicitly controlled via `loading` prop.

### Documentation

- Added comprehensive `MIGRATION_v4.1.md` guide.
- Documented all new props, events, and usage patterns.
- Added Nuxt.js integration examples.

## [4.0.1] - 2025-12-18

### Fixed

- Fixed broken Markdown table syntax in the README "Events" section.

## [4.0.0] - 2025-12-18

### Added

- **Accessibility:**
  - Added `interactive` prop to enable `role="button"` and keyboard navigation (Enter/Space).
  - Added `alt` prop for explicit image descriptions.
  - Improved default ARIA labels (e.g., "Avatar of [Name]", status inclusion).
- **Components:**
  - Added `AvatarGroup` component for displaying stacked or grouped avatars.
    - Supports `stack` layout (horizontal overlap).
    - Supports `triangle` layout (pyramid shape) with pyramid stacking order (Top > Bottom-Left > Bottom-Right).
- **Styling:**
  - Added CSS variables on the root element (`--va-size`, `--va-bg`, `--va-color`, etc.) for easier theming.
  - Added `status` and `overlay` slots for advanced customization.
- **Gradients:** Added `gradient` prop for deterministic name-based background gradients.
- **Shapes:** Added `shape` prop supporting `circle`, `square`, `squircle`, and `hexagon`.
- **Interactivity:**
  - Added `onClick` prop (callback function) to both `Avatar` and `AvatarGroup`.
  - Added `pointer` prop to force `cursor: pointer` visual feedback.
- **Tooltips:**
  - Individual avatars now use native `title` attribute for user identification.
  - `AvatarGroup` background now displays names of **all** members on hover.
  - `AvatarGroup` overflow badge (`+N`) displays names of only **hidden** users.
- **Performance:** Implemented `loading="lazy"` for all avatar images.
- **Utils:**
  - Added `getAvatarColors` and `getInitials` as internal utilities (logic formalized).

### Changed

- **Architecture:**
  - Refactored component structure: `Avatar.vue` moved to `src/components/`.
  - Initials generation logic is now strict and formalized (max 3 chars, split by space/hyphen).
- **Colors:**
  - Default color system is now "Modern" (Light text on Dark background) with WCAG AA contrast.
  - Legacy hash-based colors are deprecated but accessible via `useLegacyColors`.

### Deprecated

- `useLegacyColors` prop is deprecated and triggers a console warning. It will be removed in a future major version.

### Fixed

- Improved image error handling: strictly falls back to initials and emits `error` event.
- Ensured consistent behavior for empty/null names.
