/**
 * Combination helpers shared by the visual matrix and the jsdom permutation
 * suite.
 *
 * The full cartesian product of every prop is not a test plan — it is 2^60
 * cases. The rule used across these suites is: exhaust the *enumerable*
 * dimensions (shape, status, placement, theme…), where a missed combination
 * really can look wrong, and cover the boolean flags pairwise, where bugs come
 * from a pair interacting rather than from all ten being set at once.
 */

/** Every combination of the given lists, in stable order. */
export function cartesian<T extends readonly (readonly unknown[])[]>(
  ...lists: T
): { [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }[] {
  return lists.reduce<unknown[][]>(
    (acc, list) => acc.flatMap((row) => list.map((value) => [...row, value])),
    [[]]
  ) as never;
}

export interface Dimension<T = unknown> {
  name: string;
  values: readonly T[];
}

/**
 * All-pairs coverage: every value of every dimension appears together with
 * every value of every other dimension at least once, without enumerating the
 * full product.
 *
 * Uses a greedy in-parameter-order construction. It is not guaranteed minimal,
 * but it is deterministic, which matters more here — a test suite whose case
 * list changes between runs is not a regression test.
 */
export function pairwise(
  dimensions: Dimension[]
): Record<string, unknown>[] {
  if (dimensions.length === 0) return [];
  if (dimensions.length === 1)
    return dimensions[0].values.map((value) => ({
      [dimensions[0].name]: value,
    }));

  const uncovered = new Set<string>();
  const pairKey = (
    i: number,
    vi: number,
    j: number,
    vj: number
  ): string => `${i}:${vi}|${j}:${vj}`;

  for (let i = 0; i < dimensions.length; i++) {
    for (let j = i + 1; j < dimensions.length; j++) {
      for (let vi = 0; vi < dimensions[i].values.length; vi++) {
        for (let vj = 0; vj < dimensions[j].values.length; vj++) {
          uncovered.add(pairKey(i, vi, j, vj));
        }
      }
    }
  }

  const rows: number[][] = [];

  while (uncovered.size > 0) {
    const row: number[] = new Array(dimensions.length).fill(-1);

    // Seed the row with the first still-uncovered pair, then greedily fill the
    // remaining dimensions with whichever value closes the most pairs.
    const [firstKey] = uncovered;
    const [left, right] = firstKey.split("|");
    const [li, lv] = left.split(":").map(Number);
    const [ri, rv] = right.split(":").map(Number);
    row[li] = lv;
    row[ri] = rv;

    for (let d = 0; d < dimensions.length; d++) {
      if (row[d] !== -1) continue;

      let best = 0;
      let bestScore = -1;
      for (let v = 0; v < dimensions[d].values.length; v++) {
        let score = 0;
        for (let o = 0; o < dimensions.length; o++) {
          if (o === d || row[o] === -1) continue;
          const key =
            o < d ? pairKey(o, row[o], d, v) : pairKey(d, v, o, row[o]);
          if (uncovered.has(key)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          best = v;
        }
      }
      row[d] = best;
    }

    for (let i = 0; i < dimensions.length; i++) {
      for (let j = i + 1; j < dimensions.length; j++) {
        uncovered.delete(pairKey(i, row[i], j, row[j]));
      }
    }

    rows.push(row);
  }

  return rows.map((row) => {
    const entry: Record<string, unknown> = {};
    row.forEach((valueIndex, d) => {
      entry[dimensions[d].name] = dimensions[d].values[valueIndex];
    });
    return entry;
  });
}

/** Turns prop values into a stable, filesystem-safe golden name. */
export function caseName(prefix: string, parts: unknown[]): string {
  const slug = parts
    .map((part) =>
      String(part)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    )
    .filter(Boolean)
    .join("_");
  return slug ? `${prefix}__${slug}` : prefix;
}

// --- Shared value sets, kept in one place so suites cannot drift apart -------

export const SHAPES = ["circle", "square", "squircle", "hexagon"] as const;
export const VARIANTS = ["initials", "pixel"] as const;
export const STATUSES = ["online", "away", "busy", "offline"] as const;
export const CORNERS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;
export const STATUS_SIZES = ["sm", "md", "lg"] as const;
export const BADGE_VARIANTS = ["count", "dot", "icon"] as const;
export const PIXEL_THEMES = [
  "earth",
  "neon",
  "ocean",
  "forest",
  "sunset",
  "midnight",
  "candy",
  "retro",
] as const;
export const TOOLTIP_PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
] as const;
export const TOOLTIP_THEMES = ["dark", "light", "auto"] as const;
export const GROUP_LAYOUTS = ["stack", "triangle"] as const;
export const ROOT_TAGS = ["div", "button", "a"] as const;

/** Fixed cast, so generated colours and initials never move between runs. */
export const ROSTER = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Edsger Dijkstra" },
] as const;
