---
title: Examples & Showcase
description: Live, copy-pasteable examples of vue3-avatar — initials, status indicators, pixel-art identicons, and avatar groups.
---

# Examples & Showcase

Explore all avatar features and variations.

## Live Examples

<script setup>
import { Avatar, AvatarGroup } from 'vue3-avatar';
</script>

### Initials Avatars

<div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0;">
  <Avatar name="Tony Stark" :size="50" />
  <Avatar name="Bruce Banner" :size="50" />
  <Avatar name="Steve Rogers" :size="50" />
  <Avatar name="Natasha Romanoff" :size="50" />
</div>

```vue
<Avatar name="Tony Stark" :size="50" />
<Avatar name="Bruce Banner" :size="50" />
<Avatar name="Steve Rogers" :size="50" />
<Avatar name="Natasha Romanoff" :size="50" />
```

---

### Presence Status Indicators

<div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0;">
  <Avatar name="Tony Stark" status="online" :size="50" />
  <Avatar name="Bruce Banner" status="away" :size="50" />
  <Avatar name="Steve Rogers" status="busy" :size="50" />
  <Avatar name="Natasha Romanoff" status="offline" :size="50" />
</div>

```vue
<Avatar name="Tony Stark" status="online" :size="50" />
<Avatar name="Bruce Banner" status="away" :size="50" />
<Avatar name="Steve Rogers" status="busy" :size="50" />
<Avatar name="Natasha Romanoff" status="offline" :size="50" />
```

---

### PixelGen Identicons

<div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0; flex-wrap: wrap;">
  <Avatar name="tony@stark.com" variant="pixel" pixel-theme="earth" :size="50" />
  <Avatar name="bruce@hulk.org" variant="pixel" pixel-theme="neon" :size="50" />
  <Avatar name="steve@avengers.io" variant="pixel" pixel-theme="ocean" :size="50" />
  <Avatar name="natasha@shield.gov" variant="pixel" pixel-theme="sunset" :size="50" />
  <Avatar name="peter@web.net" variant="pixel" pixel-theme="midnight" :size="50" />
</div>

```vue
<Avatar name="tony@stark.com" variant="pixel" pixel-theme="earth" :size="50" />
<Avatar name="bruce@hulk.org" variant="pixel" pixel-theme="neon" :size="50" />
<Avatar name="steve@avengers.io" variant="pixel" pixel-theme="ocean" :size="50" />
<Avatar name="natasha@shield.gov" variant="pixel" pixel-theme="sunset" :size="50" />
<Avatar name="peter@web.net" variant="pixel" pixel-theme="midnight" :size="50" />
```

---

### Avatar Groups

<div style="margin: 1rem 0;">
  <AvatarGroup :max="3">
    <Avatar name="Tony Stark" status="online" />
    <Avatar name="Bruce Banner" status="away" />
    <Avatar name="Steve Rogers" status="offline" />
    <Avatar name="Natasha Romanoff" status="online" />
    <Avatar name="Peter Parker" status="online" />
  </AvatarGroup>
</div>

```vue
<AvatarGroup :max="3">
  <Avatar name="Tony Stark" status="online" />
  <Avatar name="Bruce Banner" status="away" />
  <Avatar name="Steve Rogers" status="offline" />
  <Avatar name="Natasha Romanoff" status="online" />
  <Avatar name="Peter Parker" status="online" />
</AvatarGroup>
```
