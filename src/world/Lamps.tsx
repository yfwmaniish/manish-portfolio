import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PointLight,
  ShaderMaterial,
} from 'three'
import { frame, LAYER_FX } from './frame'
import { toon } from './materials'
import { WALL_FRONT_Z } from './Promenade'

const SPACING = 12
const FIRST_X = -54
const COUNT = 32
const POLE_H = 3.6
const LAMP_Z = WALL_FRONT_Z + 0.35
const ARM = 0.9
/** Where each lamp's head hangs (x is per lamp). */
export const HEAD = { x: 0, y: POLE_H - 0.05, z: LAMP_Z + ARM }
const NEAR_LIGHTS = 4

export const lampX = (i: number) => FIRST_X + i * SPACING

// Soft light in hard steps: radial falloff snapped to four rings.
function bandedGlow(color: string, rings: number) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uColor: { value: new Color(color) }, uStrength: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = floor((1.0 - clamp(r, 0.0, 1.0)) * ${rings.toFixed(1)}) / ${rings.toFixed(1)};
        gl_FragColor = vec4(uColor * a * a * uStrength, 1.0);
      }
    `,
  })
}

function useInstances(ref: RefObject<InstancedMesh | null>, place: (o: Object3D, i: number) => void) {
  useLayoutEffect(() => {
    const m = ref.current!
    const o = new Object3D()
    for (let i = 0; i < COUNT; i++) {
      o.position.set(0, 0, 0)
      o.rotation.set(0, 0, 0)
      o.scale.set(1, 1, 1)
      place(o, i)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [ref, place])
}

export function Lamps() {
  const poles = useRef<InstancedMesh>(null)
  const arms = useRef<InstancedMesh>(null)
  const heads = useRef<InstancedMesh>(null)
  const bulbs = useRef<InstancedMesh>(null)
  const halos = useRef<InstancedMesh>(null)
  const pools = useRef<InstancedMesh>(null)
  const lights = useRef<(PointLight | null)[]>([])

  const mats = useMemo(
    () => ({
      bulb: new MeshBasicMaterial({ color: '#3A3048' }),
      halo: bandedGlow('#FFC56B', 4),
      pool: bandedGlow('#FFB067', 4),
    }),
    [],
  )

  useInstances(poles, (o, i) => o.position.set(lampX(i), POLE_H / 2, LAMP_Z))
  useInstances(arms, (o, i) => o.position.set(lampX(i), POLE_H, LAMP_Z + ARM / 2))
  useInstances(heads, (o, i) => o.position.set(lampX(i), HEAD.y, HEAD.z))
  useInstances(bulbs, (o, i) => o.position.set(lampX(i), HEAD.y - 0.09, HEAD.z))
  useInstances(halos, (o, i) => o.position.set(lampX(i), HEAD.y - 0.1, HEAD.z + 0.05))
  useInstances(pools, (o, i) => {
    o.position.set(lampX(i), 0.015, HEAD.z + 0.3)
    o.rotation.x = -Math.PI / 2
  })

  const lit = useMemo(() => new Color('#FFE3A8'), [])
  const off = useMemo(() => new Color('#3A3048'), [])

  useFrame(() => {
    const L = frame.tod.lights
    mats.bulb.color.copy(off).lerp(lit, L)
    mats.halo.uniforms.uStrength.value = L * 0.45
    mats.pool.uniforms.uStrength.value = L * 0.35

    // Real lights only for the lamps around the camera.
    const nearest = Math.round((frame.camX - FIRST_X) / SPACING)
    lights.current.forEach((light, k) => {
      if (!light) return
      const i = nearest - 1 + k
      light.position.set(lampX(i), HEAD.y - 0.3, HEAD.z + 0.2)
      light.intensity = L * 6
    })
  })

  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, toon('#2A2238'), COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.12, POLE_H, 0.12]} />
      </instancedMesh>
      <instancedMesh ref={arms} args={[undefined, toon('#2A2238'), COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.08, 0.08, ARM]} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, toon('#3A3048'), COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.32, 0.14, 0.42]} />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[undefined, mats.bulb, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.24, 0.05, 0.3]} />
      </instancedMesh>
      <instancedMesh ref={halos} args={[undefined, mats.halo, COUNT]} frustumCulled={false} layers={LAYER_FX}>
        <planeGeometry args={[1.5, 1.5]} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[undefined, mats.pool, COUNT]} frustumCulled={false} layers={LAYER_FX}>
        <planeGeometry args={[3.4, 2.6]} />
      </instancedMesh>
      {Array.from({ length: NEAR_LIGHTS }, (_, k) => (
        <pointLight
          key={k}
          ref={(l) => {
            lights.current[k] = l
            l?.layers.enableAll()
          }}
          color="#FFC56B"
          distance={9}
          decay={1.4}
          intensity={0}
        />
      ))}
    </group>
  )
}
