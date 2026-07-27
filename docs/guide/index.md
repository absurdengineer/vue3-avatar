# Getting Started with vue3-avatar

`vue3-avatar` is a flexible avatar component for Vue 3 and Nuxt applications.

## Installation

Install using your preferred package manager:

```bash
npm install vue3-avatar
# or
pnpm add vue3-avatar
# or
yarn add vue3-avatar
```

## Quick Start

### Local Component Registration

Import `Avatar` and optional `AvatarGroup` directly in your component setup:

```vue
<script setup>
import { Avatar, AvatarGroup } from 'vue3-avatar';
</script>

<template>
  <Avatar name="Tony Stark" :size="60" />
</template>
```

### Global Plugin Registration

Register globally with default options in your main entry file (`main.js` / `main.ts`):

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import Avatar from 'vue3-avatar';

const app = createApp(App);

app.use(Avatar, {
  defaults: {
    size: 50,
    autoContrast: true,
    transition: true
  }
});

app.mount('#app');
```

---

## Nuxt 3 Support

`vue3-avatar` is fully safe for Server-Side Rendering (SSR). In Nuxt 3, create a plugin at `plugins/avatar.ts`:

```typescript
import Avatar from 'vue3-avatar';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Avatar);
});
```
