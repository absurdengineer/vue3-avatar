# Avatar improvement roadmap

Updated 2026-09-22 against the repository's v5.0.0 source. Stable avatar identity is the current implementation; it has not been released. The remaining items are proposed follow-ups, ordered around reliability and integration quality.

Focus: improve the avatars, image handling, configuration, and groups that users already depend on. Add public options only when they solve a demonstrated problem.

## 1. Stable avatar identity — current implementation, unreleased

Without an explicit seed, generated colors and pixel patterns use the display name as their input. A stable seed lets a person keep recognizable artwork when their name changes.

```vue
<Avatar :name="user.displayName" :seed="user.id" variant="pixel" />
```

Implementation plan:

1. Add an optional `seed?: string | number` prop and resolve it as `String(seed ?? name)`. Preserve explicit `0` and empty-string seeds.
2. Use that value for generated colors and pixel patterns. Keep initials, tooltips, and accessible labels tied to `name`.
3. Preserve the existing hash algorithms and output when the seed is omitted. Explicit color/background overrides continue to work.
4. Document the prop with a rename example and add a small playground control within the existing interface.

Acceptance: changing only `name` keeps seeded colors and artwork while updating initials and labels; changing the seed updates generated output; omitted seeds retain existing output; string and numeric seeds work in server and client rendering. Determinism does not guarantee unique artwork for every seed.

Primary files: [Avatar.vue](../src/components/Avatar.vue), [types.ts](../src/types.ts), [avatar documentation](../docs/components/avatar.md), and [playground](../docs/.vitepress/theme/components/AvatarPlayground.vue). Reuse the existing color and pixel utilities.

## Recommended follow-ups

“Verified gap” means it is directly visible in the inspected source or documented contract. It does not mean a runtime regression has already been reproduced. Each implementation should start with the smallest failing example.

| Priority | Improvement | Evidence / status | Completion target |
| --- | --- | --- | --- |
| Done | Image slot integration and source changes | Implemented with focused lifecycle and fallback regressions | Custom images and fallback replacements recover reliably |
| Done | Explicit component props override global defaults | Implemented with Avatar and AvatarGroup regressions | Local values win even when equal to library defaults |
| Done | Unicode-safe initials | Implemented with grapheme and font-sizing regressions | Initials preserve complete visible characters |
| Done | Group keyboard behavior and RTL layout | Implemented descendant-activation guards and logical layout rules with focused interaction/geometry tests | Predictable keyboard activation and spacing in both directions |

### Image slot integration and source changes

Evidence before implementation: [Avatar.vue](../src/components/Avatar.vue) attached load/error listeners to the image slot, but the slot type and [NuxtImg example](../docs/components/avatar.md#nuxt-image-slot) did not expose/document callback forwarding. Image state reset only when `imageSrc` changed; replacing `fallbackSrc` after exhaustion left the error flag set. The implementation now covers these cases in [image fallback tests](../tests/image-fallback.spec.ts) and [custom slot tests](../tests/image-slot.spec.ts).

Build plan:

1. Expose and type `onLoad`/`onError` and the resolved class in the image slot, update the Nuxt example, and verify loading/fallback events.
2. Cover replacing a failed fallback chain, replacing the currently loaded fallback, and adding an image to a fallback-only avatar. Define when a changed source chain starts a fresh attempt.
3. Reset the relevant error/loading/index state when that image input changes, while preserving normal advancement through the chain.
4. Guard rapid source swaps and stale image events, account for cached/hydrated images, and prevent a primary `srcset` from leaking into fallback attempts.

Acceptance: custom images clear skeletons and report load/error correctly; fresh fallback inputs retry after failure; replacements cannot leave stale loaded state; hydration recognizes already-complete images; existing event payloads remain compatible.

Status: implemented in the current working tree; release this alongside its focused tests and documentation.

Scope: existing component, slot types, documentation, and image regression tests. A photo editor is not needed for these improvements.

### Explicit prop precedence

Evidence before implementation: [createConfigResolver](../src/utils/config.ts) treated a local value equal to the library default as omitted. For example, a local `:size="40"` could not override an app-wide size of 100; local `false` could lose to global `true`. The resolver now checks whether the prop was present on the component VNode, with regressions in [global configuration tests](../tests/global-config.spec.ts).

Build plan:

1. Keep regressions for explicit `size=40` against global 100, explicit `autoContrast=false` against global true, and the same precedence in `AvatarGroup`.
2. Distinguish omitted props from explicitly supplied values in both Avatar and AvatarGroup using the component VNode's prop keys. Resolve precedence as local prop → app default → library default.
3. Audit all resolver call sites and document which props support global defaults. Preserve existing unconfigured rendering and isolation between Vue apps.
4. Check server rendering and Nuxt configuration with the same cases.

Acceptance: explicit values, including `false`, `0` where supported, and declared defaults, take precedence; omitted props inherit; updates remain reactive.

Status: implemented in the current working tree; release this alongside its focused configuration tests and docs.

Scope: improve the existing configuration resolver and consumers. A new provider component is deferred.

### Unicode-safe initials

Evidence before implementation: [getInitials](../src/utils/initials.ts) took each word's first UTF-16 code unit. This could split supplementary characters and drop combining marks from an initial. Font sizing in [Avatar.vue](../src/components/Avatar.vue) also used string length. The implementation now uses grapheme segmentation with a compatibility fallback and covers the cases in [initials tests](../tests/utils/initials.spec.ts).

Build plan:

1. Keep fixtures for supplementary letters, decomposed accented initials, emoji sequences, repeated whitespace, and uppercase expansions alongside existing ordinary-name fixtures.
2. Extract complete grapheme clusters and count them consistently for font sizing, while preserving the established first/second/last-word selection policy.
3. Use `Intl.Segmenter` where available with a bundled fallback for common combining marks and emoji sequences. Document the supported behavior; code-point splitting alone does not preserve combining sequences.
4. Keep this focused on correctness. Consider initials overrides or locale options only if supported names require them and consumers demonstrate demand.

Acceptance: selected initials contain complete visible characters, existing ordinary-name output stays stable, and supported server/client environments agree.

Status: implemented in the current working tree; release this alongside its focused initials and avatar tests and documentation.

Primary files: [initials helper](../src/utils/initials.ts), [Avatar.vue](../src/components/Avatar.vue), and [initials tests](../tests/utils/initials.spec.ts).

### Group keyboard behavior and RTL

Evidence before implementation: [AvatarGroup.vue](../src/components/AvatarGroup.vue) used physical `margin-left` for stacked spacing. Its clickable group wrapper could contain interactive avatars, and its key handler did not distinguish events from descendants. The implementation now guards bubbled activation and uses logical spacing/edge placement, covered by [AvatarGroup tests](../tests/avatar-group.spec.ts) and [RTL visual geometry tests](../tests/visual/group.spec.ts).

Build plan:

1. Reproduce Enter/Space activation on the group, an interactive child avatar, and overflow. Record which callbacks fire and where focus remains.
2. Fix confirmed duplicate or misdirected activation, and review the clickable wrapper's semantics when it contains interactive descendants. Preserve documented overflow payloads.
3. Replace stack overlap with logical spacing and verify actual geometry under inherited `dir="rtl"`. Check triangle placement separately before deciding whether its visual ordering should change.
4. Verify visible focus, accessible names, tooltip behavior, and keyboard operation in both directions with existing controls.

Acceptance: one intended action per activation, usable descendant controls, visible focus, and correct stacked overlap in both directions. New logical badge/status APIs and automatic group sizing are separate proposals.

Status: implemented in the current working tree; release this alongside its focused group interaction and RTL tests and documentation.

## Delivery plan

1. Finish stable identity with compatibility checks, public types, documentation, and the existing playground.
2. Reproduce and fix image integration/state issues, then explicit configuration precedence in separate changes.
3. Resolve group interaction/RTL findings with focused regressions and browser checks where geometry or native events matter; Unicode behavior is now covered.
4. For each change, run relevant tests plus the repository's required checks; add release notes describing observable behavior. Do not mark a roadmap item complete solely because its source has changed.

The follow-ups above are planning only in the current seed implementation. Reassess priority from concrete user reports and reproduced failures.

## Deferred until demand is clear

Automatic group sizing, shareable playground presets, custom initials controls, a member search dialog, a picture crop editor, story/progress rings, a scoped theme provider, and SVG/PNG export remain possible ideas. They are outside the recommended improvement work and have no committed implementation phase.
