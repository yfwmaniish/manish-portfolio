import type { RefObject } from 'react'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { toon } from '../materials'

// The promenade indie: a lean black street dog with tall pointed ears and a tail
// that curls up over its back, like Manish's own. (File and rig names are the
// template's, from when it was a cat.)
export const FUR = '#1A1520'
const FUR_HI = '#2E2638'
const MUZZLE = '#241E2C'
const NOSE = '#050408'

/** Handles the animation code reaches into. */
export interface CatRig {
  head: RefObject<Group | null>
  earL: RefObject<Group | null>
  earR: RefObject<Group | null>
  eyes: RefObject<(Mesh | null)[]>
  tail: RefObject<(Group | null)[]>
  legs: RefObject<(Group | null)[]>
}

/** Sitting up, facing -x: haunches, an upright chest, long front legs, head held high. */
export function SitPose({ rig, eyeMat }: { rig: CatRig; eyeMat: MeshBasicMaterial }) {
  return (
    <group>
      <mesh material={toon(FUR)} position={[0.06, 0.1, 0]} scale={[1.1, 0.85, 0.95]}>
        <sphereGeometry args={[0.12, 12, 8]} />
      </mesh>
      <mesh material={toon(FUR)} position={[-0.04, 0.23, 0]} rotation-z={-0.32}>
        <capsuleGeometry args={[0.068, 0.16, 4, 10]} />
      </mesh>
      <mesh material={toon(FUR_HI)} position={[-0.1, 0.22, 0]} scale={[0.45, 1, 0.75]}>
        <sphereGeometry args={[0.055, 8, 6]} />
      </mesh>
      {[-0.04, 0.04].map((lz) => (
        <group key={lz}>
          <mesh material={toon(FUR)} position={[-0.1, 0.09, lz]}>
            <capsuleGeometry args={[0.021, 0.15, 3, 6]} />
          </mesh>
          <mesh material={toon(FUR)} position={[-0.115, 0.012, lz]} scale={[1.5, 0.7, 1]}>
            <sphereGeometry args={[0.022, 6, 4]} />
          </mesh>
        </group>
      ))}
      <group position={[0.16, 0.08, 0]}>
        <TailSegment index={0} refs={rig.tail} />
      </group>
      <group ref={rig.head} position={[-0.09, 0.4, 0]}>
        <DogHead rig={rig} eyeMat={eyeMat} />
      </group>
    </group>
  )
}

/** Trotting, facing -x: a lean body, four long legs, the tail curled up. */
export function WalkPose({ legs, eyeMat }: { legs: RefObject<(Group | null)[]>; eyeMat: MeshBasicMaterial }) {
  return (
    <group>
      <mesh material={toon(FUR)} position={[0, 0.25, 0]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.068, 0.24, 4, 10]} />
      </mesh>
      {[
        [-0.13, -0.045],
        [-0.13, 0.045],
        [0.13, -0.045],
        [0.13, 0.045],
      ].map(([lx, lz], i) => (
        <group key={i} ref={(g) => (legs.current[i] = g)} position={[lx, 0.2, lz]}>
          <mesh material={toon(FUR)} position={[0, -0.1, 0]}>
            <capsuleGeometry args={[0.022, 0.16, 3, 6]} />
          </mesh>
        </group>
      ))}
      <mesh material={toon(FUR)} position={[0.21, 0.36, 0]} rotation-z={0.5}>
        <torusGeometry args={[0.05, 0.018, 6, 10, Math.PI * 1.4]} />
      </mesh>
      <group position={[-0.22, 0.36, 0]} rotation-y={0.4}>
        <DogHead eyeMat={eyeMat} />
      </group>
    </group>
  )
}

function DogHead({ rig, eyeMat }: { rig?: CatRig; eyeMat: MeshBasicMaterial }) {
  return (
    <>
      <mesh material={toon(FUR)} scale={[1.05, 0.9, 0.95]}>
        <sphereGeometry args={[0.075, 12, 10]} />
      </mesh>
      {/* the long snout, and a shiny black nose */}
      <mesh material={toon(MUZZLE)} position={[-0.08, -0.025, 0]} rotation-z={Math.PI / 2 + 0.15} scale={[1, 1, 0.9]}>
        <capsuleGeometry args={[0.033, 0.06, 4, 8]} />
      </mesh>
      <mesh material={toon(NOSE)} position={[-0.135, -0.012, 0]}>
        <sphereGeometry args={[0.014, 6, 4]} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <mesh
          key={side}
          ref={rig ? (m) => (rig.eyes.current[i] = m) : undefined}
          material={eyeMat}
          position={[-0.058, 0.02, side * 0.034]}
          scale={[0.4, 1, 1]}
        >
          <sphereGeometry args={[0.014, 8, 6]} />
        </mesh>
      ))}
      {/* tall pointed ears, a little apart */}
      {[-1, 1].map((side) => (
        <group key={side} ref={rig ? (side < 0 ? rig.earL : rig.earR) : undefined} position={[0.01, 0.055, side * 0.04]} rotation-x={side * 0.18}>
          <mesh material={toon(FUR)} position={[0, 0.045, 0]}>
            <coneGeometry args={[0.03, 0.1, 4]} />
          </mesh>
          <mesh material={toon('#4A2E3E')} position={[-0.01, 0.04, 0]} scale={[0.4, 1, 0.6]}>
            <coneGeometry args={[0.02, 0.07, 4]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function TailSegment({ index, refs }: { index: number; refs: RefObject<(Group | null)[]> }) {
  return (
    <group ref={(g) => (refs.current[index] = g)} rotation-z={0.35}>
      <mesh material={toon(index === 4 ? FUR_HI : FUR)} position={[0.01, 0.035, 0]}>
        <capsuleGeometry args={[0.02 - index * 0.002, 0.05, 3, 6]} />
      </mesh>
      {index < 4 && (
        <group position={[0.01, 0.07, 0]}>
          <TailSegment index={index + 1} refs={refs} />
        </group>
      )}
    </group>
  )
}
