// The soundscape (Howler plus every generated sound) is its own chunk. It loads and
// renders while the title card is up, so pressing Start can begin it straight away,
// inside the click, which is what browsers need before they'll play anything.

type Soundscape = typeof import('./soundscape')

let loaded: Soundscape | null = null
let loading: Promise<Soundscape> | null = null
let wantStart = false

export function preloadAudio() {
  loading ??= import('./soundscape').then(async (m) => {
    await m.ready
    loaded = m
    if (wantStart) m.startSoundscape()
    return m
  })
  return loading
}

let started = false

export function startAudio() {
  if (started) return
  started = true
  if (loaded) loaded.startSoundscape()
  else {
    // Not ready yet: start when it is. Howler unlocks audio on the next tap if it must.
    wantStart = true
    void preloadAudio()
  }
}
