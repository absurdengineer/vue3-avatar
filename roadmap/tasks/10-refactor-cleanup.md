# Task: Refactor & Cleanup

This task involves refining the API naming and cleaning up the codebase.

## Status: Completed

## Checklist
- [x] **Refactor `inverted` Prop**:
  - [x] Add `light` prop (Boolean, default `false`) to replace `inverted`.
  - [x] Mark `inverted` as deprecated in props definition.
  - [x] Update logic to use `light` primarily, with `inverted` as a fallback/alias.
  - [x] Update tests to verify `light` works and `inverted` still works (backward compatibility).
- [x] **Code Cleanup**:
  - [x] Remove unused imports in `src/components/Avatar.vue`.
  - [x] Verify no leftover debug code.
- [x] **Documentation**:
  - [x] Update README to show `light` instead of `inverted`, noting the deprecation.
