# Migration to Composition API

This document tracks the migration of `src/components/Avatar.vue` from the Options API to the Composition API.

## Tasks

- [x] **Refactor `Avatar.vue`**: Convert from Options API to `<script setup>`.
  - [x] Define Props using `defineProps`.
  - [x] Define Emits using `defineEmits`.
  - [x] specific logic extraction (computed, methods).
- [x] **Verify**: Run tests to ensure no regressions.
