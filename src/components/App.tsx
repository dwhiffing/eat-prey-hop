import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { gridSize, maxWidth } from '../constants'
import { Grid } from './Grid'
import { state } from '../utils/state'
import { moveEntity } from '../utils'

function App() {
  const snap = useSnapshot(state)

  useEffect(() => {
    const func = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === 'ArrowRight') moveEntity('rabbit', 1, 0)
      if (event.key === 'ArrowLeft') moveEntity('rabbit', -1, 0)
      if (event.key === 'ArrowUp') moveEntity('rabbit', 0, -1)
      if (event.key === 'ArrowDown') moveEntity('rabbit', 0, 1)
    }

    document.addEventListener('keydown', func)
    return () => document.removeEventListener('keydown', func)
  }, [])

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Grid gridSize={gridSize} maxWidth={maxWidth} entities={snap.entities} />
    </div>
  )
}

export default App
