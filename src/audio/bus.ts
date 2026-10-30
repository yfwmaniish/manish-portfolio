// The one door to the soundscape from the rest of the app. It lives in the main
// bundle and does nothing until the (lazy) soundscape plugs itself in at Start.

export type SoundName = keyof typeof import('./sfx') | keyof typeof import('./uiSfx')

export interface SoundOpts {
  /** World x it comes from: pans and fades with distance from the camera. */
  x?: number
  rate?: number
  /** Speaker name, so dialogue sounds pitch per voice. */
  voice?: string | null
}

type Player = (name: SoundName, opts?: SoundOpts) => void

let player: Player | null = null

export const sound: Player = (name, opts) => player?.(name, opts)

export function setSoundPlayer(p: Player) {
  player = p
}
