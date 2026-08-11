import type { CSSProperties, DefineComponent, InjectionKey, Plugin } from "vue";

export type AvatarShape = "circle" | "square" | "squircle" | "hexagon";
export type AvatarStatus = "away" | "online" | "offline" | "busy";
export type AvatarStatusPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";
export type AvatarVariant = "initials" | "pixel";
export type AvatarLoading = "lazy" | "eager";
export type AvatarPixelTheme =
  | "earth"
  | "neon"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight"
  | "candy"
  | "retro"
  | (string & {});
export type AvatarGroupLayout = "stack" | "triangle";

export interface AvatarProps {
  name: string;
  color?: string;
  background?: string;
  size?: number;
  dark?: boolean;
  inline?: boolean;
  rounded?: boolean;
  shape?: AvatarShape;
  imageSrc?: string;
  alt?: string;
  loading?: AvatarLoading;
  transition?: boolean;
  border?: boolean;
  borderColor?: string;
  customAvatarStyle?: CSSProperties;
  status?: AvatarStatus | null;
  statusPosition?: AvatarStatusPosition;
  customStatusStyle?: CSSProperties;
  sameBorder?: boolean;
  interactive?: boolean;
  /** @deprecated Use for backwards compatibility with the original vue-avatar color palette. */
  useLegacyColors?: boolean;
  useTextColorForBorder?: boolean;
  gradient?: boolean;
  pointer?: boolean;
  onClick?: ((event: MouseEvent | KeyboardEvent) => void) | null;
  variant?: AvatarVariant;
  pixelTheme?: AvatarPixelTheme;
  autoContrast?: boolean;
}

export type AvatarEmits = {
  error: (event: Event) => void;
  activate: (event: MouseEvent | KeyboardEvent) => void;
  load: (event: Event) => void;
};

export interface AvatarImageSlotProps {
  src?: string;
  alt: string;
  size: number;
  style: CSSProperties;
}

export interface AvatarPlaceholderSlotProps {
  size: number;
  style: CSSProperties;
}

export interface AvatarSlots {
  image?: (props: AvatarImageSlotProps) => unknown;
  placeholder?: (props: AvatarPlaceholderSlotProps) => unknown;
  status?: () => unknown;
  overlay?: () => unknown;
}

export const Avatar: DefineComponent<AvatarProps, {}, {}, {}, {}, {}, {}, AvatarEmits> & {
  install: (app: import("vue").App, options?: { defaults?: Partial<AvatarProps> }) => void;
};

export interface AvatarGroupProps {
  max?: number;
  overlap?: number;
  borderColor?: string;
  size?: number;
  layout?: AvatarGroupLayout;
  onClick?: ((event: MouseEvent | KeyboardEvent) => void) | null;
  pointer?: boolean;
}

export type AvatarGroupEmits = {
  "overflow-click": (
    hiddenUsers: Record<string, unknown>[],
    allUsers: Record<string, unknown>[]
  ) => void;
};

export const AvatarGroup: DefineComponent<
  AvatarGroupProps,
  {},
  {},
  {},
  {},
  {},
  {},
  AvatarGroupEmits
>;

export const AvatarConfigKey: InjectionKey<Partial<AvatarProps & AvatarGroupProps>>;

export interface AvatarPluginOptions {
  defaults?: Partial<AvatarProps & AvatarGroupProps>;
}

declare const plugin: Plugin<[AvatarPluginOptions?]>;
export default plugin;
