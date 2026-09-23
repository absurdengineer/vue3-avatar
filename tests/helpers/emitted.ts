import type { VueWrapper } from "@vue/test-utils";

/**
 * `wrapper.emitted(name)` is `undefined | unknown[][]`, which forces a null
 * check and a cast at every assertion site. These helpers do it once.
 */
export function emissions(
  wrapper: VueWrapper<any>,
  event: string
): unknown[][] {
  const emitted = wrapper.emitted(event);
  if (!emitted) throw new Error(`Expected "${event}" to have been emitted.`);
  return emitted as unknown[][];
}

/** First argument of the nth emission of `event`, typed as `T`. */
export function payload<T>(
  wrapper: VueWrapper<any>,
  event: string,
  index = 0
): T {
  const all = emissions(wrapper, event);
  if (!all[index])
    throw new Error(`Expected "${event}" to have been emitted ${index + 1}x.`);
  return all[index][0] as T;
}

/** All arguments of the nth emission of `event`. */
export function payloads(
  wrapper: VueWrapper<any>,
  event: string,
  index = 0
): unknown[] {
  const all = emissions(wrapper, event);
  if (!all[index])
    throw new Error(`Expected "${event}" to have been emitted ${index + 1}x.`);
  return all[index];
}
