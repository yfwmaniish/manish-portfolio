import type { TimeOfDay } from './time'

// Sky bands top → bottom, from the prototype's sky SVG. Kept free of three.js so the
// phone and HUD can use them without loading the 3D engine.
export const SKY_DUSK = ['#241A44', '#35204F', '#4E2A5E', '#6E3463', '#944063', '#BB5161', '#DD6A5C', '#F28C5A', '#FFB067']
export const SKY_NIGHT = ['#05040F', '#080719', '#0B0A21', '#0F0D29', '#141131', '#19153A', '#201A44', '#2A2050', '#35285C']
export const SKY_DAWN = ['#1C2752', '#2B3866', '#45507E', '#6A6590', '#967A9C', '#C6909C', '#E9A898', '#FBC29A', '#FFDCA8']

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const lerp = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)

/** Dusk → night → dawn, mixed in sRGB like the prototype's bandA(); returns a CSS colour. */
export function mixTimeCss(dusk: string, night: string, dawn: string, t: TimeOfDay) {
  const c = lerp(lerp(rgb(dusk), rgb(night), t.night), rgb(dawn), t.dawn)
  return `rgb(${c.map(Math.round).join(',')})`
}

export const skyBandCss = (i: number, t: TimeOfDay) => mixTimeCss(SKY_DUSK[i], SKY_NIGHT[i], SKY_DAWN[i], t)
