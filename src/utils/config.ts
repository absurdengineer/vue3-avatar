import type { InjectionKey } from "vue";
import type { AvatarGroupProps, AvatarProps } from "../types";

export type AvatarGlobalConfig = Partial<AvatarProps & AvatarGroupProps>;

/** Injection key for the app-wide defaults supplied to `app.use(Avatar, ...)`. */
export const AvatarConfigKey: InjectionKey<AvatarGlobalConfig> =
  Symbol("AvatarConfig");

export type ConfigResolver = <T>(
  key: keyof AvatarGlobalConfig | string,
  localValue: T,
  defaultValue?: T,
  localProvided?: boolean
) => T;

export type ConfigPresence = (key: string) => boolean;

/** Handles the camelCase and kebab-case forms Vue can place on a VNode. */
export const hasVNodeProp = (
  vnodeProps: Record<string, unknown> | null | undefined,
  key: string
): boolean => {
  if (!vnodeProps) return false;
  const kebab = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return Object.prototype.hasOwnProperty.call(vnodeProps, key) ||
    Object.prototype.hasOwnProperty.call(vnodeProps, kebab);
};

/**
 * Builds the resolver used by components to merge a local prop with the
 * app-wide defaults provided through `AvatarConfigKey`.
 *
 * When a component supplies a prop-presence callback, an explicitly supplied
 * local prop wins even when it equals the declared component default. Without
 * that callback the resolver retains its value-based fallback behavior for
 * callers that use it as a standalone utility.
 *
 */
export const createConfigResolver = (
  globalConfig: AvatarGlobalConfig | undefined,
  isLocalProvided?: ConfigPresence
): ConfigResolver => {
  const config = (globalConfig || {}) as Record<string, unknown>;
  return (<T,>(
    key: string,
    localValue: T,
    defaultValue?: T,
    localProvided?: boolean
  ): T => {
    const explicitlyProvided =
      localProvided ?? isLocalProvided?.(key) ?? localValue !== defaultValue;
    if (localValue !== undefined && explicitlyProvided)
      return localValue;
    return (config[key] !== undefined ? config[key] : defaultValue) as T;
  }) as ConfigResolver;
};
