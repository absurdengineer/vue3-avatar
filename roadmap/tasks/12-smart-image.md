# Task: Smart Image Loading

## Status: Completed

## Goals
Optimize performance for lists with many avatars.

## Checklist
- [x] **Props**: Add `lazy` (boolean) prop to `Avatar` (default `true`?). (Decided to just force lazy for now as per "implementation pass `loading='lazy'`").
- [x] **Implementation**: Pass `loading="lazy"` to the internal `<img>` tag.
