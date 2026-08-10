---
title: AvatarGroup Component
description: Props and events reference for AvatarGroup — stack avatars with overlap, max count, and a clickable +N overflow badge.
---

# AvatarGroup Component

`<AvatarGroup />` stacks child `<Avatar />` components and can collapse extra items into a clickable `+N` badge.

## Props reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `max` | `Number` | — | Maximum number of avatars displayed before the `+N` overflow badge. Omit to show all. |
| `overlap` | `Number` | `10` | Amount, in pixels, that stacked avatars overlap. |
| `borderColor` | `String` | `'white'` | Border colour passed to every visible child avatar. |
| `size` | `Number` | `40` | Size passed to every visible child avatar and used by the overflow badge. |
| `layout` | `'stack' \| 'triangle'` | `'stack'` | Horizontal stack or a three-item triangle layout. |
| `pointer` | `Boolean` | `false` | Uses a pointer cursor for the group. |
| `onClick` | `Function` | — | Click callback for the group. |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `@overflow-click` | `(hiddenUsers, allUsers)` | Fires when the overflow badge is clicked. Both values are arrays of the child avatar props. |

## Usage example

```vue
<AvatarGroup :max="3" :overlap="12" border-color="#1e293b">
  <Avatar name="Tony Stark" status="online" />
  <Avatar name="Bruce Banner" status="away" />
  <Avatar name="Steve Rogers" status="offline" />
  <Avatar name="Natasha Romanoff" status="online" />
  <Avatar name="Peter Parker" status="online" />
</AvatarGroup>
```

Use `layout="triangle"` for a compact, three-item composition. When there are more children than the layout can show, the final visible item becomes the overflow badge.
