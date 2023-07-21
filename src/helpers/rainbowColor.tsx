const tintFactor = 0.4 // Higher = closer to white

const lightenComponent = component => component + (1 - component) * tintFactor

const lightenColor = ({ r, g, b }) => ({
  r: lightenComponent(r),
  g: lightenComponent(g),
  b: lightenComponent(b),
})

const rgb2hex = ({ r, g, b }) =>
  '#' +
  [r, g, b]
    .map(x =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')

const hsl2rgb = (h, s, l) => {
  const f = (n, k = (n + h * 12) % 12) =>
    l - s * Math.min(l, 1 - l) * Math.max(Math.min(k - 3, 9 - k, 1), -1)

  return {
    r: f(0),
    g: f(8),
    b: f(4),
  }
}
// Magic numbers for color picker
// Minimum number of colors to pick: means that up to n=4, the first 4 colors will be the same
const MIN_COLORS = 5
// Saturation of the colors (for hsl; in [0,1])
const SATURATION = 0.75
// Lightness of the colors (for hsl; in [0,1])
const LIGHTNESS = 0.5
// Starting color angle (for hsl; in [0,1])
const STARTING_HUE = 2 / 3 // Blue

const numColors = n => Math.max(n, MIN_COLORS)

interface I {
  n?: number
  s?: number
  l?: number
  hMin?: number
  hMax?: number
  hStart?: number
}
export const rainbowColors = ({
  n = MIN_COLORS,
  s = SATURATION,
  l = LIGHTNESS,
  hMin,
  hMax,
  hStart = STARTING_HUE,
}: I) =>
  Array(numColors(n))
    .fill(null)
    .map((_, idx) => rainbowColor(idx, numColors(n), s, l, hMin, hMax, hStart))
    .slice(0, n)

export const rainbowColor = (i, n, s = 1, l = 0.5, hMin = 0, hMax = 1, hStart = hMin) => {
  const hRange = hMax - hMin
  const hStep = i / n
  const h = ((hStart + hStep * hRange) % hRange) + hMin

  const origColor = hsl2rgb(h, s, l)

  const lightColor = lightenColor(origColor)

  const origHex = rgb2hex(origColor)
  const lightHex = rgb2hex(lightColor)

  return [origHex, lightHex]
}
