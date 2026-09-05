import type { InjectionKey } from "vue";
import type { AvatarGroupProps, AvatarProps } from "../types";

export type AvatarGlobalConfig = Partial<AvatarProps & AvatarGroupProps>;

/** Injection key for the app-wide defaults supplied to `app.use(Avatar, ...)`. */
export const AvatarConfigKey: InjectionKey<AvatarGlobalConfig> =
  Symbol("AvatarConfig");

export type ConfigResolver = <T>(
  key: keyof AvatarGlobalConfig | string,
  localValue: T,
  defaultValue?: T
) => T;

/**
 * Builds the resolver used by components to merge a local prop with the
 * app-wide defaults provided through `AvatarConfigKey`.
 *
 * A local prop only wins when it differs from the prop's declared default,
 * because Vue gives us no way to tell "caller passed the default explicitly"
 * apart from "caller passed nothing at all".
 *
 */
export const createConfigResolver = (
  globalConfig: AvatarGlobalConfig | undefined
): ConfigResolver => {
  const config = (globalConfig || {}) as Record<string, unknown>;
  return (<T,>(key: string, localValue: T, defaultValue?: T): T => {
    if (localValue !== undefined && localValue !== defaultValue)
      return localValue;
    return (config[key] !== undefined ? config[key] : defaultValue) as T;
  }) as ConfigResolver;
};
