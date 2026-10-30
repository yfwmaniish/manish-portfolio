import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/700.css'
import '@fontsource/silkscreen/400.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/400-italic.css'
import './index.css'
import { App } from './App'
import { initSave } from './engine/save'
import { initStory } from './engine/story'
import { MOODS } from './portraits/art'
import { warmPortraits } from './portraits/raster'
import { Fallback, hasWebGL } from './ui/Fallback'
import { PlainPage } from './ui/PlainPage'

// Restore progress before the first frame so the world starts as you left it.
initSave()
initStory()
warmPortraits(MOODS)

// The plain page: asked for (?plain), or the 3D world can't run here.
const plain = new URLSearchParams(location.search).has('plain')
const webgl = hasWebGL()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {plain || !webgl ? (
      <PlainPage reason={webgl ? undefined : "This browser can't show the 3D version, so here is the plain version."} />
    ) : (
      <Fallback>
        <App />
      </Fallback>
    )}
  </StrictMode>,
)
