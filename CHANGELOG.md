# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0] - 2025-12-14

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
