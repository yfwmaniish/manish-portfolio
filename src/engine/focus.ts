import type { Focus } from '../store/useStore'
import { frame } from '../world/frame'

/** Where the camera stands for each close-up. Same viewing angle as the walk, just nearer. */
/** `pitch` tips the camera up (radians) — only the night sky needs it. */
export function focusCamera(f: Focus): { x: number; y: number; z: number; pitch?: number } {
  switch (f) {
    case 'ali':
      return { x: 0.35, y: 1.75, z: 5.2 }
    case 'laptop':
      // over his right shoulder, close enough to read the screen
      return { x: 0.42, y: 1.25, z: -0.2 }
    case 'vendor':
      return { x: -4.3, y: 1.9, z: 4.6 }
    case 'ali2':
      return { x: 28.6, y: 1.8, z: 5.6 }
    case 'ali3':
      return { x: 56.2, y: 1.7, z: 5.2 }
    case 'ali4':
      return { x: 84.2, y: 1.6, z: 4.8 }
    case 'ali5':
      return { x: 112.2, y: 1.8, z: 5.4 }
    case 'sky':
      // lying back on the wall, looking up
      // between two lamps, so none pokes into the view
      return { x: 108, y: 1.4, z: 4, pitch: 0.5 }
    case 'ali6':
      return { x: 140.3, y: 1.8, z: 5.6 }
    case 'cat':
      return { x: frame.catX + 0.1, y: 1.3, z: 2.2 }
  }
}
