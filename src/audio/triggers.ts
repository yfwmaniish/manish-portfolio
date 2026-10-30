import { on, type Cue } from '../engine/events'
import { usePhone } from '../phone/usePhone'
import { useStore, type Showing } from '../store/useStore'
import type { SoundName, SoundOpts } from './bus'

// What makes a sound, and which. Most of it is read off the store as things
// change, so the world and UI code don't need to know about audio at all. The
// few that need a moment the store can't see call sound() from bus.ts directly.

type Play = (name: SoundName, opts?: SoundOpts) => void

const CUES: Partial<Record<Cue, SoundName>> = { pour: 'pour', cash: 'coin', snap: 'shutter', whistle: 'whistle' }

const SHOWING: Partial<Record<Showing, SoundName>> = { roll: 'photo', notebook: 'page', stars: 'twinkle', ev: 'tap', scam: 'message' }

// Where the ones that stay put live, so their sounds pan and fade with distance
// (the snoring dog and the laughter club repeat while you're near).
const DOG_X = 116.2
const CLUB_X = 145.5

/** Speech bubbles over the easter-egg characters, by anchor id. */
function speechSound(id: string, text: string): [SoundName, SoundOpts?] | null {
  if (id === 'cop') return ['bell']
  if (id === 'dog') return [text.startsWith('z') ? 'snore' : 'huff', { x: DOG_X }]
  if (id === 'club') return ['laugh', { x: CLUB_X }]
  if (id === 'cat') return ['meow']
  if (id.startsWith('crow')) return ['caw']
  return null
}

export function initTriggers(play: Play) {
  for (const [cue, name] of Object.entries(CUES)) on(cue as Cue, () => play(name))

  useStore.subscribe((st, prev) => {
    // conversations
    if (!st.dialogue && prev.dialogue) play('back')
    if (st.showing && st.showing !== prev.showing) play(SHOWING[st.showing] ?? 'paperSlide')

    // the world
    if (st.catPets > prev.catPets) play('purr')
    if (st.flags.gave_pages && !prev.flags.gave_pages) play('page')
    if (st.pagesFound.length > prev.pagesFound.length) play('pageFound')
    if (st.openPage && !prev.openPage) play('page')
    if (st.flags.cat_follows && !prev.flags.cat_follows) play('meow')
    if (st.balloonsFreed > prev.balloonsFreed) play('balloon')
    if (st.umbrellaOpen !== prev.umbrellaOpen) play(st.umbrellaOpen ? 'umbrellaOpen' : 'umbrellaClose')
    if (st.openFlyer && !prev.openFlyer) play('paper')
    if (!st.openFlyer && prev.openFlyer) play('paperSlide')
    if (!st.openPage && prev.openPage) play('paperSlide')
    for (const [id, text] of Object.entries(st.speech)) {
      if (prev.speech[id] === text) continue
      const hit = speechSound(id, text)
      if (hit) play(...hit)
    }

    // the interface
    if (st.hovered && st.hovered.id !== prev.hovered?.id) play('hover')
    if (st.phoneOpen !== prev.phoneOpen) play(st.phoneOpen ? 'phone' : 'phoneClose')
    if (Object.keys(st.moments).length > Object.keys(prev.moments).length) play('chime')
    if (st.endingOpen && !prev.endingOpen) play('swell')
  })

  usePhone.subscribe((ph, prev) => {
    if (ph.shots > prev.shots) play('shutter')
    if (ph.app !== prev.app && useStore.getState().phoneOpen) play('tap')
    if (ph.log.length > prev.log.length) play(ph.log[ph.log.length - 1].me ? 'send' : 'message')
  })
}
