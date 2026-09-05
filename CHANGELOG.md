# Changelog

All notable changes to this project will be documented in this file.

## [5.0.0] - 2026-09-05

### Breaking

- **The native `title` attribute is gone.** Avatars no longer render `title="{name}"`, and `AvatarGroup` no longer renders `title` on the group root or the `+N` badge. A styled, collision-aware tooltip replaces it. Set `native-title` to restore the old attribute (which also disables the styled tooltip), or `:tooltip="false"` for neither. The group root no longer has a tooltip listing every name at all — each child avatar already has its own, so the container version was a duplicate.
- **Status colours changed** from CSS keywords to hexadecimal tokens: `green` → `#22c55e`, `orange` → `#f59e0b`, `red` → `#ef4444`, `grey` → `#9ca3af`. An unknown `status` now falls back to the offline grey rather than the busy red. The keywords sit at wildly different luminances, which made the white ring around the indicator read inconsistently.
- **The status indicator is inset from the corner** by an amount that depends on `shape`, so it sits on the avatar's outline rather than in the empty corner of its bounding box. Squares are unchanged; a 40px circle moves in by 3px. Use `custom-status-style` to pin the old offsets.

See [the migration guide](https://vue3-avatar.absurdengineer.com/migration/v4-to-v5) for the full details.

### Added

- **Tooltips.** A dependency-free positioning engine with twelve placements, flip and shift collision handling, and an arrow that keeps pointing at the avatar after a shift. Renders through a `<Teleport>` so it escapes `overflow: hidden` ancestors. Props: `tooltip`, `tooltipPlacement`, `tooltipTrigger`, `tooltipDelay`, `tooltipHideDelay`, `tooltipOffset`, `tooltipArrow`, `tooltipTheme`, `tooltipInteractive`, `tooltipDisabled`, `nativeTitle`. New `tooltip` slot for rich hover cards, and an `overflow-tooltip` slot on `AvatarGroup`.
- Hover, keyboard-focus, click and long-press triggers, with open/close delays and `Escape` to close. `aria-describedby` is wired only when the tooltip says something the accessible label does not, so nothing is announced twice.
- **Status:** `statusColor`, `statusColors` (also accepted in the global config), `statusSize`, `statusLabel`, and `statusPulse`. `status` accepts custom names resolved through `statusColors`.
- **Badges:** `badge`, `badgeVariant`, `badgeMax` (default `999`), `badgeMaxLength`, `badgePosition`, `badgeColor`, `badgeTextColor`, `badgeLabel`, `customBadgeStyle`, and a `badge` slot. The badge is `aria-hidden` with its meaning folded into the avatar's label.
- **Images:** `fallbackSrc` accepts an ordered chain of sources tried before giving up; a loading `skeleton`; `retina` for a derived `@2x` srcset; and `srcset`, `sizes`, `crossorigin`, `referrerpolicy` and `decoding` passthrough. New `@fallback` event fires between attempts — `@error` now fires only once every source has failed.
- **Interaction:** `as` (`div`, `button`, `a`), `href`, `target`, `rel`, `disabled`, `selected` (rendered as `aria-pressed`), and an `editable` overlay with optional file-input wiring via `accept`. New `@edit` and `@file-select` events and an `edit-overlay` slot.
- `computePosition`, `useFloating`, `useTooltip`, `AvatarTooltip` and `PLACEMENTS` are exported for building your own floating elements.
- New CSS variables: `--va-status-color`, `--va-status-size`, `--va-badge-bg`, `--va-badge-color`, plus the settable `--va-focus-ring`, `--va-ring-color`, `--va-skeleton-bg`, `--va-skeleton-shimmer`, `--va-edit-overlay-bg` and `--va-edit-overlay-color`.
- CI now type-checks the hand-written declarations against a fixture that instantiates every prop, and enforces a gzipped bundle-size budget.
- A separate `Visual` workflow runs the pixel suite on every pull request and uploads golden/actual/diff artifacts when it fails. On a platform with no committed reference images it records the set and says so, rather than failing every case over something one line explains.

### Fixed

- Changing `imageSrc` after a load failure left the avatar permanently on initials. The image state now resets when the source changes.
- The tooltip's `data-placement` attribute reported the *requested* placement rather than the resolved one, so it lied whenever the tooltip flipped away from a viewport edge — and any CSS keyed on it was wrong. Caught by the new visual suite.
- A badge holding a long label ("Promotional") grew to 166% of the avatar's width and ran off the far side, straight across the initials — it is corner-anchored and grows inwards, and nothing capped it. Badge content is now capped: non-numeric content is trimmed to `badgeMaxLength` (default 3) letters, the badge box is capped at the avatar's own width, and a CSS ellipsis backstops wide glyphs. Override with `badgeMaxLength` or `customBadgeStyle: { maxWidth }`.
- Badge type is smaller and the badge flatter (`size / 5.5` and `size / 3.6`), which reads better as a corner marker.
- Badges now use their own corner inset, roughly half the status dot's, so they sit further out and are allowed to overhang the avatar's edge. A round dot reads best tucked onto the outline; a wide pill pulled in by the same amount drifts towards the middle of the face.
- The `hexagon` shape was drawn as tall as it was wide, which stretched it: a regular hexagon with points to the left and right is only `sqrt(3)/2` as tall as it is wide. The clip path now uses those proportions, so the shape reads wider than it is tall and spans nearly the full width of the avatar box instead of being inset on both axes.
- `AvatarGroup` with `layout="triangle"` and `max={1}` rendered every child instead of collapsing them: the overflow guard used a truthiness check, and the triangle layout can legitimately compute an effective maximum of `0`.
- A `tooltip-trigger` containing `click` silently disabled the avatar's own `onClick` and `@activate`: the tooltip's listener was spread over the root last and replaced them. Colliding handlers are now composed rather than overwritten, so a click both activates the avatar and toggles the tooltip.
- Tooltips were positioned against the nearest `overflow: hidden` ancestor, which re-imposed the very constraint the `<Teleport>` exists to escape — inside a narrow clipped container the bubble was pinned to that container's edge, tens of pixels off the avatar, while the viewport had room to spare. Only real scroll boxes (`auto`, `scroll`, `overlay`) are boundaries now, and the boundary is intersected with the viewport so a scroll box taller than the screen cannot push a tooltip below the fold.
- An `editable` avatar rendered its edit button inside `role="img"`, whose children are presentational — the only control for changing the picture was invisible to screen readers. Such an avatar now uses `role="group"`.
- `as="button"` or `as="a"` combined with `editable` emitted a `<button>` nested inside a button or a link, which browsers reparent. The overlay is decoration on those roots and the root's own activation emits `edit`.
- The hidden file input behind `accept` was a keyboard tab stop; it is now `tabindex="-1"` and `aria-hidden`.
- Choosing the same file twice emitted `file-select` only once, because the input's value was never cleared — re-picking after a cancelled crop did nothing.
- `AvatarGroup`'s focusable root had no focus ring, the same defect fixed on `Avatar`; and its key handling never received `Avatar`'s case and `keyCode` normalisation, so the environments that broke one would have broken the other.
- Development warnings never reached anyone: `process.env.NODE_ENV` was replaced with `"production"` in every build, so guarded warnings were dead-stripped from the published bundles. Only the IIFE build — loaded from a CDN with no bundler behind it — bakes the value in now.
- The avatar had no focus ring at all — only `AvatarGroup`'s overflow button did. Interactive avatars now show one, styleable through `--va-focus-ring`.

### Changed

- Animations respect `prefers-reduced-motion: reduce`, including the image fade, the status pulse, the skeleton shimmer and the tooltip transition.
- The shared global-config resolver moved to `src/utils/config.ts` as `createConfigResolver`; it was previously duplicated in both components.
- **The source is now TypeScript.** Every util, composable, entry point and SFC (`<script setup lang="ts">`) is typed, and `dist/types` is now *emitted from source* by `vue-tsc` rather than hand-written — the public API can no longer drift from the implementation. `src/types.ts` is the single source of truth for the exported types.
- Package `types` now resolves to `./dist/types/entry.esm.d.ts` (was `./dist/types/index.d.ts`), and the Nuxt subpath to `./dist/types/nuxt-module.d.ts`. Consumers importing from `"vue3-avatar"` are unaffected.
- Note for anyone deep-importing `vue3-avatar/src/components/*.vue`: those files now use `lang="ts"` and require a TypeScript-aware build. Import from the package entry instead.

### Testing

- **Visual regression suite** (`npm run test:visual`): 259 assertions covering 242 committed reference images, rendered in real Chromium and compared pixel by pixel with `pixelmatch`, plus exact-colour probes for the documented status, badge and tooltip palettes. Covers shape x variant, status x corner x shape, badge variant x corner, all 8 pixel themes, all 12 tooltip placements, group layouts, and interaction states. Goldens are stored per platform; failures write the golden, the actual render and a highlighted diff.
- **Permutation suite** (`tests/permutations.spec.ts`): enumerable props are exhausted, and 20 boolean flags are covered pairwise — all-pairs coverage in a couple of dozen mounts rather than the 1,048,576 the full product would need.
- **Regression suite** (`tests/regressions.spec.ts`) and a `useFloating` unit spec: one test per defect found in the pre-release review, each written against a case that was reproduced by hand first.
- 416 unit tests in jsdom alongside the 259 pixel comparisons.
- VS Code launch configurations for every task, including running and re-recording the visual suite.

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
