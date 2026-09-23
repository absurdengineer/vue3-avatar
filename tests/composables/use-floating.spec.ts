import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, ref, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useFloating } from "../../src/composables/useFloating";
import type { ComputePositionOptions } from "../../src/types";

/**
 * jsdom has no layout, so every rect here is stubbed. That is deliberate: the
 * geometry is proven against real numbers in `tests/utils/position.spec.ts`,
 * and what is worth testing at this level is the wiring — which ancestor
 * becomes the collision boundary, what gets listened to, and what is released.
 *
 * The DOM is built by hand rather than rendered, because the shape that
 * matters is the one a teleported tooltip has: the reference nested inside a
 * styled ancestor, the floating element a sibling of that ancestor on `body`.
 */

const VIEWPORT = { width: 1000, height: 800 };

const DEFAULT_RECTS = {
  boundary: { x: 400, y: 200, width: 200, height: 200 },
  reference: { x: 460, y: 260, width: 80, height: 80 },
  floating: { x: 0, y: 0, width: 240, height: 40 },
};

type Rect = { x: number; y: number; width: number; height: number };

function stubRect(element: Element, rect: Rect): void {
  element.getBoundingClientRect = () =>
    ({
      ...rect,
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => ({}),
    } as DOMRect);
}

interface Harness {
  outer: HTMLElement;
  reference: HTMLElement;
  floating: HTMLElement;
  state: ReturnType<typeof useFloating>;
  /** Attaches the floating element, which is what starts positioning. */
  open: () => Promise<void>;
  unmount: () => void;
}

function createHarness(
  overflow: string,
  options: ComputePositionOptions = {},
  rects: Partial<typeof DEFAULT_RECTS> = {}
): Harness {
  const geometry = { ...DEFAULT_RECTS, ...rects };

  const outer = document.createElement("div");
  outer.style.overflow = overflow;
  const reference = document.createElement("div");
  const floating = document.createElement("div");

  outer.appendChild(reference);
  document.body.appendChild(outer);
  document.body.appendChild(floating);

  stubRect(outer, geometry.boundary);
  stubRect(reference, geometry.reference);
  stubRect(floating, geometry.floating);

  const referenceRef = ref<HTMLElement | null>(reference);
  const floatingRef = ref<HTMLElement | null>(null);

  let state!: ReturnType<typeof useFloating>;
  const Host = defineComponent({
    setup() {
      state = useFloating(referenceRef, floatingRef, options);
      return () => null;
    },
  });

  const wrapper = mount(Host);

  return {
    outer,
    reference,
    floating,
    get state() {
      return state;
    },
    open: async () => {
      floatingRef.value = floating;
      await nextTick();
    },
    unmount: () => wrapper.unmount(),
  };
}

describe("useFloating", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: VIEWPORT.width,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: VIEWPORT.height,
      configurable: true,
    });
    // jsdom never paints, so a real rAF would leave `update` pending forever.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  describe("boundary resolution", () => {
    /*
     * With the default rects, `top` never overflows, so the interesting number
     * is x. Centred on the reference it is 460 + 40 - 120 = 380. Colliding
     * against the 200px-wide ancestor instead pins it to that box's padding
     * edge at 408, because the tooltip is wider than the box.
     */
    const CENTRED_ON_REFERENCE = 380;
    const PINNED_TO_ANCESTOR = 408;

    it("uses the viewport when no ancestor scrolls", async () => {
      const h = createHarness("visible");
      await h.open();

      expect(h.state.x.value).toBe(CENTRED_ON_REFERENCE);
      expect(h.state.placement.value).toBe("top");
      h.unmount();
    });

    it("ignores an overflow:hidden ancestor, which cannot clip a teleport", async () => {
      const h = createHarness("hidden");
      await h.open();

      // This is the whole point of teleporting the tooltip to <body>: a
      // clipping ancestor no longer constrains it, so it must not constrain
      // the placement either.
      expect(h.state.x.value).toBe(CENTRED_ON_REFERENCE);
      h.unmount();
    });

    it.each(["auto", "scroll", "overlay"])(
      "collides against an overflow:%s ancestor",
      async (overflow) => {
        const h = createHarness(overflow);
        await h.open();

        expect(h.state.x.value).toBe(PINNED_TO_ANCESTOR);
        h.unmount();
      }
    );

    it("intersects a scroll box that runs past the bottom of the screen", async () => {
      const h = createHarness(
        "auto",
        { placement: "bottom" },
        {
          // Five times taller than the viewport.
          boundary: { x: 0, y: 0, width: 900, height: 4000 },
          reference: { x: 100, y: 700, width: 80, height: 80 },
        }
      );
      await h.open();

      // The scroll box alone would happily place the tooltip at y = 788, below
      // the fold. Intersecting with the viewport forces the flip.
      expect(h.state.placement.value).toBe("top");
      expect(h.state.y.value).toBe(652);
      h.unmount();
    });

    it("prefers an explicit boundary over anything it would resolve", async () => {
      const h = createHarness("auto", {
        boundary: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      });
      await h.open();

      expect(h.state.x.value).toBe(CENTRED_ON_REFERENCE);
      h.unmount();
    });

    it("keeps the arrow pointing at the reference after a shift", async () => {
      const h = createHarness("auto");
      await h.open();

      // Reference centre 500, tooltip left edge 408, arrow half-width 4.
      expect(h.state.arrowX.value).toBe(500 - 408 - 4);
      expect(h.state.arrowY.value).toBeNull();
      h.unmount();
    });
  });

  describe("lifecycle", () => {
    it("positions nothing until the floating element exists", async () => {
      const h = createHarness("visible");
      expect(h.state.isPositioned.value).toBe(false);

      await h.open();
      expect(h.state.isPositioned.value).toBe(true);
      h.unmount();
    });

    it("listens to the window and to every clipping ancestor", async () => {
      const h = createHarness("hidden");
      const ancestorSpy = vi.spyOn(h.outer, "addEventListener");
      const windowSpy = vi.spyOn(window, "addEventListener");

      await h.open();

      // `hidden` is not a boundary, but it still scrolls programmatically and
      // so can move the reference out from under the tooltip.
      expect(ancestorSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );
      expect(windowSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );
      expect(windowSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );
      h.unmount();
    });

    it("repositions when a scroll ancestor moves", async () => {
      const h = createHarness("auto");
      await h.open();

      // Still inside the scroll box, so the placement holds and only y moves.
      stubRect(h.reference, { x: 460, y: 300, width: 80, height: 80 });
      h.outer.dispatchEvent(new Event("scroll"));

      expect(h.state.placement.value).toBe("top");
      expect(h.state.y.value).toBe(300 - 40 - 8);
      h.unmount();
    });

    it("releases every listener on unmount", async () => {
      const h = createHarness("auto");
      const ancestorSpy = vi.spyOn(h.outer, "removeEventListener");
      const windowSpy = vi.spyOn(window, "removeEventListener");

      await h.open();
      h.unmount();

      expect(ancestorSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
      expect(windowSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
      expect(windowSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(h.state.isPositioned.value).toBe(false);
    });

    it("stops positioning when the floating element goes away", async () => {
      const h = createHarness("auto");
      await h.open();
      expect(h.state.isPositioned.value).toBe(true);

      h.state.stop();
      expect(h.state.isPositioned.value).toBe(false);
      h.unmount();
    });

    it("does nothing when either element is missing", () => {
      const Host = defineComponent({
        setup() {
          const reference = ref<HTMLElement | null>(null);
          const floating = ref<HTMLElement | null>(null);
          const state = useFloating(reference, floating);
          expect(() => state.update()).not.toThrow();
          expect(state.isPositioned.value).toBe(false);
          return () => null;
        },
      });
      mount(Host).unmount();
    });
  });
});
