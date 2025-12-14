const lightColors = [
  "#F0F8FF",
  "#FAEBD7",
  "#00FFFF",
  "#7FFFD4",
  "#F0FFFF",
  "#F5F5DC",
  "#FFE4C4",
  "#FFEBCD",
  "#DEB887",
  "#5F9EA0",
  "#7FFF00",
  "#D2691E",
  "#FF7F50",
  "#6495ED",
  "#FFF8DC",
  "#00FFFF",
  "#B8860B",
  "#A9A9A9",
  "#A9A9A9",
  "#BDB76B",
  "#FF8C00",
  "#E9967A",
  "#8FBC8F",
  "#00CED1",
  "#FF1493",
  "#00BFFF",
  "#1E90FF",
  "#FFFAF0",
  "#FF00FF",
  "#DCDCDC",
  "#F8F8FF",
  "#FFD700",
  "#DAA520",
  "#808080",
  "#808080",
  "#ADFF2F",
  "#F0FFF0",
  "#FF69B4",
  "#CD5C5C",
  "#FFFFF0",
  "#F0E68C",
  "#E6E6FA",
  "#FFF0F5",
  "#7CFC00",
  "#FFFACD",
  "#ADD8E6",
  "#F08080",
  "#E0FFFF",
  "#FAFAD2",
  "#D3D3D3",
  "#D3D3D3",
  "#90EE90",
  "#FFB6C1",
  "#FFA07A",
  "#20B2AA",
  "#87CEFA",
  "#B0C4DE",
  "#FFFFE0",
  "#00FF00",
  "#32CD32",
  "#FAF0E6",
  "#FF00FF",
  "#66CDAA",
  "#BA55D3",
  "#9370D8",
  "#3CB371",
  "#7B68EE",
  "#00FA9A",
  "#48D1CC",
  "#F5FFFA",
  "#FFE4E1",
  "#FFE4B5",
  "#FFDEAD",
  "#FDF5E6",
  "#FFA500",
  "#FF4500",
  "#DA70D6",
  "#EEE8AA",
  "#98FB98",
  "#AFEEEE",
  "#D87093",
  "#FFEFD5",
  "#FFDAB9",
  "#CD853F",
  "#FFC0CB",
  "#DDA0DD",
  "#B0E0E6",
  "#FF0000",
  "#BC8F8F",
  "#FA8072",
  "#F4A460",
  "#FFF5EE",
  "#C0C0C0",
  "#87CEEB",
  "#FFFAFA",
  "#00FF7F",
  "#D2B48C",
  "#D8BFD8",
  "#FF6347",
  "#40E0D0",
  "#EE82EE",
  "#F5DEB3",
  "#FFFFFF",
  "#F5F5F5",
  "#FFFF00",
  "#9ACD32",
];

const darkColors = [
  "#000000",
  "#0000FF",
  "#8A2BE2",
  "#A52A2A",
  "#DC143C",
  "#00008B",
  "#008B8B",
  "#006400",
  "#8B008B",
  "#556B2F",
  "#9932CC",
  "#8B0000",
  "#483D8B",
  "#2F4F4F",
  "#2F4F4F",
  "#9400D3",
  "#696969",
  "#696969",
  "#B22222",
  "#228B22",
  "#008000",
  "#4B0082",
  "#800000",
  "#0000CD",
  "#C71585",
  "#191970",
  "#000080",
  "#808000",
  "#6B8E23",
  "#800080",
  "#4169E1",
  "#8B4513",
  "#2E8B57",
  "#A0522D",
  "#6A5ACD",
  "#708090",
  "#708090",
  "#4682B4",
  "#008080",
];

const legacyBackgroundColors = [
  '#F44336', '#FF4081', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B',
];

function getAsciiValue(name) {
  if (!name) return 0;
  const username = name.trim();
  let ascii = 0;
  for (let index = 0; index < username.length; index++)
    ascii += username.charCodeAt(index);
  return ascii;
}

function lightenColor(hex, amt) {
  if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
    return '#FFFFFF';
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, r + amt);
  const newG = Math.min(255, g + amt);
  const newB = Math.min(255, b + amt);

  const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export function getAvatarColors(name, useLegacyColors = false) {
  const ascii = getAsciiValue(name);

  if (useLegacyColors) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('vue3-avatar: useLegacyColors is deprecated and will be removed in a future version.');
    }
    
    let backgroundColor = legacyBackgroundColors[0];
    if (name && typeof name === 'string') {
        const index = (name.length || 0) % legacyBackgroundColors.length;
        backgroundColor = legacyBackgroundColors[index];
    }
    
    const color = lightenColor(backgroundColor, 80);
    return { background: backgroundColor, color };
  }

  // Modern logic
  const darkColor = darkColors[ascii % darkColors.length];
  const lightColor = lightColors[ascii % lightColors.length];

  // Default: Dark Background, Light Text
  return {
    background: darkColor,
    color: lightColor,
    // We also expose the pair if needed for inversion
    light: lightColor,
    dark: darkColor
  };
}
