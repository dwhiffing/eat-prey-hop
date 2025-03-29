import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { Entity } from '../types'

export const Grid: React.FC<{
  gridSize: number
  maxWidth: number
  entities: Record<string, Entity>
}> = ({ gridSize, maxWidth, entities }) => {
  const [setRef, size] = useElementSize()
  const cellSize = size.width / gridSize
  const gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`
  const cells = useMemo(() => [...Array(gridSize * gridSize)], [gridSize])

  return (
    <div
      ref={setRef}
      className="relative grid w-full gap-[4px]"
      style={{ gridTemplateColumns, maxWidth }}
    >
      {cells.map((_, i) => (
        <div key={i} className="aspect-square bg-green-500 rounded-lg" />
      ))}

      {cellSize > 0 &&
        Object.values(entities).map((entity) => (
          <motion.div
            key={entity.id}
            initial={false}
            className="absolute flex justify-center items-center"
            style={{ width: cellSize, height: cellSize }}
            animate={{ x: entity.x * cellSize, y: entity.y * cellSize }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            <img
              src={`/${entity.image}.png`}
              style={{ width: cellSize * 0.8 }}
            />
          </motion.div>
        ))}
    </div>
  )
}
