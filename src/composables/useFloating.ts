import { ref, watch, onBeforeUnmount } from "vue";
import type { Ref } from "vue";
import { computePosition } from "../utils/position";
import type {
  AvatarRect,
  AvatarTooltipPlacement,
  ComputePositionOptions,
} from "../types";

const isBrowser = () => typeof window !== "undefined";

/** Elements that actually scroll, and so can move the reference under us. */
const SCROLLS = /auto|scroll|overlay/;
/** Elements that also clip, which `hidden` does without scrolling. */
const CLIPS = /auto|scroll|overlay|hidden/;

function overflowOf(element: Element): string {
  const style = window.getComputedStyle(element);
  return style.overflow + style.overflowX + style.overflowY;
}

/**
 * Every ancestor whose scrolling can move the reference, so we know what to
 * listen to. `hidden` is included: `scrollTop` still works on it, so it can
 * shift the reference even though it shows no scrollbar.
 */
function getScrollParents(element: HTMLElement | null): HTMLElement[] {
  const parents: HTMLElement[] = [];
  let node = element && element.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    if (CLIPS.test(overflowOf(node))) parents.push(node);
    node = node.parentElement;
  }
  return parents;
}

/**
 * The nearest ancestor the tooltip should be kept inside. Only real scroll
 * boxes qualify: the floating element is teleported to `<body>`, so an
 * `overflow: hidden` ancestor does not clip it, and treating one as a boundary
 * would re-impose the very constraint the teleport exists to escape.
 */
function getClippingBoundary(element: HTMLElement | null): HTMLElement | null {
  let node = element && element.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    if (SCROLLS.test(overflowOf(node))) return node;
    node = node.parentElement;
  }
  return null;
}

function viewportRect(): AvatarRect {
  return {
    x: 0,
    y: 0,
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/** The overlapping region of two rects, clamped to a non-negative size. */
function intersect(a: AvatarRect, b: AvatarRect): AvatarRect {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}

/**
 * The rect we collide against: the nearest scrolling ancestor intersected with
 * the viewport, or the viewport alone. Intersecting matters for a scroll box
 * taller than the screen, whose own rect would otherwise let the tooltip be
 * placed off-screen.
 */
function resolveBoundary(element: HTMLElement): AvatarRect {
  const viewport = viewportRect();
  const scroller = getClippingBoundary(element);
  if (!scroller) return viewport;
  const rect = scroller.getBoundingClientRect();
  return intersect(
    { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    viewport
  );
}

const toRect = (element: HTMLElement): AvatarRect => {
  const rect = element.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};

/**
 * Keeps `floatingRef` positioned against `referenceRef`.
 *
 * Positioning starts when `floatingRef` gains an element and stops when it
 * loses one, so callers only need to mount the floating element conditionally.
 */
export function useFloating(
  referenceRef: Ref<HTMLElement | null>,
  floatingRef: Ref<HTMLElement | null>,
  options: ComputePositionOptions | (() => ComputePositionOptions) = {}
) {
  const x = ref(0);
  const y = ref(0);
  const placement = ref<AvatarTooltipPlacement>("top");
  const arrowX = ref<number | null>(null);
  const arrowY = ref<number | null>(null);
  const isPositioned = ref(false);

  let frame: number | null = null;
  let observer: ResizeObserver | null = null;
  let listening: (Window | HTMLElement)[] = [];

  const readOptions = (): ComputePositionOptions =>
    typeof options === "function" ? options() || {} : options;

  function update() {
    const reference = referenceRef.value;
    const floating = floatingRef.value;
    if (!reference || !floating || !isBrowser()) return;

    const opts = readOptions();
    const result = computePosition(toRect(reference), toRect(floating), {
      ...opts,
      boundary: opts.boundary || resolveBoundary(reference),
    });

    x.value = result.x;
    y.value = result.y;
    placement.value = result.placement;
    arrowX.value = result.arrow.x;
    arrowY.value = result.arrow.y;
    isPositioned.value = true;
  }

  // Scroll and resize fire far faster than we can usefully reposition, so
  // collapse bursts into one measurement per frame.
  function scheduleUpdate() {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      update();
    });
  }

  function start() {
    if (!isBrowser()) return;
    stop();

    const reference = referenceRef.value;
    const floating = floatingRef.value;
    if (!reference || !floating) return;

    const targets: (Window | HTMLElement)[] = [
      window,
      ...getScrollParents(reference),
    ];
    targets.forEach((target) => {
      target.addEventListener("scroll", scheduleUpdate, { passive: true });
      listening.push(target);
    });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleUpdate);
      observer.observe(reference);
      observer.observe(floating);
    }

    update();
  }

  function stop() {
    if (!isBrowser()) return;
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
    listening.forEach((target) =>
      target.removeEventListener("scroll", scheduleUpdate)
    );
    listening = [];
    window.removeEventListener("resize", scheduleUpdate);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    isPositioned.value = false;
  }

  watch(
    floatingRef,
    (element) => {
      if (element) start();
      else stop();
    },
    { flush: "post" }
  );

  onBeforeUnmount(stop);

  return { x, y, placement, arrowX, arrowY, isPositioned, update, stop };
}
