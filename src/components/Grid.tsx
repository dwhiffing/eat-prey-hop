import { motion } from 'motion/react'
import { AnimatePresence } from 'motion/react'
import React, { useMemo } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { state } from '../utils/state'
import { Animal, IdAnimal } from './Animal'
import { useSnapshot } from 'valtio'

export const Grid: React.FC<{
  gridSize: number
  maxWidth: number
}> = ({ gridSize, maxWidth }) => {
  const entities = useSnapshot(state.entities)
  const { lastScore: lastScoreString } = useSnapshot(state)

  const [setRef, size] = useElementSize()
  const cellSize = size.width / gridSize
  const gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`
  const cells = useMemo(() => [...Array(gridSize * gridSize)], [gridSize])
  const renderedEntities = useMemo(
    () => (cellSize > 0 ? Object.keys(entities) : []),
    [cellSize, entities],
  )
  const lastScore = +lastScoreString.split('-')[0]

  return (
    <div
      ref={setRef}
      className="relative grid w-full gap-[4px] overflow-hidden"
      style={{ gridTemplateColumns, maxWidth }}
    >
      {cells.map((_, i) => (
        <div key={i} className="aspect-square bg-green-500 rounded-lg" />
      ))}
      <AnimatePresence>
        {state.nextSpawn && state.spawnTimer <= 5 && (
          <Animal
            size={cellSize}
            opacity={0.5}
            timer={state.spawnTimer}
            entity={{
              type: state.nextSpawn.key,
              ...state.nextSpawn.coords,
              id: '',
            }}
          />
        )}
        {renderedEntities.map((entityId) => (
          <IdAnimal
            key={entityId}
            size={cellSize}
            entityId={entityId}
            opacity={1}
          />
        ))}
      </AnimatePresence>
      <div className="absolute inset-0 flex justify-center items-center z-30">
        {lastScore > 0 && (
          <motion.div
            key={lastScoreString}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <p
              className="text-white font-extrabold text-3xl"
              style={{
                textShadow:
                  '2px 2px 0 #000, -2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000',
              }}
            >
              +{lastScore}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
