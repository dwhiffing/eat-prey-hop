import { motion } from 'motion/react'
import React, { memo, useEffect, useState } from 'react'
import { Entity } from '../types'
import { DEBUG, ENTITY_TYPES } from '../constants'
import { state } from '../utils/state'
import { subscribe } from 'valtio'

export const IdAnimal = memo(
  (props: { size: number; entityId: string; opacity: number }) => {
    const entity = state.entities[props.entityId]
    const [, setDate] = useState(0)

    useEffect(
      () =>
        subscribe(state.entities[props.entityId], () => setDate(Date.now())),
      [props.entityId],
    )

    return (
      entity && (
        <Animal size={props.size} entity={entity} opacity={props.opacity} />
      )
    )
  },
)

export const Animal = (props: {
  size: number
  entity: Entity
  opacity: number
  timer?: number
}) => {
  const { image, maxFood } = ENTITY_TYPES[props.entity.type]
  const x = props.entity.x * props.size
  const y = props.entity.y * props.size
  const opacity = props.opacity
  const startOpacity = opacity !== 0.5 ? 0.5 : 0
  const eatPercent = (props.entity.food ?? 0) / (maxFood ?? 1)
  console.log({ timer: props.timer })

  return (
    <>
      <motion.div
        className="absolute flex justify-center items-center z-10"
        style={{ width: props.size, height: props.size }}
        exit={{ opacity: 0 }}
        animate={{ x, y, opacity: 1 }}
        initial={{ x, y, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <motion.img
          src={`${image}.png`}
          style={{ width: props.size * 0.75 }}
          animate={{ opacity }}
          initial={{ opacity: startOpacity }}
        />
        {opacity === 1 && DEBUG && (
          <AnimalRadii entity={props.entity} size={props.size} />
        )}
        {props.timer && (
          <div className="absolute text-white font-bold text-xl">
            <p>{props.timer}</p>
          </div>
        )}
        {['wolf', 'lion', 'bear'].includes(props.entity.type) && (
          <div className="absolute inset-x-[4%] bottom-[4%] h-[8%]">
            <div className="absolute w-full h-full bg-[#fff5]" />
            <div
              className="absolute h-full bg-white"
              style={{ width: `${eatPercent * 100}%` }}
            />
          </div>
        )}
      </motion.div>
      <AnimalArrows entity={props.entity} size={props.size} />
    </>
  )
}

const AnimalRadii = ({
  size: cellSize,
  entity,
}: {
  size: number
  entity: Entity
}) => {
  const { isDynamic, isPlayer, inactiveSightRange, activeSightRange } =
    ENTITY_TYPES[entity.type]
  const target = state.entities[entity.activeTargetId ?? '']
  const inactiveSight = (inactiveSightRange ?? 0) * 2 + 1
  const activeSight = (activeSightRange ?? 0) * 2 + 1

  if (!isDynamic || isPlayer) return

  return (
    <>
      {target && target.id === 'rabbit' && (
        <Radius className="border-red-500" size={cellSize * activeSight} />
      )}

      {!target && (
        <Radius className="border-yellow-500" size={cellSize * inactiveSight} />
      )}
    </>
  )
}

export const AnimalArrows = ({
  size: cellSize,
  entity,
}: {
  size: number
  entity: Entity
}) => {
  const { speed, isDynamic, isPlayer } = ENTITY_TYPES[entity.type]
  const target = state.entities[entity.activeTargetId ?? '']

  if (!isDynamic || isPlayer) return

  return (
    <div className="absolute inset-0 z-0">
      {target && DEBUG && (
        <Arrow start={entity} end={target} cellSize={cellSize} color="red" />
      )}
      {entity.nextMove && (
        <Arrow
          start={entity}
          cellSize={cellSize}
          end={{
            x: entity.x + entity.nextMove.x,
            y: entity.y + entity.nextMove.y,
          }}
          color={entity.pace === (speed ?? 0) - 1 ? 'white' : '#ffffff44'}
        />
      )}
    </div>
  )
}

const Radius = (props: { size: number; className: string }) => (
  <div
    className={`border-3 absolute rounded-xl opacity-50 ${props.className}`}
    style={{
      width: props.size,
      height: props.size,
    }}
  />
)

const Arrow: React.FC<{
  start: { x: number; y: number }
  end: { x: number; y: number }
  cellSize: number
  color: string
}> = ({ start, end, cellSize, color }) => {
  const startX = start.x * cellSize + cellSize / 2
  const startY = start.y * cellSize + cellSize / 2
  const endX = end.x * cellSize + cellSize / 2
  const endY = end.y * cellSize + cellSize / 2

  const dx = endX - startX
  const dy = endY - startY
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const distance = Math.sqrt(dx * dx + dy * dy)
  const size = 15

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        overflow: 'visible',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0% 50%',
      }}
      width={distance}
      height="10"
      viewBox={`0 -5 ${distance} 10`}
    >
      <line
        x1="0"
        y1="0"
        x2={distance - size}
        y2="0"
        stroke={color}
        strokeWidth="2"
      />
      <polygon
        points={`${distance - size},-${size / 2} ${distance},0 ${
          distance - size
        },${size / 2}`}
        fill={color}
      />
    </svg>
  )
}
