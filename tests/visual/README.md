# Visual regression tests

These tests render the real components in a real browser, screenshot them, and
compare the result against a committed reference image **pixel by pixel**. They
also probe individual pixels for exact colours, which is how the documented
status and badge palettes are held in place.

Nothing here runs in jsdom: jsdom has no layout engine and no renderer, so it
cannot tell you that a status dot drifted off the edge of a hexagon or that a
tooltip flipped to the wrong side.

## Running

```bash
npm run test:visual           # compare against the committed goldens
npm run test:visual:update    # re-record the goldens
npm run test:visual:headed    # watch it happen in a real window
```

VS Code users have equivalents in the Run and Debug panel, including
**Test: current file (visual)**.

The first run downloads Chromium (~95 MB) via the `pretest:visual` hook.

## How it works

| Piece | Role |
| --- | --- |
| `support/server.ts` | A Vite dev server over the repo, so tests run against `src/` with no build step. |
| `support/globalSetup.ts` | Starts one Chromium and one Vite server for the whole run. |
| `harness.html` / `harness.ts` | A blank page exposing `window.__mount({ component, props, children, defaults })`. |
| `support/visual.ts` | `VisualContext`: mount, screenshot, compare, and probe geometry. |
| `support/pixels.ts` | PNG decoding, pixelmatch comparison, colour probing, golden bookkeeping. |
| `support/matrix.ts` | Combination helpers and the shared value sets. |

Determinism is deliberate: a fixed 800x600 viewport at DPR 1, `reducedMotion:
"reduce"`, animations disabled in CSS, `--disable-lcd-text`, sRGB forced, and a
two-frame wait after every mount. Without those, comparisons are a coin flip.

## Goldens

References live in `__screenshots__/{platform}-{arch}/`. They are committed.

They are stored per platform because macOS and Linux rasterise fonts and round
subpixels differently. One shared set would either be permanently red on one
platform, or need a threshold so loose it stops catching real regressions.

**A missing golden is not a pass.** The first run for a new case records the
image and then fails, telling you to look at it. Reviewing a reference image is
the entire point of the technique.

When a test fails, three files are written to `__diff__/{platform}-{arch}/`:
the golden, the actual render, and a highlighted diff. That directory is
gitignored.

Never re-record from a headed run — headed and headless captures are not
byte-identical.

## Writing a case

```ts
const png = await visual.matchesGolden("status__online_circle", {
  props: { name: "Ada Lovelace", status: "online" },
});

// Probes read live geometry rather than hand-computed offsets: the avatar's
// outline is size/20, so arithmetic in a test rots the moment a border changes.
expectPixelAt(png, await visual.centerOf(".status-indicator"), "#22C55E", 4);
```

For tooltips, pass `hover` and `fullPage: true` — tooltips teleport to
`document.body` and are not inside the captured stage element.

## What is covered

Enumerable dimensions are exhausted; boolean flags are covered pairwise in
`tests/permutations.spec.ts` instead, where they are far cheaper to run.

| Suite | Matrix |
| --- | --- |
| `shapes.spec.ts` | shape x variant, shape x image, shape x dark x gradient, borderless |
| `status.spec.ts` | status x corner x shape (64), status x size, colour probes |
| `badge.spec.ts` | variant x corner, shape, count boundaries, contrast |
| `pixel-art.spec.ts` | theme x dark, shape clipping, per-name determinism |
| `tooltip.spec.ts` | 12 placements, 3 themes, arrows, flip at the viewport edge |
| `group.spec.ts` | layout x max, overlap, overflow tooltip |
| `interaction.spec.ts` | root tag x disabled, selected, editable, focus, skeleton |

## CI

`.github/workflows/visual.yml` runs this suite on every pull request, separately
from `ci.yml`: it needs a browser, and a pixel failure is a different
conversation from a failing unit test. The runner is pinned to `ubuntu-24.04`
rather than `ubuntu-latest` — an image bump can change font rasterisation and
invalidate every golden at once.

Golden, actual and diff are uploaded as a `visual-diff-*` artifact whenever the
job fails, so a change can be reviewed without reproducing it locally.

### Recording the Linux goldens

Only `darwin-arm64` is committed today. A whole missing platform directory is a
bootstrap rather than a regression, so the job detects it, **records** the set
instead of asserting against it, and flags that the gate is not live yet with a
warning annotation and a job summary. Failing 240 cases would say nothing that
one line does not.

The first pull-request run therefore goes green and leaves the images attached
to it. To turn the gate on:

1. Open that run and download the `visual-goldens-linux-x64` artifact.
2. Look at the images. An unreviewed reference is not a reference — that is the
   whole technique.
3. Commit them to `tests/visual/__screenshots__/linux-x64/`.

From then on the job asserts, and a case added later without a golden fails the
way it does locally. Re-record with the **Visual** workflow's manual `record`
input after a deliberate visual change or a Playwright upgrade — a new browser
rasterises differently and invalidates the whole set.

Recording locally for Linux works too, if you have Docker:

```bash
docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.62.1-noble \
  sh -c "npm ci && npm run test:visual:update"
```
