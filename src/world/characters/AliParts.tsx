import type { RefObject } from 'react'
import type { Group, Material } from 'three'
import { toon } from '../materials'

// Manish, rounded and in visual-novel proportions (a big head, soft shoulders), built
// facing +z. After his photo: spiky black hair, silver glasses, a short beard, a
// lavender shirt, earbuds in. (Named Ali* after the template's character.)
export const SKIN = '#A06A48'
const HAIR = '#17101C'
const HAIR_HI = '#3A2C3E'
const HOODIE = '#B9A3E3'
const HOODIE_DARK = '#9A84CC'
const JEANS = '#2A2440'
const FRAME = '#CBD1DA'
const BEARD = '#1E141A'

/** Seat, thighs, and legs hanging over the sea side. */
export function Legs() {
  return (
    <group>
      <mesh material={toon(JEANS)} position={[0, 0.08, 0.06]} scale={[1.25, 0.7, 1]}>
        <sphereGeometry args={[0.15, 10, 8]} />
      </mesh>
      {[-0.085, 0.085].map((x) => (
        <group key={x}>
          <mesh material={toon(JEANS)} position={[x, 0.08, 0.2]} rotation-x={Math.PI / 2}>
            <capsuleGeometry args={[0.065, 0.2, 4, 8]} />
          </mesh>
          <mesh material={toon(JEANS)} position={[x, -0.14, 0.33]}>
            <capsuleGeometry args={[0.058, 0.3, 4, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Shirt: rounded torso, wide soft shoulders, a collar round the neck, a button line. */
export function Torso({ forearms, pose = 'typing' }: { forearms: RefObject<(Group | null)[]>; pose?: 'typing' | 'pockets' }) {
  return (
    <group>
      <mesh material={toon(HOODIE)} position={[0, 0.32, 0]} scale={[1.18, 1, 0.72]}>
        <capsuleGeometry args={[0.15, 0.2, 6, 12]} />
      </mesh>
      <mesh material={toon(HOODIE_DARK)} position={[0, 0.56, -0.025]} scale={[1, 0.38, 0.85]}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={toon(HOODIE)} position={[s * 0.045, 0.56, 0.075]} rotation={[0.5, 0, s * 0.9]}>
          <boxGeometry args={[0.07, 0.035, 0.012]} />
        </mesh>
      ))}
      <mesh material={toon(HOODIE_DARK)} position={[0, 0.33, 0.108]}>
        <boxGeometry args={[0.014, 0.3, 0.004]} />
      </mesh>
      {/* a seam down the back */}
      <mesh material={toon(HOODIE_DARK)} position={[0, 0.32, -0.112]}>
        <boxGeometry args={[0.018, 0.28, 0.004]} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <group key={side} position={[side * 0.2, 0.47, 0.02]} rotation={pose === 'typing' ? [-0.45, 0, side * 0.12] : [0.05, 0, side * 0.16]}>
          <mesh material={toon(HOODIE)} position={[0, -0.1, 0]}>
            <capsuleGeometry args={[0.05, 0.14, 4, 8]} />
          </mesh>
          <group ref={(f) => (forearms.current[i] = f)} position={[0, -0.21, 0]}>
            <mesh material={toon(HOODIE)} position={[0, -0.08, 0]}>
              <capsuleGeometry args={[0.045, 0.12, 4, 8]} />
            </mesh>
            <mesh material={toon(SKIN)} position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.038, 8, 6]} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh material={toon(SKIN)} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 8]} />
      </mesh>
    </group>
  )
}

// Manish's hair, after his photo: short at the sides, swept up into messy spikes on
// top. x, y, z (base, head-centred), length, tilt forward (+) / back (−), tilt sideways
const SPIKES: [number, number, number, number, number, number][] = [
  [0, 0.15, 0.08, 0.12, 0.45, 0],
  [0.06, 0.14, 0.07, 0.11, 0.35, -0.4],
  [-0.06, 0.14, 0.07, 0.11, 0.35, 0.4],
  [0.03, 0.17, 0.0, 0.13, 0.05, -0.2],
  [-0.035, 0.17, -0.01, 0.12, 0.0, 0.25],
  [0.1, 0.12, 0.0, 0.1, 0.05, -0.75],
  [-0.1, 0.12, 0.0, 0.1, 0.05, 0.75],
  [0.0, 0.14, -0.09, 0.1, -0.6, 0],
  [0.07, 0.11, -0.1, 0.09, -0.7, -0.45],
  [-0.07, 0.11, -0.1, 0.09, -0.7, 0.45],
  [0.03, 0.12, 0.12, 0.08, 0.8, -0.15],
]

export function Head({ face }: { face: Material }) {
  return (
    <group position={[0, 0.17, 0]}>
      <mesh material={toon(SKIN)} scale={[1, 1.04, 0.98]}>
        <sphereGeometry args={[0.16, 14, 10]} />
      </mesh>
      {/* the face, a hair's breadth in front of the skin */}
      <mesh material={face} position={[0, -0.02, 0.155]}>
        <planeGeometry args={[0.2, 0.175]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={toon(SKIN)} position={[s * 0.158, -0.01, 0.0]} scale={[0.6, 1, 0.8]}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </mesh>
      ))}
      {/* hair mass sits back and up so the face stays clear; short at the sides */}
      <mesh material={toon(HAIR)} position={[0, 0.045, -0.03]} scale={[1.04, 1, 1.02]}>
        <sphereGeometry args={[0.165, 14, 10]} />
      </mesh>
      <mesh material={toon(HAIR)} position={[0, 0.115, 0.075]} scale={[1.2, 0.55, 0.75]}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </mesh>
      {SPIKES.map(([x, y, z, len, rx, rz], i) => (
        <group key={i} position={[x, y, z]} rotation={[rx, 0, rz]}>
          <mesh material={toon(i % 4 === 0 ? HAIR_HI : HAIR)} position={[0, len / 2, 0]}>
            <coneGeometry args={[0.045, len, 6]} />
          </mesh>
        </group>
      ))}
      {/* a short beard round the jaw and chin */}
      <mesh material={toon(BEARD)} position={[0, -0.085, 0.045]} scale={[1.05, 0.62, 0.9]}>
        <sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} />
      </mesh>
      {/* silver rectangular glasses, temples back to the ears */}
      {[-1, 1].map((s) => (
        <group key={`g${s}`} position={[s * 0.05, -0.002, 0.163]}>
          <mesh material={toon(FRAME)} position={[0, 0.021, 0]}>
            <boxGeometry args={[0.064, 0.006, 0.006]} />
          </mesh>
          <mesh material={toon(FRAME)} position={[0, -0.021, 0]}>
            <boxGeometry args={[0.064, 0.006, 0.006]} />
          </mesh>
          {[-1, 1].map((e) => (
            <mesh key={e} material={toon(FRAME)} position={[e * 0.031, 0, 0]}>
              <boxGeometry args={[0.006, 0.048, 0.006]} />
            </mesh>
          ))}
          <mesh material={toon(FRAME)} position={[s * 0.06, 0.015, -0.075]} rotation-y={s * -1.25}>
            <boxGeometry args={[0.15, 0.005, 0.005]} />
          </mesh>
        </group>
      ))}
      <mesh material={toon(FRAME)} position={[0, 0.012, 0.165]}>
        <boxGeometry args={[0.036, 0.005, 0.005]} />
      </mesh>
      {/* earbuds */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} material={toon('#121016')} position={[s * 0.168, -0.015, 0.02]}>
          <sphereGeometry args={[0.019, 8, 6]} />
        </mesh>
      ))}
    </group>
  )
}

/** Standing: legs straight down from the hip (the root sits at hip height), trainers. */
export function StandingLegs() {
  return (
    <group>
      <mesh material={toon(JEANS)} position={[0, 0.04, 0]} scale={[1.2, 0.6, 0.8]}>
        <sphereGeometry args={[0.15, 10, 8]} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <group key={x}>
          <mesh material={toon(JEANS)} position={[x, -0.36, 0]}>
            <capsuleGeometry args={[0.065, 0.62, 4, 8]} />
          </mesh>
          <mesh material={toon('#F7EAD7')} position={[x, -0.76, 0.04]} scale={[1, 0.6, 1.5]}>
            <sphereGeometry args={[0.07, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
