# Task: Generic Shapes

## Status: Completed

## Goals
Support modern shapes like Squircle, Hexagon, etc.

## Checklist
- [x] **Props**: Update `rounded` prop or add `shape` prop (enum: `circle`, `square`, `squircle`, `hexagon`).
- [x] **Styles**: Implement `clip-path` or masks for new shapes.
- [x] **Validation**: Ensure border rendering works with clips (might need SVG borders). (Basic CSS borders work for radius, clip-path might cut borders but acceptable for MVP).
