// The night's route along the promenade. Each scene sits at a spot (world x) and an
// hour; walking between spots moves the clock. `p` values are the prototype's scene
// thresholds, so the sky curves (lights, rain, dawn) land on the right scenes —
// except Scene 6, set later so the sun is actually up (the clock still reads ~5:49).

export interface Scene {
  id: string
  num: string
  title: string
  time: string
  /** Map-app name, from the prototype's pinDefs. */
  place: string
  x: number
  p: number
  built: boolean
}

export const SCENES: Scene[] = [
  { id: 'promenade', num: '01', title: 'The promenade', time: '6:30 PM', place: 'The promenade', x: 0, p: 0.1, built: true },
  { id: 'whos-there', num: '02', title: "Who's there", time: '8:05 PM', place: 'Under the streetlight', x: 28, p: 0.24, built: true },
  { id: 'rain', num: '03', title: 'Rain', time: '9:40 PM', place: 'The awning', x: 56, p: 0.38, built: true },
  { id: 'notebook', num: '04', title: 'The notebook', time: '11:50 PM', place: 'Irani café', x: 84, p: 0.57, built: true },
  { id: 'constellations', num: '05', title: 'Constellations', time: '2:10 AM', place: 'The sea wall', x: 112, p: 0.72, built: true },
  { id: 'first-light', num: '06', title: 'First light', time: '5:48 AM', place: 'The sea link', x: 140, p: 0.96, built: true },
]

/** You can walk this far: a little past the last scene that exists so far. */
export const WALK_END = Math.max(...SCENES.filter((s) => s.built).map((s) => s.x)) + 10

/** Where the walk starts (the gate), and the last stretch after the final scene. */
const ROUTE: [number, number][] = [[-8, 0.04], ...SCENES.map((s) => [s.x, s.p] as [number, number]), [150, 0.99]]

/** Time of night at a point on the promenade: straight lines between the spots. */
export function pAt(x: number) {
  if (x <= ROUTE[0][0]) return ROUTE[0][1]
  for (let i = 1; i < ROUTE.length; i++) {
    const [x1, p1] = ROUTE[i]
    if (x <= x1) {
      const [x0, p0] = ROUTE[i - 1]
      return p0 + ((x - x0) / (x1 - x0)) * (p1 - p0)
    }
  }
  return ROUTE[ROUTE.length - 1][1]
}

/** The scene you're nearest to. */
export function sceneAt(x: number) {
  return SCENES.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a))
}
