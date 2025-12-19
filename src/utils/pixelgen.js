/**
 * Generate a deterministic 8x8 pixel grid from a string
 * @param {string} str - Input string to hash
 * @returns {boolean[][]} - 8x8 grid of boolean values
 */
export function generatePixelGrid(str) {
  if (!str)
    return Array(8)
      .fill(null)
      .map(() => Array(8).fill(false));

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate symmetric 8x8 grid (mirror horizontally for better aesthetics)
  const grid = [];
  for (let y = 0; y < 8; y++) {
    const row = [];
    for (let x = 0; x < 4; x++) {
      // Use different parts of the hash for each position
      const bitIndex = (y * 4 + x) % 32;
      const bit = (Math.abs(hash) >> bitIndex) & 1;
      row.push(bit === 1);
    }
    // Mirror the row for symmetry
    grid.push([...row, ...row.reverse()]);
  }

  return grid;
}

/**
 * Color themes for pixel avatars
 */
export const PIXEL_THEMES = {
  earth: {
    background: "#8B7355",
    foreground: "#D4A574",
  },
  neon: {
    background: "#FF006E",
    foreground: "#00F5FF",
  },
  ocean: {
    background: "#006994",
    foreground: "#4FC3F7",
  },
  forest: {
    background: "#2D5016",
    foreground: "#7CB342",
  },
  sunset: {
    background: "#FF6B35",
    foreground: "#FFD23F",
  },
  midnight: {
    background: "#1A1A2E",
    foreground: "#16213E",
  },
  candy: {
    background: "#FF69B4",
    foreground: "#FFB6C1",
  },
  retro: {
    background: "#8B4513",
    foreground: "#DEB887",
  },
};

/**
 * Generate SVG for pixel avatar
 * @param {boolean[][]} grid - 8x8 boolean grid
 * @param {object} theme - Color theme with background and foreground
 * @param {number} size - Size of the avatar
 * @returns {string} - SVG string
 */
export function generatePixelSVG(grid, theme, size = 40) {
  const pixelSize = size / 8;
  const pixels = [];

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (grid[y][x]) {
        pixels.push(
          `<rect x="${x * pixelSize}" y="${
            y * pixelSize
          }" width="${pixelSize}" height="${pixelSize}" fill="${
            theme.foreground
          }"/>`
        );
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${theme.background}"/>
      ${pixels.join("\n      ")}
    </svg>
  `.trim();
}
