import { AnimatePresence } from 'motion/react'
import React, { useMemo } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { Entity } from '../types'
import { state } from '../utils/state'
import { Animal, IdAnimal } from './Animal'

export const Grid: React.FC<{
  gridSize: number
  maxWidth: number
  entities: Record<string, Entity>
}> = ({ gridSize, maxWidth, entities }) => {
  const [setRef, size] = useElementSize()
  const cellSize = size.width / gridSize
  const gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`
  const cells = useMemo(() => [...Array(gridSize * gridSize)], [gridSize])
  const renderedEntities = useMemo(
    () => (cellSize > 0 ? Object.keys(entities) : []),
    [cellSize, entities],
  )

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
        {state.nextSpawn && state.spawnTimer <= 3 && (
          <Animal
            size={cellSize}
            opacity={0.5}
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
    </div>
  )
}
