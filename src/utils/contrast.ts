/** Relative luminance of a hex colour (e.g. `#FF5733`), between 0 and 1. */
export function getLuminance(color: string): number {
  // Remove # if present
  const hex = color.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/** YIQ value of a hex colour: a cheaper stand-in for full luminance. */
export function getYIQ(color: string): number {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Black or white text, whichever reads better on `backgroundColor`. */
export function getContrastColor(
  backgroundColor: string | null | undefined,
  method: "luminance" | "yiq" = "yiq"
): string {
  if (!backgroundColor || !backgroundColor.startsWith("#")) {
    return "#FFFFFF"; // Default to white for invalid colors
  }

  if (method === "luminance") {
    const luminance = getLuminance(backgroundColor);
    // Threshold of 0.5 works well for most cases
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  } else {
    const yiq = getYIQ(backgroundColor);
    // YIQ threshold of 128 is standard
    return yiq >= 128 ? "#000000" : "#FFFFFF";
  }
}
