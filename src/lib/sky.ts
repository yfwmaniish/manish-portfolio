import { mixTimeCss, skyBandCss } from './skyColors'
import type { TimeOfDay } from './time'

/** The phone wallpaper: the sky outside, as the prototype's stepped bands over the sea. */
export function wallpaper(tod: TimeOfDay) {
  const b = [0, 2, 6, 8].map((i) => skyBandCss(i, tod))
  const sea = mixTimeCss('#1B2550', '#060A1C', '#3B4C7E', { ...tod, night: tod.night * 0.8 })
  return `linear-gradient(180deg, ${b[0]} 0 34%, ${b[1]} 34% 50%, ${b[2]} 50% 62%, ${b[3]} 62% 70%, ${sea} 70% 100%)`
}
/** Weather app copy, from the prototype's renderVals(). */
export function weather(t: TimeOfDay) {
  return {
    cond: t.rain > 0.3 ? 'Monsoon showers' : t.dawn > 0.4 ? 'Clear sunrise' : t.night > 0.5 ? 'Humid, clear night' : 'Golden hour, sea breeze',
    sea: t.rain > 0.3 ? 'Choppy' : 'Calm',
    sky: t.night > 0.5 ? 'Stars out' : t.dawn > 0.4 ? 'Turning gold' : t.rain > 0.3 ? 'Heavy cloud' : 'Pink and orange',
    ali: t.rain > 0.3 ? 'Hiding under an awning' : t.night > 0.6 ? 'Still reading logs' : t.dawn > 0.4 ? 'Finally going home' : 'On the sea wall',
  }
}
