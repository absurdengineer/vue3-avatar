import { ref, computed, watch, onBeforeUnmount } from "vue";
import type { UseTooltipOptions } from "../types";

/** Spreadable listener map: keys are already `onEventName`, ready for v-bind. */
export type TooltipListeners = Record<string, (event: any) => void>;

const isBrowser = () => typeof window !== "undefined";

const LONG_PRESS_MS = 500;
// Touch devices synthesise mouse events shortly after a tap. Ignoring pointer
// events for a moment after a touch stops a tap from opening the tooltip
// through the hover path we deliberately gated behind a long press.
const GHOST_MOUSE_MS = 500;

/**
 * Open/close state machine for a tooltip. Owns delays, triggers and Escape;
 * owns no DOM and does no positioning — that is `useFloating`'s job.
 */
export function useTooltip(
  options: UseTooltipOptions | (() => UseTooltipOptions) = {}
) {
  const isOpen = ref(false);

  const readOptions = (): UseTooltipOptions =>
    typeof options === "function" ? options() || {} : options;

  const triggers = computed(() => {
    const raw = readOptions().trigger;
    return String(raw === undefined ? "hover focus" : raw)
      .split(/\s+/)
      .filter(Boolean);
  });

  const has = (name: string) => triggers.value.includes(name);

  type Timer = ReturnType<typeof setTimeout> | null;
  let openTimer: Timer = null;
  let closeTimer: Timer = null;
  let pressTimer: Timer = null;
  let lastTouchAt = 0;

  function clearTimers() {
    [openTimer, closeTimer, pressTimer].forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    openTimer = closeTimer = pressTimer = null;
  }

  function show(immediate = false): void {
    const { disabled, openDelay } = readOptions();
    if (disabled) return;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
    if (isOpen.value) return;

    const delay = immediate ? 0 : openDelay === undefined ? 200 : openDelay;
    if (!delay) {
      isOpen.value = true;
      return;
    }
    if (openTimer) clearTimeout(openTimer);
    openTimer = setTimeout(() => {
      openTimer = null;
      isOpen.value = true;
    }, delay);
  }

  function hide(immediate = false): void {
    if (openTimer) clearTimeout(openTimer);
    openTimer = null;
    if (!isOpen.value) return;

    const { closeDelay } = readOptions();
    const delay = immediate ? 0 : closeDelay === undefined ? 100 : closeDelay;
    if (!delay) {
      isOpen.value = false;
      return;
    }
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      closeTimer = null;
      isOpen.value = false;
    }, delay);
  }

  function toggle(): void {
    if (isOpen.value) hide(true);
    else show(true);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" || event.key === "Esc") hide(true);
  }

  // Only listen for Escape while something is actually open.
  watch(isOpen, (open) => {
    if (!isBrowser()) return;
    if (open) document.addEventListener("keydown", onKeydown);
    else document.removeEventListener("keydown", onKeydown);
  });

  onBeforeUnmount(() => {
    clearTimers();
    if (isBrowser()) document.removeEventListener("keydown", onKeydown);
  });

  const isGhostMouseEvent = () =>
    lastTouchAt && Date.now() - lastTouchAt < GHOST_MOUSE_MS;

  const referenceProps = computed<TooltipListeners>(() => {
    const props: TooltipListeners = {};
    if (has("manual")) return props;

    if (has("hover")) {
      props.onMouseenter = () => {
        if (!isGhostMouseEvent()) show();
      };
      props.onMouseleave = () => hide();

      // Long press is the touch equivalent of hover. A quick tap clears the
      // timer before it fires, so tapping a clickable avatar still just clicks.
      props.onTouchstart = () => {
        lastTouchAt = Date.now();
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          pressTimer = null;
          show(true);
        }, LONG_PRESS_MS);
      };
      const endTouch = () => {
        lastTouchAt = Date.now();
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
        hide();
      };
      props.onTouchend = endTouch;
      props.onTouchcancel = endTouch;
      props.onTouchmove = () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
      };
    }

    if (has("focus")) {
      props.onFocusin = (event: FocusEvent) => {
        // Keyboard focus should show the tooltip; a mouse click that happens to
        // focus the avatar should not leave one hanging around.
        const target = event.target as Element | null;
        let visible = true;
        try {
          if (target && typeof target.matches === "function")
            visible = target.matches(":focus-visible");
        } catch (error) {
          visible = true; // engines without :focus-visible support
        }
        if (visible) show(true);
      };
      props.onFocusout = () => hide(true);
    }

    if (has("click")) {
      props.onClick = () => toggle();
    }

    return props;
  });

  // With `interactive`, moving the pointer into the tooltip cancels the pending
  // close so links and buttons inside it are actually reachable.
  const floatingProps = computed<TooltipListeners>(() => {
    const { interactive } = readOptions();
    const none: TooltipListeners = {};
    if (!interactive || has("manual")) return none;
    return {
      onMouseenter: () => {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = null;
      },
      onMouseleave: () => hide(),
    };
  });

  return { isOpen, show, hide, toggle, referenceProps, floatingProps };
}
