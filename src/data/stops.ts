import { BHUTTA_X, FISHER_X, JUMP_PUDDLE, KID_X, NEWS_X, OLD_COUPLE_X, PHOTOGRAPHER_X, TAXI_X } from './places'
import { SCENES } from './scenes'

// Every place along the walk worth stopping at, in order: the six scenes and the
// people in between. The "Walk on" button glides you from one to the next, so
// nobody has to scroll their way through the night.

export interface Stop {
  x: number
  label: string
  /** Set for the six scenes. */
  scene?: number
}

const sceneStops: Stop[] = SCENES.map((s, i) => ({ x: s.x, label: s.title, scene: i + 1 }))

export const STOPS: Stop[] = [
  ...sceneStops,
  { x: BHUTTA_X, label: 'The corn seller' },
  { x: KID_X, label: 'The bubble kid' },
  { x: OLD_COUPLE_X, label: 'The old couple' },
  { x: PHOTOGRAPHER_X + 1, label: 'The photographer and the old lamp' },
  { x: 63, label: 'The paper boat' },
  { x: JUMP_PUDDLE[0], label: 'A big puddle' },
  { x: TAXI_X, label: 'The taxi' },
  { x: FISHER_X, label: 'The fisherman' },
  { x: NEWS_X, label: 'The newspaper man' },
].sort((a, b) => a.x - b.x)

/** The next stop ahead of x, or null at the end of the walk. */
export const nextStop = (x: number) => STOPS.find((s) => s.x > x + 2.5) ?? null

/** The stop behind x, or null at the start. */
export const prevStop = (x: number) => [...STOPS].reverse().find((s) => s.x < x - 2.5) ?? null
