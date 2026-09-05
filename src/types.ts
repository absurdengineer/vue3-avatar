import type { CSSProperties } from "vue";

/**
 * Public type surface for vue3-avatar.
 *
 * This is the single source of truth: the components import from here, and the
 * shipped declarations are emitted from it. Nothing about the public API is
 * written twice.
 */

export type AvatarShape = "circle" | "square" | "squircle" | "hexagon";
export type AvatarStatus =
  | "away"
  | "online"
  | "offline"
  | "busy"
  | (string & {});
export type AvatarStatusPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";
export type AvatarBadgePosition = AvatarStatusPosition;
export type AvatarVariant = "initials" | "pixel";
export type AvatarLoading = "lazy" | "eager";
export type AvatarDecoding = "async" | "sync" | "auto";
export type AvatarCrossOrigin = "anonymous" | "use-credentials";
/** Mirrors the values the `referrerpolicy` attribute accepts. */
export type AvatarReferrerPolicy =
  | ""
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";
export type AvatarStatusSize = "sm" | "md" | "lg" | number;
export type AvatarBadgeVariant = "count" | "dot" | "icon";
export type AvatarAs = "div" | "button" | "a";
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

/** Colours keyed by status name; merged over the four built-in presences. */
export type AvatarStatusColors = Record<string, string>;

export type AvatarSide = "top" | "bottom" | "left" | "right";
export type AvatarTooltipPlacement =
  | AvatarSide
  | `${AvatarSide}-start`
  | `${AvatarSide}-end`;
export type AvatarTooltipTheme = "dark" | "light" | "auto";
/** Space-separated combination of "hover", "focus", "click" or "manual". */
export type AvatarTooltipTrigger = string;

export interface AvatarTooltipOptions {
  content?: string;
  placement?: AvatarTooltipPlacement;
  trigger?: AvatarTooltipTrigger;
  delay?: number;
  hideDelay?: number;
  offset?: number;
  arrow?: boolean;
  theme?: AvatarTooltipTheme;
  interactive?: boolean;
  disabled?: boolean;
}

/** Return shape of `getAvatarColors`. Legacy mode omits the modern fields. */
export interface AvatarColors {
  background: string;
  color: string;
  gradient?: string;
  light?: string;
  dark?: string;
}

/** A pixel-art palette. */
export interface PixelTheme {
  background: string;
  foreground: string;
}

export interface AvatarProps {
  name: string;
  color?: string;
  background?: string;
  size?: number;
  dark?: boolean;
  inline?: boolean;
  rounded?: boolean;
  shape?: AvatarShape;

  // Images
  imageSrc?: string;
  alt?: string;
  loading?: AvatarLoading;
  srcset?: string;
  sizes?: string;
  crossorigin?: AvatarCrossOrigin;
  referrerpolicy?: AvatarReferrerPolicy;
  decoding?: AvatarDecoding;
  /** Derives an `@2x` srcset from `imageSrc` when no explicit srcset is set. */
  retina?: boolean;
  /** Sources tried in order before falling back to initials or pixel art. */
  fallbackSrc?: string | string[];
  /** Placeholder shown while the image loads. Defaults to true. */
  skeleton?: boolean;
  transition?: boolean;

  border?: boolean;
  borderColor?: string;
  customAvatarStyle?: CSSProperties;

  // Status
  status?: AvatarStatus | null;
  statusPosition?: AvatarStatusPosition;
  customStatusStyle?: CSSProperties;
  statusColor?: string | null;
  statusColors?: AvatarStatusColors;
  statusSize?: AvatarStatusSize;
  /** Replaces "User is {status}" in the accessible label. */
  statusLabel?: string | null;
  statusPulse?: boolean;

  // Badge
  badge?: string | number | null;
  badgeVariant?: AvatarBadgeVariant;
  /** Counts above this render as "{max}+". Defaults to 999. */
  badgeMax?: number;
  /** Letters kept in a non-numeric badge. Defaults to 3. */
  badgeMaxLength?: number;
  badgePosition?: AvatarBadgePosition;
  badgeColor?: string | null;
  badgeTextColor?: string | null;
  badgeLabel?: string | null;
  customBadgeStyle?: CSSProperties;

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

  // Tooltip
  /** `undefined` uses `name`; `false` disables; an object supplies overrides. */
  tooltip?: string | boolean | AvatarTooltipOptions;
  tooltipPlacement?: AvatarTooltipPlacement;
  tooltipTrigger?: AvatarTooltipTrigger;
  tooltipDelay?: number;
  tooltipHideDelay?: number;
  tooltipOffset?: number;
  tooltipArrow?: boolean;
  tooltipTheme?: AvatarTooltipTheme;
  tooltipInteractive?: boolean;
  tooltipDisabled?: boolean;
  /** Restores the v4 behaviour of a native `title` attribute. */
  nativeTitle?: boolean;

  // Interaction
  as?: AvatarAs;
  href?: string | null;
  target?: string | null;
  rel?: string | null;
  disabled?: boolean;
  /** Opt-in toggle state; leave unset for avatars that are not toggles. */
  selected?: boolean | null;
  editable?: boolean;
  /** With `editable`, wires a hidden file input accepting these types. */
  accept?: string | null;
  editLabel?: string;
}

export interface AvatarFallbackPayload {
  failedSrc: string;
  nextSrc: string;
  remaining: number;
  event: Event;
}

export interface AvatarFileSelectPayload {
  files: FileList | null;
  event: Event;
}

export interface AvatarImageSlotProps {
  src?: string;
  srcset?: string | null;
  sizes?: string | null;
  alt: string;
  size: number;
  style: CSSProperties;
}

export interface AvatarPlaceholderSlotProps {
  size: number;
  style: CSSProperties;
}

export interface AvatarTooltipSlotProps {
  /** The avatar's `name`. Named `nameValue` to avoid clashing with the slot name. */
  nameValue: string;
  initials: string;
  status: AvatarStatus | null;
  imageSrc?: string;
}

export interface AvatarSlots {
  image?: (props: AvatarImageSlotProps) => unknown;
  placeholder?: (props: AvatarPlaceholderSlotProps) => unknown;
  status?: () => unknown;
  overlay?: () => unknown;
  tooltip?: (props: AvatarTooltipSlotProps) => unknown;
  badge?: () => unknown;
  "edit-overlay"?: () => unknown;
}

export interface AvatarTooltipProps {
  open?: boolean;
  reference?: HTMLElement | null;
  id?: string;
  placement?: AvatarTooltipPlacement;
  offset?: number;
  padding?: number;
  arrow?: boolean;
  theme?: AvatarTooltipTheme;
  interactive?: boolean;
  maxWidth?: number;
}

export interface AvatarGroupProps {
  max?: number;
  overlap?: number;
  borderColor?: string;
  size?: number;
  layout?: AvatarGroupLayout;
  onClick?: ((event: MouseEvent | KeyboardEvent) => void) | null;
  pointer?: boolean;
  /** Tooltip listing the hidden names on the "+N" badge. `false` disables it. */
  overflowTooltip?: boolean | string;
  tooltipPlacement?: AvatarTooltipPlacement;
  tooltipTheme?: AvatarTooltipTheme;
  /** Restores the v4 behaviour of native `title` attributes. */
  nativeTitle?: boolean;
}

export interface AvatarGroupOverflowTooltipSlotProps {
  hiddenUsers: Record<string, unknown>[];
  allUsers: Record<string, unknown>[];
  overflowCount: number;
  hiddenNames: string;
}

export interface AvatarGroupSlots {
  default?: () => unknown;
  "overflow-tooltip"?: (props: AvatarGroupOverflowTooltipSlotProps) => unknown;
}

export interface AvatarPluginOptions {
  defaults?: Partial<AvatarProps & AvatarGroupProps>;
}

// --- Positioning primitives -------------------------------------------------

export interface AvatarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputePositionOptions {
  placement?: AvatarTooltipPlacement;
  offset?: number;
  padding?: number;
  boundary?: AvatarRect | null;
  arrowSize?: number;
  flip?: boolean;
  shift?: boolean;
}

export interface ComputePositionResult {
  x: number;
  y: number;
  placement: AvatarTooltipPlacement;
  arrow: { x: number | null; y: number | null };
}

export interface UseTooltipOptions {
  trigger?: AvatarTooltipTrigger;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  interactive?: boolean;
}
