import { useLayoutEffect, useMemo, useRef } from 'react'
import { ConeGeometry, InstancedMesh, Object3D, Quaternion, Vector3 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { toon } from './materials'
import { SEA_Y } from './Sea'

// Four stubby legs pointing to the corners of a tetrahedron.
function tetrapodGeometry() {
  const dirs = [
    new Vector3(1, 1, 1),
    new Vector3(-1, -1, 1),
    new Vector3(-1, 1, -1),
    new Vector3(1, -1, -1),
  ]
  const up = new Vector3(0, 1, 0)
  const legs = dirs.map((d) => {
    const g = new ConeGeometry(0.22, 0.75, 5)
    g.translate(0, 0.375, 0)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(up, d.normalize()))
    return g
  })
  return mergeGeometries(legs)!
}

const X0 = -60
const X1 = 320

export function Tetrapods() {
  const ref = useRef<InstancedMesh>(null)
  const geometry = useMemo(tetrapodGeometry, [])
  const count = Math.floor((X1 - X0) / 0.9)

  useLayoutEffect(() => {
    const o = new Object3D()
    let seed = 11
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < count; i++) {
      o.position.set(X0 + i * 0.9 + r() * 0.5, SEA_Y + 0.15 + r() * 0.5, -2.5 - r() * 2.2)
      o.rotation.set(r() * 6.28, r() * 6.28, r() * 6.28)
      o.updateMatrix()
      ref.current!.setMatrixAt(i, o.matrix)
    }
    ref.current!.instanceMatrix.needsUpdate = true
  }, [count])

  return <instancedMesh ref={ref} args={[geometry, toon('#5A4D6E'), count]} frustumCulled={false} />
}
