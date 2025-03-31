import { useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { maxWidth } from '../constants'
import { useKeyboard } from '../hooks/useKeyboard'
import { movePlayer, getScoreMulti } from '../utils'
import { state } from '../utils/state'
import { Grid } from './Grid'

export function Game() {
  const { gridSize, score, spawnTimer } = useSnapshot(state)

  useKeyboard(
    useCallback((event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === 'ArrowRight') movePlayer(1, 0)
      if (event.key === 'ArrowLeft') movePlayer(-1, 0)
      if (event.key === 'ArrowUp') movePlayer(0, -1)
      if (event.key === 'ArrowDown') movePlayer(0, 1)
      if (event.key === ' ') movePlayer(0, 0)
    }, []),
  )

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full h-full px-8">
      <Grid gridSize={gridSize} maxWidth={maxWidth} />
      <div className="flex flex-row gap-5">
        <p className="text-white">Score: {score}</p>
        <p className="text-white">Multi: {getScoreMulti()}</p>
        <p className="text-white">Spawn: {spawnTimer}</p>
      </div>
    </div>
  )
}
