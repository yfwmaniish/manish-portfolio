import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Mesh, ShaderMaterial } from 'three'
import { ss, sunX } from '../lib/time'
import { mixTime, skyBand } from '../lib/palette'
import { frame } from './frame'
import { CAM_Z } from './FrameDriver'

export const SEA_Y = -1.0
const SEA_NEAR_Z = -1.9
const SEA_FAR_Z = -310
// Sun and moon sit on the sky plane; their reflections line up with them on screen.
const SKY_DIST = CAM_Z + 320

const fragmentShader = /* glsl */ `
  uniform vec3 uSea;
  uniform vec3 uHorizon;
  uniform float uTime;
  uniform float uCamX;
  uniform float uSunX;
  uniform float uMoonX;
  uniform float uSunRefl;
  uniform float uMoonRefl;
  varying vec3 vWorld;

  vec3 L(vec3 c) { return pow(c, vec3(2.2)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    float d = ${CAM_Z.toFixed(1)} - vWorld.z;
    float ang = (vWorld.x - uCamX) / d;
    // swell: long horizontal streaks, squashed with distance
    vec2 wp = vec2(vWorld.x * 0.35, vWorld.z * 1.6) + vec2(uTime * 0.15, uTime * 0.5);
    float n = noise(wp) * 0.7 + noise(wp * 2.3) * 0.3;
    vec3 col = uSea * (0.85 + 0.3 * step(0.62, n));

    // glitter columns under the sun and moon
    float sunCol = 1.0 - smoothstep(0.025, 0.07, abs(ang - uSunX));
    float moonCol = 1.0 - smoothstep(0.012, 0.035, abs(ang - uMoonX));
    float glint = step(0.66, n);
    col = mix(col, L(vec3(1.0, 0.72, 0.42)), glint * sunCol * uSunRefl);
    col = mix(col, L(vec3(0.96, 0.92, 0.82)), glint * moonCol * uMoonRefl * 0.8);

    // fade into the horizon band
    col = mix(col, uHorizon, smoothstep(30.0, 300.0, d) * 0.85);
    gl_FragColor = vec4(col, 1.0);
  }
`

export function Sea() {
  const mesh = useRef<Mesh>(null)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSea: { value: new Color() },
          uHorizon: { value: new Color() },
          uTime: { value: 0 },
          uCamX: { value: 0 },
          uSunX: { value: 52 / SKY_DIST },
          uMoonX: { value: -70 / SKY_DIST },
          uSunRefl: { value: 1 },
          uMoonRefl: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader,
      }),
    [],
  )

  useFrame(() => {
    const { tod, camX, time } = frame
    const u = material.uniforms
    // Prototype sea: #1B2550 → #060A1C (night × 0.8) → #3B4C7E at dawn.
    mixTime(u.uSea.value, '#1B2550', '#060A1C', '#3B4C7E', { ...tod, night: tod.night * 0.8 })
    skyBand(u.uHorizon.value, 8, tod)
    u.uTime.value = time
    u.uCamX.value = camX
    u.uSunRefl.value = 1 - ss(0.12, 0.3, tod.p) + 0.8 * tod.dawn
    u.uMoonRefl.value = tod.night * (1 - ss(0.8, 0.95, tod.p))
    u.uSunX.value = sunX(tod) / SKY_DIST
    if (mesh.current) mesh.current.position.x = camX
  })

  const depth = SEA_NEAR_Z - SEA_FAR_Z
  return (
    <mesh
      ref={mesh}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[0, SEA_Y, (SEA_NEAR_Z + SEA_FAR_Z) / 2]}
    >
      <planeGeometry args={[900, depth]} />
    </mesh>
  )
}
