import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { gridSize, maxWidth } from '../constants'
import { Grid } from './Grid'
import { state } from '../utils/state'
import { getScoreMulti, movePlayer } from '../utils'

function App() {
  const snap = useSnapshot(state)

  useEffect(() => {
    const func = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === 'ArrowRight') movePlayer(1, 0)
      if (event.key === 'ArrowLeft') movePlayer(-1, 0)
      if (event.key === 'ArrowUp') movePlayer(0, -1)
      if (event.key === 'ArrowDown') movePlayer(0, 1)
      if (event.key === ' ') movePlayer(0, 0)
    }

    document.addEventListener('keydown', func)
    return () => document.removeEventListener('keydown', func)
  }, [])

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full h-full">
      <Grid gridSize={gridSize} maxWidth={maxWidth} entities={snap.entities} />
      <p className="text-white">Score: {snap.score}</p>
      <p className="text-white">Multi: {getScoreMulti()}</p>
      <p className="text-white">Spawn: {snap.spawnTimer}</p>
    </div>
  )
}

export default App
