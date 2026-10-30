import { Component, type ReactNode } from 'react'
import { PlainPage } from './PlainPage'

/** Can this browser draw the 3D world at all? */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** If anything in the game throws, show the plain page instead of a blank screen. */
export class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('The 3D version failed; showing the plain page.', error)
  }

  render() {
    if (this.state.failed) return <PlainPage reason="The 3D version couldn't start on this device, so here is the plain version." />
    return this.props.children
  }
}
