import { Color } from 'three'
import { SKY_DAWN, SKY_DUSK, SKY_NIGHT } from './skyColors'
import type { TimeOfDay } from './time'

export { SKY_DAWN, SKY_DUSK, SKY_NIGHT }
// Band heights in the prototype's 190-unit-tall sky, top → bottom.
export const SKY_BAND_HEIGHTS = [30, 25, 25, 25, 20, 20, 17, 15, 13]

const tmpA = new Color()
const tmpB = new Color()

/** Mix dusk → night → dawn the same way the prototype's bandA() does. */
export function mixTime(out: Color, dusk: string, night: string, dawn: string, t: TimeOfDay) {
  out.set(dusk).lerp(tmpA.set(night), t.night)
  return out.lerp(tmpB.set(dawn), t.dawn)
}

export function skyBand(out: Color, i: number, t: TimeOfDay) {
  return mixTime(out, SKY_DUSK[i], SKY_NIGHT[i], SKY_DAWN[i], t)
}

export const UI = {
  cream: '#F7EAD7',
  ink: '#1E1630',
  night: '#14122B',
  accent: '#FF8A4C',
  lamp: '#FFC56B',
  lampHot: '#FFE3A8',
  teal: '#7FD1C7',
  shadow: '#0A0918',
}
