import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { AmbientLight, DirectionalLight, Light } from 'three'
import { mixTime } from '../lib/palette'
import { frame } from './frame'

// Lights must reach every render layer, not just the default one.
const allLayers = (l: Light | null) => l?.layers.enableAll()

/**
 * Sun low behind the sea (rim light on everything facing us), moon later,
 * and a fill tinted by the sky so shadows stay purple, never black.
 */
export function Lighting() {
  const fill = useRef<AmbientLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const moon = useRef<DirectionalLight>(null)

  useFrame(() => {
    const { tod, camX } = frame
    if (fill.current) {
      mixTime(fill.current.color, '#B07A9A', '#2A2A5A', '#9AA0C8', tod)
      fill.current.intensity = 1.6 - tod.night * 0.6 - tod.rain * 0.4
    }
    if (sun.current) {
      sun.current.position.set(camX + 30, 6, -40)
      sun.current.target.position.set(camX, 0, 0)
      sun.current.target.updateMatrixWorld()
      mixTime(sun.current.color, '#FFB067', '#FFB067', '#FFD6A0', tod)
      sun.current.intensity = Math.max(0, 1 - tod.night * 1.4) * 2.2 + tod.dawn * 1.2
    }
    if (moon.current) {
      moon.current.position.set(camX - 40, 30, -30)
      moon.current.target.position.set(camX, 0, 0)
      moon.current.target.updateMatrixWorld()
      moon.current.intensity = tod.night * 0.9
    }
  })

  return (
    <>
      <ambientLight ref={(l) => { fill.current = l; allLayers(l) }} />
      <directionalLight ref={(l) => { sun.current = l; allLayers(l) }} />
      <directionalLight ref={(l) => { moon.current = l; allLayers(l) }} color="#8FA0D8" />
      {/* a weak front fill so faces toward the camera still read */}
      <directionalLight ref={allLayers} position={[0, 4, 20]} intensity={0.35} color="#C9B8D6" />
    </>
  )
}
