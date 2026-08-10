---
title: Nuxt Module
description: Auto-import the Avatar and AvatarGroup components in Nuxt 3 with the official vue3-avatar/nuxt module — SSR-safe, zero manual plugin setup.
---

# Nuxt Module

`vue3-avatar` ships an official Nuxt module that auto-imports `Avatar` and `AvatarGroup` and wires up global defaults — no manual plugin file needed.

## Setup

Add `vue3-avatar/nuxt` to the `modules` array in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-avatar/nuxt'],
});
```

That's it — `<Avatar>` and `<AvatarGroup>` are now available in every component with no `import` statement:

```vue
<template>
  <Avatar name="Ada Lovelace" :size="48" />
</template>
```

## Global defaults

Configure default prop values for every `Avatar` and `AvatarGroup` instance via the `vue3Avatar` key:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue3-avatar/nuxt'],
  vue3Avatar: {
    defaults: {
      size: 40,
      autoContrast: true,
      transition: true,
    },
  },
});
```

Any prop on `Avatar` or `AvatarGroup` (see the [Avatar](/components/avatar) and [AvatarGroup](/components/group) references) can be set as a default here; an explicit prop on a component instance always overrides the default.

## TypeScript

`vue3Avatar` module options are fully typed — `ModuleOptions` is declared against `@nuxt/schema`, so `nuxt.config.ts` gets autocompletion and type-checking for free. No extra setup required.

## SSR & hydration

Colors and pixel-art patterns are generated deterministically from the `name` prop, so server-rendered and client-rendered output always match — no hydration mismatch warnings.

## Manual plugin registration

If you'd rather not use the module (or need finer control over when the plugin registers), you can still register `vue3-avatar` as a plain Vue plugin — see [Global Plugin Registration](/guide/#global-plugin-registration) and the manual setup in the [README's Nuxt section](https://github.com/absurdengineer/vue3-avatar#nuxtjs-support).
