// Time of night. Everything here is a pure function of p (0 = 6:05 PM, 1 = 5:50 AM),
// using the same smoothstep curves as reference/prototype.dc.html.

export const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export interface TimeOfDay {
  p: number
  dawn: number
  night: number
  lights: number
  rain: number
}

export function timeOfDay(p: number): TimeOfDay {
  const dawn = ss(0.86, 1, p)
  const night = ss(0.1, 0.42, p) * (1 - dawn)
  const lights = ss(0.04, 0.26, p) * (1 - 0.75 * dawn)
  // Same smoothstep shape as the prototype, shifted so it's pouring by Scene 3
  // (9:40 PM) and has stopped by Scene 4 (11:50 PM, "The rain's stopped.").
  const rain = ss(0.31, 0.38, p) * (1 - ss(0.5, 0.56, p))
  return { p, dawn, night, lights, rain }
}

// The clock passes through each scene's time exactly at that scene's p (the
// prototype's thresholds and its scene times don't line up on a straight line).
// Minutes after midnight, running past 24h into the morning.
/** Where the sun sits across the sky (world units right of the camera): it sets right
 * of centre and comes up over open water, clear of the far towers. */
export const sunX = (t: TimeOfDay) => 52 - 34 * t.dawn

const CLOCK: [number, number][] = [
  [0, 18 * 60 + 5],
  [0.1, 18 * 60 + 30],
  [0.24, 20 * 60 + 5],
  [0.38, 21 * 60 + 40],
  [0.57, 23 * 60 + 50],
  [0.72, 26 * 60 + 10],
  [0.88, 29 * 60 + 48],
  [1, 29 * 60 + 50],
]

function minutesAt(p: number) {
  for (let i = 1; i < CLOCK.length; i++) {
    const [p1, m1] = CLOCK[i]
    if (p <= p1) {
      const [p0, m0] = CLOCK[i - 1]
      return m0 + ((Math.max(p, p0) - p0) / (p1 - p0)) * (m1 - m0)
    }
  }
  return CLOCK[CLOCK.length - 1][1]
}

export function clockLabel(p: number) {
  const m = Math.round(minutesAt(p)) % (24 * 60)
  const hh = Math.floor(m / 60)
  const mm = m % 60
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`
}
