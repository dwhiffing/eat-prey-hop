import { useCallback } from 'react'
import { useKeyboard } from '../hooks/useKeyboard'
import { state } from '../utils/state'
import { useSnapshot } from 'valtio'

export function Menu() {
  const snap = useSnapshot(state)
  useKeyboard(
    useCallback((event: KeyboardEvent) => {
      if (event.key === 'Enter') state.gameOver = false
    }, []),
  )

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      <p className="text-white text-2xl font-bold">Eat, Prey, Hop</p>
      {snap.highScore > 0 && (
        <p className="text-white italic">High Score: {snap.highScore}</p>
      )}
      <button
        className="bg-white rounded-xl px-4 py-2 cursor-pointer"
        onClick={() => {
          state.gameOver = false
        }}
      >
        Click to Start
      </button>
    </div>
  )
}
