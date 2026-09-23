/**
 * Dependency-free positioning for floating elements (tooltips, popovers).
 *
 * Everything here is pure: rects in, coordinates out. No DOM reads, no `window`,
 * no Vue. That keeps it SSR-safe and lets the interesting geometry be tested
 * without a layout engine, which jsdom does not have.
 *
 * A "rect" is anything shaped like a DOMRect: { x, y, width, height }, measured
 * in viewport coordinates.
 */

import type {
  AvatarRect,
  AvatarSide,
  AvatarTooltipPlacement,
  ComputePositionOptions,
  ComputePositionResult,
} from "../types";

export const SIDES: AvatarSide[] = ["top", "bottom", "left", "right"];
export const ALIGNMENTS = ["start", "end"] as const;

export const PLACEMENTS: AvatarTooltipPlacement[] = SIDES.reduce(
  (all: AvatarTooltipPlacement[], side) => {
    all.push(side);
    ALIGNMENTS.forEach((alignment) => all.push(`${side}-${alignment}`));
    return all;
  },
  []
);

const OPPOSITE_SIDE: Record<AvatarSide, AvatarSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

type ParsedPlacement = {
  side: AvatarSide;
  alignment: "start" | "end" | null;
};

type Coords = { x: number; y: number };

/** Splits `"top-start"` into `{ side: "top", alignment: "start" }`. */
export function parsePlacement(
  placement: string | null | undefined
): ParsedPlacement {
  const [side, alignment] = String(placement || "top").split("-");
  return {
    side: SIDES.includes(side as AvatarSide) ? (side as AvatarSide) : "top",
    alignment: (ALIGNMENTS as readonly string[]).includes(alignment)
      ? (alignment as "start" | "end")
      : null,
  };
}

/** `"top-start"` -> `"bottom-start"`. Alignment is preserved. */
export function flipPlacement(
  placement: string | null | undefined
): AvatarTooltipPlacement {
  const { side, alignment } = parsePlacement(placement);
  const flipped = OPPOSITE_SIDE[side];
  return alignment ? `${flipped}-${alignment}` : flipped;
}

function isVertical(side: AvatarSide): boolean {
  return side === "top" || side === "bottom";
}

function clamp(value: number, min: number, max: number): number {
  // A boundary narrower than the floating element makes min > max; keeping min
  // as the winner pins the element to the start edge rather than jumping.
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/** Raw coordinates for a placement, before any collision handling. */
function coordsForPlacement(
  reference: AvatarRect,
  floating: AvatarRect,
  placement: string,
  offset: number
): Coords {
  const { side, alignment } = parsePlacement(placement);
  let x: number;
  let y: number;

  if (isVertical(side)) {
    y =
      side === "top"
        ? reference.y - floating.height - offset
        : reference.y + reference.height + offset;

    if (alignment === "start") x = reference.x;
    else if (alignment === "end")
      x = reference.x + reference.width - floating.width;
    else x = reference.x + reference.width / 2 - floating.width / 2;
  } else {
    x =
      side === "left"
        ? reference.x - floating.width - offset
        : reference.x + reference.width + offset;

    if (alignment === "start") y = reference.y;
    else if (alignment === "end")
      y = reference.y + reference.height - floating.height;
    else y = reference.y + reference.height / 2 - floating.height / 2;
  }

  return { x, y };
}

/**
 * How far the floating element pokes out of `boundary` on the side it was
 * placed on. Positive means it overflows by that many pixels.
 */
function mainAxisOverflow(
  coords: Coords,
  floating: AvatarRect,
  side: AvatarSide,
  boundary: AvatarRect,
  padding: number
): number {
  if (side === "top") return boundary.y + padding - coords.y;
  if (side === "bottom")
    return (
      coords.y + floating.height - (boundary.y + boundary.height - padding)
    );
  if (side === "left") return boundary.x + padding - coords.x;
  return coords.x + floating.width - (boundary.x + boundary.width - padding);
}

/** Space available between the reference and the boundary edge on `side`. */
function availableSpace(
  reference: AvatarRect,
  side: AvatarSide,
  boundary: AvatarRect,
  padding: number
): number {
  if (side === "top") return reference.y - (boundary.y + padding);
  if (side === "bottom")
    return boundary.y + boundary.height - padding - (reference.y + reference.height);
  if (side === "left") return reference.x - (boundary.x + padding);
  return boundary.x + boundary.width - padding - (reference.x + reference.width);
}

/** Places `floating` against `reference`, honouring flip and shift. */
export function computePosition(
  reference: AvatarRect,
  floating: AvatarRect,
  options: ComputePositionOptions = {}
): ComputePositionResult {
  const {
    placement = "top",
    offset = 8,
    padding = 8,
    boundary = null,
    arrowSize = 8,
    flip = true,
    shift = true,
  } = options;

  let finalPlacement: AvatarTooltipPlacement = PLACEMENTS.includes(
    placement as AvatarTooltipPlacement
  )
    ? (placement as AvatarTooltipPlacement)
    : "top";
  let coords = coordsForPlacement(reference, floating, finalPlacement, offset);

  if (boundary) {
    if (flip) {
      const { side } = parsePlacement(finalPlacement);
      const overflow = mainAxisOverflow(
        coords,
        floating,
        side,
        boundary,
        padding
      );

      if (overflow > 0) {
        const opposite = flipPlacement(finalPlacement);
        const oppositeSide = OPPOSITE_SIDE[side];
        const oppositeCoords = coordsForPlacement(
          reference,
          floating,
          opposite,
          offset
        );
        const oppositeOverflow = mainAxisOverflow(
          oppositeCoords,
          floating,
          oppositeSide,
          boundary,
          padding
        );

        // Flip when the other side fits, or when it is simply the roomier one.
        // Both sides overflowing is common on small screens; picking the larger
        // gap keeps the tooltip as readable as the space allows.
        const takeOpposite =
          oppositeOverflow <= 0 ||
          availableSpace(reference, oppositeSide, boundary, padding) >
            availableSpace(reference, side, boundary, padding);

        if (takeOpposite) {
          finalPlacement = opposite;
          coords = oppositeCoords;
        }
      }
    }

    if (shift) {
      const { side } = parsePlacement(finalPlacement);
      if (isVertical(side)) {
        coords.x = clamp(
          coords.x,
          boundary.x + padding,
          boundary.x + boundary.width - padding - floating.width
        );
      } else {
        coords.y = clamp(
          coords.y,
          boundary.y + padding,
          boundary.y + boundary.height - padding - floating.height
        );
      }
    }
  }

  return {
    x: coords.x,
    y: coords.y,
    placement: finalPlacement,
    arrow: computeArrow(reference, floating, coords, finalPlacement, arrowSize),
  };
}

/**
 * Arrow position relative to the floating element's own top-left corner.
 *
 * The arrow tracks the reference's centre, so it keeps pointing at the avatar
 * even after `shift` has slid the tooltip sideways. It is clamped to the
 * tooltip's edges so it never detaches from the bubble.
 *
 * Only the cross-axis coordinate is meaningful; the other is null.
 */
export function computeArrow(
  reference: AvatarRect,
  floating: AvatarRect,
  coords: Coords,
  placement: string,
  arrowSize: number
): { x: number | null; y: number | null } {
  const { side } = parsePlacement(placement);
  const half = arrowSize / 2;

  if (isVertical(side)) {
    const centre = reference.x + reference.width / 2 - coords.x - half;
    return {
      x: clamp(centre, half, Math.max(half, floating.width - arrowSize - half)),
      y: null,
    };
  }

  const centre = reference.y + reference.height / 2 - coords.y - half;
  return {
    x: null,
    y: clamp(centre, half, Math.max(half, floating.height - arrowSize - half)),
  };
}
