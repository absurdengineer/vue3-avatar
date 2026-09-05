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
| `overflowTooltip` | `Boolean \| String` | — | Overrides the tooltip content on the `+N` badge, or disables it with `false`. |
| `tooltipPlacement` | `String` | `'top'` | Placement for the overflow tooltip. |
| `tooltipTheme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | Theme for the overflow tooltip. |
| `nativeTitle` | `Boolean` | `false` | Restores the v4 `title` attributes on the group and its badge. |

## Slots

| Slot | Scope | Description |
| --- | --- | --- |
| `default` | — | The child `<Avatar />` components. |
| `overflow-tooltip` | `{ hiddenUsers, allUsers, overflowCount, hiddenNames }` | Replaces the body of the overflow badge's tooltip. |

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

## Overflow tooltip

The `+N` badge shows the hidden names in a styled tooltip. Up to v4 this was a
native `title` attribute on both the badge and the group root; the group root no
longer carries one, because each child avatar already has its own tooltip and
listing every name again on the container only produced a duplicate.

```vue
<AvatarGroup :max="3">
  <Avatar v-for="user in users" :key="user.id" :name="user.name" />

  <template #overflow-tooltip="{ hiddenUsers, overflowCount }">
    {{ overflowCount }} more: {{ hiddenUsers.map((u) => u.name).join(", ") }}
  </template>
</AvatarGroup>
```

The badge's `aria-label` already names the hidden users, so the tooltip is
decoration for sighted users rather than a second description.

See the [Tooltip](/components/tooltip) page for the shared options.
