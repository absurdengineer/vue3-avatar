/**
 * Presence colours. These replaced the CSS keywords (green/grey/orange/red) in
 * v5: the keywords sit at wildly different luminances, so a white ring around
 * them read inconsistently. Override per-avatar with `statusColor`, or app-wide
 * with the `statusColors` map.
 */
export const STATUS_COLORS: Record<string, string> = {
  online: "#22c55e",
  away: "#f59e0b",
  busy: "#ef4444",
  offline: "#9ca3af",
};

/** Named status-dot sizes, expressed as a divisor of the avatar size. */
export const STATUS_SIZE_RATIOS: Record<string, number> = {
  sm: 5,
  md: 4,
  lg: 3,
};

/**
 * How far a corner marker has to move inwards to sit on the avatar's edge
 * rather than the edge of its bounding box. A circle's corner is the furthest
 * from its outline; a square needs no inset at all.
 */
export const SHAPE_CORNER_INSET: Record<string, number> = {
  square: 0,
  squircle: 0.035,
  circle: 0.07,
  hexagon: 0.12,
};

/**
 * Badges sit further out than the status dot. A dot is round and reads best
 * tucked onto the outline, whereas a badge is a wide pill: pulling it in by the
 * same amount pushes it visibly towards the middle of the face, so it is inset
 * by roughly half as much and is allowed to overhang the edge.
 */
export const SHAPE_BADGE_INSET: Record<string, number> = {
  square: 0,
  squircle: 0.015,
  circle: 0.03,
  hexagon: 0.055,
};
