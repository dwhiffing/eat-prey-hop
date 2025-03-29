import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { Entity } from '../types'
import { strings } from '../constants'

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
      className="relative grid w-full gap-[1px]"
      style={{ gridTemplateColumns, maxWidth }}
    >
      {cells.map((_, i) => (
        <div key={i} className="aspect-square bg-green-500" />
      ))}

      {Object.values(entities).map((entity) => (
        <motion.div
          key={entity.id}
          className="absolute flex justify-center items-center"
          style={{
            width: cellSize,
            height: cellSize,
            fontSize: cellSize * 0.8,
          }}
          animate={{ x: entity.x * cellSize, y: entity.y * cellSize }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        >
          {strings[entity.index]}
        </motion.div>
      ))}
    </div>
  )
}
