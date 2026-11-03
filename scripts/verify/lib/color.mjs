// Chrome serialises colours built with Tailwind's `--alpha()` / `color-mix()` as `oklab(L a b / A)`, while Figma reports `rgba(r,g,b,a)`. `rgba()` turns either form into "rgb(r, g, b)" or "rgba(r, g, b, a)" (channels rounded, alpha to two decimals), so a spec compares a computed colour with the Figma value as strings.

/** @param {number} c a linear-light channel */
const gamma = (c) =>
  Math.round(
    255 *
      Math.min(
        1,
        Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
      )
  );

/**
 * @param {number} L lightness
 * @param {number} a green-red axis
 * @param {number} b blue-yellow axis
 */
function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** @param {string} value a computed CSS colour */
export function rgba(value) {
  const nums = (value.match(/-?[\d.]+(e-?\d+)?/gi) ?? []).map(Number);
  let rgb;
  let alpha = 1;
  if (value.startsWith("oklab")) {
    rgb = oklabToRgb(nums[0], nums[1], nums[2]);
    alpha = nums[3] ?? 1;
  } else if (value.startsWith("rgb")) {
    rgb = nums.slice(0, 3).map(Math.round);
    alpha = nums[3] ?? 1;
  } else {
    return value;
  }
  const a = Math.round(alpha * 100) / 100;
  return a === 1 ? `rgb(${rgb.join(", ")})` : `rgba(${rgb.join(", ")}, ${a})`;
}
