import { STOP_X } from '../scene3/BusStop'
import { TABLE_X, TABLE_Z } from '../scene4/Cafe'
import { ALI5_X } from '../characters/AliLying'
import { ALI2_X } from '../characters/AliStanding'
import { PageSheet } from './PageSheet'

// The pages that lie in plain sight at the scenes themselves (Scene 1's is dropped
// by the gust; the ones between scenes live with whoever hides them).
export function ScenePages() {
  return (
    <>
      {/* Scene 2: blown against Ali's feet under the streetlight */}
      <PageSheet id="about" x={ALI2_X + 1.3} z={0.55} />
      {/* Scene 3: plastered to the bus-stop glass by the rain */}
      <PageSheet id="tejal" x={STOP_X + 1.5} y={1.3} z={-1.18} upright />
      {/* Scene 4: blown under the café table */}
      <PageSheet id="veherex" x={TABLE_X + 0.95} z={TABLE_Z + 0.65} />
      {/* Scene 5: on the promenade below the wall where Ali lies counting stars */}
      <PageSheet id="skills" x={ALI5_X + 1.6} z={0.2} />
      {/* Scene 6: by Ali's feet as he watches the sunrise */}
      <PageSheet id="contact" x={141.4} z={0.5} />
    </>
  )
}
