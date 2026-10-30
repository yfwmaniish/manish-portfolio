import { timeOfDay, type TimeOfDay } from '../lib/time'

// Per-frame world state, written once at the top of each frame by <FrameDriver/>
// and read by every world component inside useFrame. Kept outside React on purpose:
// it changes every frame and nothing in the DOM needs to re-render for it.
export const frame = {
  tod: timeOfDay(0) as TimeOfDay,
  /** Camera x as rendered (snapped to the pixel grid). Far layers follow this. */
  camX: 0,
  /** Walking speed, world units per second. */
  speed: 0,
  time: 0,
  /** One world pixel as a fraction of screen height (set by the pixel pipeline). */
  envPixelPx: 1 / 320,
  /** Where the cat is right now (it can follow you). */
  catX: 3.2,
  /** The camera has moved in for a conversation. */
  closeUp: false,
}

/**
 * During a close-up, would someone standing here be in the camera's way? People
 * who walk or ride about step out of shot rather than fill the screen.
 */
export function blocksCloseUp(x: number, z: number) {
  return frame.closeUp && Math.abs(x - frame.camX) < 2.2 && z > -0.1
}

// Render layers. ENV is drawn coarse, CHAR is drawn at twice the pixel density
// (Until Then's trick), FX are glows that should not hide characters.
export const LAYER_ENV = 0
export const LAYER_CHAR = 1
export const LAYER_FX = 2
// Invisible hit shapes for clicking: raycast against, never drawn.
export const LAYER_HIT = 3
