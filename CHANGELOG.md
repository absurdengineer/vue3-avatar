# Changelog

All notable changes to this project will be documented in this file.

## [4.1.0] - 2025-12-19

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
