import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  CanvasTexture,
  InstancedMesh,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { ramp, toon } from './materials'
import { SEA_Y } from './Sea'

// Cross-section along z (camera looks toward -z, the sea):
//   sea < -2.0 · wall -2.0…-1.4 · promenade -1.4…3.0 · kerb · road 3.25…10
export const WALL_TOP = 0.75
export const WALL_FRONT_Z = -1.4
export const WALL_BACK_Z = -2.0
const PROM_FRONT_Z = 3.0
const ROAD_FAR_Z = 10
const X0 = -60
const X1 = 320
const LEN = X1 - X0
const MID = (X0 + X1) / 2

function tileTexture() {
  // Two-tone pavers with a dark grout line, 8×8 pixels per tile.
  const c = document.createElement('canvas')
  c.width = 16
  c.height = 16
  const g = c.getContext('2d')!
  const A = '#5A4D6E'
  const B = '#4E4262'
  for (let y = 0; y < 2; y++)
    for (let x = 0; x < 2; x++) {
      g.fillStyle = (x + y) % 2 ? A : B
      g.fillRect(x * 8, y * 8, 8, 8)
    }
  g.fillStyle = '#463B59'
  g.fillRect(0, 7, 16, 1)
  g.fillRect(0, 15, 16, 1)
  g.fillRect(7, 0, 1, 16)
  g.fillRect(15, 0, 1, 16)
  const t = new CanvasTexture(c)
  t.magFilter = NearestFilter
  t.minFilter = NearestFilter
  t.wrapS = t.wrapT = RepeatWrapping
  t.colorSpace = SRGBColorSpace
  return t
}

export function Promenade() {
  const paving = useMemo(() => {
    const t = tileTexture()
    const depth = PROM_FRONT_Z - WALL_FRONT_Z
    t.repeat.set(LEN / 0.8, depth / 0.8)
    return new MeshToonMaterial({ map: t, gradientMap: ramp })
  }, [])

  return (
    <group>
      {/* promenade */}
      <mesh material={paving} rotation-x={-Math.PI / 2} position={[MID, 0, (WALL_FRONT_Z + PROM_FRONT_Z) / 2]}>
        <planeGeometry args={[LEN, PROM_FRONT_Z - WALL_FRONT_Z]} />
      </mesh>

      {/* sea wall: body from the sea up to the coping, then the coping slab */}
      <mesh
        material={toon('#6A5C80')}
        position={[MID, (WALL_TOP - 0.08 + SEA_Y - 0.4) / 2, (WALL_FRONT_Z + WALL_BACK_Z) / 2]}
      >
        <boxGeometry args={[LEN, WALL_TOP - 0.08 - (SEA_Y - 0.4), WALL_FRONT_Z - WALL_BACK_Z]} />
      </mesh>
      <mesh material={toon('#9A8CB2')} position={[MID, WALL_TOP - 0.04, (WALL_FRONT_Z + WALL_BACK_Z) / 2]}>
        <boxGeometry args={[LEN, 0.08, WALL_FRONT_Z - WALL_BACK_Z + 0.12]} />
      </mesh>
      {/* a darker course along the wall face */}
      <mesh material={toon('#54476A')} position={[MID, 0.12, WALL_FRONT_Z + 0.005]}>
        <planeGeometry args={[LEN, 0.24]} />
      </mesh>

      <mesh material={toon('#463B59')} position={[MID, 0.34, WALL_FRONT_Z + 0.006]}>
        <planeGeometry args={[LEN, 0.04]} />
      </mesh>
      <WallJoints />

      {/* kerb */}
      <mesh material={toon('#C9B8D6')} position={[MID, 0.07, PROM_FRONT_Z + 0.12]}>
        <boxGeometry args={[LEN, 0.14, 0.25]} />
      </mesh>

      {/* road */}
      <mesh material={toon('#2C2639')} rotation-x={-Math.PI / 2} position={[MID, -0.02, (PROM_FRONT_Z + ROAD_FAR_Z) / 2 + 0.12]}>
        <planeGeometry args={[LEN, ROAD_FAR_Z - PROM_FRONT_Z]} />
      </mesh>
      <LaneDashes />
    </group>
  )
}

const LANES = [4.9, 6.6, 8.3]
const DASH_EVERY = 4

function LaneDashes() {
  const ref = useRef<InstancedMesh>(null)
  const count = LANES.length * Math.ceil(LEN / DASH_EVERY)
  useLayoutEffect(() => {
    const m = ref.current!
    const o = new Object3D()
    o.rotation.x = -Math.PI / 2
    let i = 0
    for (const z of LANES)
      for (let x = X0; x < X1 && i < count; x += DASH_EVERY) {
        o.position.set(x, -0.01, z)
        o.updateMatrix()
        m.setMatrixAt(i++, o.matrix)
      }
    m.count = i
    m.instanceMatrix.needsUpdate = true
  }, [count])
  return (
    <instancedMesh ref={ref} args={[undefined, toon('#B8AEC4'), count]} frustumCulled={false}>
      <planeGeometry args={[1.8, 0.08]} />
    </instancedMesh>
  )
}

const JOINT_EVERY = 1.8

/** Vertical mortar lines on the wall face, so it reads as stone blocks. */
function WallJoints() {
  const ref = useRef<InstancedMesh>(null)
  const count = Math.ceil(LEN / JOINT_EVERY)
  useLayoutEffect(() => {
    const m = ref.current!
    const o = new Object3D()
    for (let i = 0; i < count; i++) {
      // Stagger alternate joints between the two courses.
      o.position.set(X0 + i * JOINT_EVERY, i % 2 ? 0.5 : 0.18, WALL_FRONT_Z + 0.006)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [count])
  return (
    <instancedMesh ref={ref} args={[undefined, toon('#463B59'), count]} frustumCulled={false}>
      <planeGeometry args={[0.05, 0.3]} />
    </instancedMesh>
  )
}
