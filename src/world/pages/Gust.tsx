import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group, MeshToonMaterial, Vector3 } from 'three'
import { sound } from '../../audio/bus'
import { FIRST_PAGE_X } from '../../data/places'
import { useAnchor } from '../../engine/anchors'
import { useStore } from '../../store/useStore'
import { CharLayer } from '../characters/shared'
import { ALI_X } from '../characters/Ali'
import { frame } from '../frame'
import { WALL_TOP } from '../Promenade'
import { PageSheet } from './PageSheet'
import { ramp } from '../materials'

// The night's hook: a few seconds after you arrive, a gust off the sea lifts the
// loose pages out of Ali's notebook and scatters them down the promenade. One lands
// at your feet; the rest are out there somewhere, for you to find.

const LAPTOP: [number, number, number] = [ALI_X + 0.35, WALL_TOP + 0.45, -1.6]
const DELAY = 3.2
const FLY = 4.5
// DRAFT line, Ali to approve.
const CRY = 'No no no — my notes!'

const sheetMat = new MeshToonMaterial({ color: '#FBF3E4', gradientMap: ramp, side: DoubleSide })

// Each sheet's path: how far right, how high, how fast it spins.
const SHEETS = [
  { dx: 22, dy: 3.2, dz: 1.5, spin: 5 },
  { dx: 15, dy: 4.5, dz: -1, spin: 7 },
  { dx: 27, dy: 2.4, dz: 2.6, spin: 4 },
  { dx: 11, dy: 5.2, dz: 0.4, spin: 8 },
  { dx: 19, dy: 1.6, dz: 3.2, spin: 6 },
  { dx: 30, dy: 3.8, dz: -0.6, spin: 5.5 },
]

export function Gust() {
  const done = useStore((s) => s.gustDone)
  const started = useStore((s) => s.started)
  const startedAt = useRef<number | null>(null)
  const blewAt = useRef<number | null>(null)
  const sheets = useRef<(Group | null)[]>([])
  const cryAt = useMemo(() => new Vector3(ALI_X, WALL_TOP + 1.45, -1.72), [])
  useAnchor('say-gust', () => cryAt)

  // Seen it before (a saved night)? Then the pages are already out there.
  useEffect(() => {
    if (done) blewAt.current = -Infinity
  }, [])

  useFrame(() => {
    if (!started || blewAt.current === -Infinity) return
    startedAt.current ??= frame.time
    const st = useStore.getState()
    if (blewAt.current === null) {
      // wait for the chapter card, and don't interrupt a conversation
      if (frame.time - startedAt.current < DELAY || st.dialogue || st.phoneOpen) return
      blewAt.current = frame.time
      sound('gust')
      sound('paper')
      st.say('gust', CRY, 2600)
      useStore.setState({ gustDone: true })
    }
    const t = (frame.time - blewAt.current) / FLY
    sheets.current.forEach((g, i) => {
      if (!g) return
      const s = SHEETS[i]
      g.visible = t < 1
      if (t >= 1) return
      const k = t + i * 0.02
      g.position.set(LAPTOP[0] + s.dx * k * k, LAPTOP[1] + s.dy * Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) + Math.sin(k * 14 + i) * 0.2, LAPTOP[2] + s.dz * k)
      g.rotation.set(k * s.spin, k * s.spin * 0.7, Math.sin(k * 9 + i) * 0.8)
    })
  })

  return (
    <>
      <CharLayer>
        {SHEETS.map((_, i) => (
          <group key={i} ref={(g) => (sheets.current[i] = g)} visible={false}>
            <mesh material={sheetMat}>
              <planeGeometry args={[0.24, 0.3]} />
            </mesh>
          </group>
        ))}
      </CharLayer>
      {/* the one that lands near you */}
      <PageSheet id="scan" x={FIRST_PAGE_X} z={0.7} show={done} from={[LAPTOP[0], LAPTOP[1] + 0.8, LAPTOP[2] + 0.5]} />
    </>
  )
}
