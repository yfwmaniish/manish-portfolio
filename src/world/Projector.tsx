import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { anchors, elements } from '../engine/anchors'

const v = new Vector3()

/** Inside the Canvas: projects every anchored label onto the screen. */
export function Projector() {
  useFrame(({ camera, size }) => {
    for (const [id, el] of elements) {
      const p = anchors.get(id)?.()
      if (!p) {
        el.style.visibility = 'hidden'
        continue
      }
      v.copy(p).project(camera)
      if (v.z > 1 || v.z < -1) {
        el.style.visibility = 'hidden'
        continue
      }
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`
      el.style.visibility = 'visible'
    }
  })
  return null
}
