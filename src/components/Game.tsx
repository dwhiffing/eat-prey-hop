import { useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { maxWidth } from '../constants'
import { useKeyboard } from '../hooks/useKeyboard'
import { movePlayer, getScoreMulti } from '../utils'
import { state } from '../utils/state'
import { Grid } from './Grid'

export function Game() {
  // eslint-disable-next-line
  const { gridSize, score, entities } = useSnapshot(state)

  useKeyboard(
    useCallback((event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      if (event.key === 'ArrowRight') movePlayer(1, 0)
      if (event.key === 'ArrowLeft') movePlayer(-1, 0)
      if (event.key === 'ArrowUp') movePlayer(0, -1)
      if (event.key === 'ArrowDown') movePlayer(0, 1)
    }, []),
  )

  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full h-full px-8">
      <Grid gridSize={gridSize} maxWidth={maxWidth} />
      <div className="flex flex-row gap-5">
        <p className="text-white">Score: {score}</p>
        <p className="text-white">Multi: {getScoreMulti()}</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MoveButton label="^" onClick={() => movePlayer(0, -1)} />
        <div className="flex gap-1">
          <MoveButton label="<" onClick={() => movePlayer(-1, 0)} />
          <MoveButton label="v" onClick={() => movePlayer(0, 1)} />
          <MoveButton label=">" onClick={() => movePlayer(1, 0)} />
        </div>
      </div>
    </div>
  )
}

const MoveButton = (props: { onClick: () => void; label: string }) => (
  <button
    className="bg-[#fff5] text-black aspect-square w-12"
    onClick={props.onClick}
  >
    {props.label}
  </button>
)
