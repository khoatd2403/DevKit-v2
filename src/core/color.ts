// core/color.ts

export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const sanitized = hex.replace(/^#/, '');
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0]! + sanitized[0], 16);
    const g = parseInt(sanitized[1]! + sanitized[1], 16);
    const b = parseInt(sanitized[2]! + sanitized[2], 16);
    return { r, g, b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
};
