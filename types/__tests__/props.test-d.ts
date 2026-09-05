/**
 * Compile-only fixture: the declarations in `types/index.d.ts` are written by
 * hand against a plain-JS implementation, so nothing else proves they stay in
 * step with the real props. Every prop appears here at least once, which means
 * a typo or a removed prop fails `npm run typecheck`.
 *
 * This file is never executed and never shipped.
 */
import type {
  AvatarProps,
  AvatarGroupProps,
  AvatarTooltipProps,
  AvatarTooltipOptions,
  AvatarSlots,
  AvatarFallbackPayload,
  AvatarFileSelectPayload,
  AvatarPluginOptions,
  ComputePositionOptions,
  ComputePositionResult,
  UseTooltipOptions,
} from "vue3-avatar";

const everyProp: Required<AvatarProps> = {
  name: "John Doe",
  color: "#ffffff",
  background: "#000000",
  size: 40,
  dark: false,
  inline: false,
  rounded: true,
  shape: "circle",

  imageSrc: "https://example.com/a.png",
  alt: "John Doe",
  loading: "lazy",
  srcset: "a.png 1x, b.png 2x",
  sizes: "40px",
  crossorigin: "anonymous",
  referrerpolicy: "no-referrer",
  decoding: "async",
  retina: true,
  fallbackSrc: ["https://example.com/b.png"],
  skeleton: true,
  transition: true,

  border: true,
  borderColor: "white",
  customAvatarStyle: { opacity: 1 },

  status: "online",
  statusPosition: "bottom-right",
  customStatusStyle: { opacity: 1 },
  statusColor: "#22c55e",
  statusColors: { "in-meeting": "#7c3aed" },
  statusSize: "md",
  statusLabel: "Back at 3pm",
  statusPulse: true,

  badge: 3,
  badgeVariant: "count",
  badgeMax: 999,
  badgeMaxLength: 3,
  badgePosition: "top-right",
  badgeColor: "#ef4444",
  badgeTextColor: "#ffffff",
  badgeLabel: "3 unread",
  customBadgeStyle: { opacity: 1 },

  sameBorder: false,
  interactive: true,
  useLegacyColors: false,
  useTextColorForBorder: false,
  gradient: false,
  pointer: false,
  onClick: (event) => void event,
  variant: "initials",
  pixelTheme: "earth",
  autoContrast: true,

  tooltip: "Product Designer",
  tooltipPlacement: "top-start",
  tooltipTrigger: "hover focus",
  tooltipDelay: 200,
  tooltipHideDelay: 100,
  tooltipOffset: 8,
  tooltipArrow: true,
  tooltipTheme: "dark",
  tooltipInteractive: false,
  tooltipDisabled: false,
  nativeTitle: false,

  as: "button",
  href: "/users/john",
  target: "_blank",
  rel: "noopener noreferrer",
  disabled: false,
  selected: true,
  editable: true,
  accept: "image/*",
  editLabel: "Change picture",
};
void everyProp;

// A custom presence name is allowed alongside the four built-ins.
const customStatus: AvatarProps["status"] = "in-meeting";
void customStatus;

const objectTooltip: AvatarProps["tooltip"] = {
  content: "On leave",
  placement: "right-end",
  interactive: true,
} satisfies AvatarTooltipOptions;
void objectTooltip;

const disabledTooltip: AvatarProps["tooltip"] = false;
void disabledTooltip;

const groupProps: Required<AvatarGroupProps> = {
  max: 3,
  overlap: 10,
  borderColor: "white",
  size: 40,
  layout: "stack",
  onClick: null,
  pointer: false,
  overflowTooltip: true,
  tooltipPlacement: "bottom",
  tooltipTheme: "light",
  nativeTitle: false,
};
void groupProps;

const tooltipProps: Required<AvatarTooltipProps> = {
  open: true,
  reference: null,
  id: "tip-1",
  placement: "top",
  offset: 8,
  padding: 8,
  arrow: true,
  theme: "auto",
  interactive: false,
  maxWidth: 240,
};
void tooltipProps;

const slots: AvatarSlots = {
  image: ({ src, srcset, sizes, alt, size, style }) =>
    [src, srcset, sizes, alt, size, style],
  placeholder: ({ size, style }) => [size, style],
  status: () => null,
  overlay: () => null,
  tooltip: ({ nameValue, initials, status, imageSrc }) => [
    nameValue,
    initials,
    status,
    imageSrc,
  ],
  badge: () => null,
  "edit-overlay": () => null,
};
void slots;

const onFallback = (payload: AvatarFallbackPayload) =>
  [payload.failedSrc, payload.nextSrc, payload.remaining, payload.event] as const;
void onFallback;

const onFileSelect = (payload: AvatarFileSelectPayload) =>
  [payload.files, payload.event] as const;
void onFileSelect;

const pluginOptions: AvatarPluginOptions = {
  defaults: { size: 48, tooltipTheme: "light", statusColors: { away: "#f59e0b" } },
};
void pluginOptions;

const positionOptions: ComputePositionOptions = {
  placement: "bottom-end",
  offset: 8,
  padding: 8,
  boundary: { x: 0, y: 0, width: 1000, height: 800 },
  arrowSize: 8,
  flip: true,
  shift: true,
};
void positionOptions;

const positionResult: ComputePositionResult = {
  x: 0,
  y: 0,
  placement: "top",
  arrow: { x: 0, y: null },
};
void positionResult;

const tooltipOptions: UseTooltipOptions = {
  trigger: "click",
  openDelay: 0,
  closeDelay: 0,
  disabled: false,
  interactive: true,
};
void tooltipOptions;
