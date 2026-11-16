// WCAG relative luminance and contrast from computed `rgb()` strings.
const channels = (css: string): [number, number, number] => {
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css);
  if (!m) throw new Error(`unexpected computed colour: ${css}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

const luminance = (css: string) => {
  const [r, g, b] = channels(css).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};
