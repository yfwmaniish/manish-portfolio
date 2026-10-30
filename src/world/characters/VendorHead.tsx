import type { Material } from 'three'
import { toon } from '../materials'

export const SKIN = '#8A5A3C'
export const KURTA = '#E7E0D0'

/** The chai wala's head: round face, white Gandhi topi, grey temples, a proper moustache. */
export function VendorHead({ face }: { face: Material }) {
  return (
    <group>
      <mesh material={toon(SKIN)} scale={[1, 1.02, 0.96]}>
        <sphereGeometry args={[0.15, 14, 10]} />
      </mesh>
      <mesh material={face} position={[0, -0.01, 0.146]}>
        <planeGeometry args={[0.19, 0.166]} />
      </mesh>
      {/* the moustache stands out from the face a little */}
      <mesh material={toon('#2A2028')} position={[0, -0.035, 0.145]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.02, 0.09, 3, 6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={toon(SKIN)} position={[s * 0.148, -0.01, 0]} scale={[0.6, 1, 0.8]}>
            <sphereGeometry args={[0.035, 8, 6]} />
          </mesh>
          <mesh material={toon('#5A5060')} position={[s * 0.13, 0.05, -0.02]} scale={[0.5, 1, 1]}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
        </group>
      ))}
      {/* topi: a boat-shaped cap, longer front to back */}
      <mesh material={toon('#F7EAD7')} position={[0, 0.115, -0.005]} scale={[0.95, 0.55, 1.12]}>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={toon('#D8CBAC')} position={[0, 0.112, 0]} scale={[0.98, 1, 1.15]}>
        <cylinderGeometry args={[0.15, 0.15, 0.025, 14]} />
      </mesh>
    </group>
  )
}
