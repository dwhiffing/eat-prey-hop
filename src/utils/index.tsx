import { ENTITY_TYPES, gridSize } from '../constants'
import { Coord } from '../types'
import { state } from './state'

const overlap = (a: Coord, b: Coord) => a.x === b.x && a.y === b.y

const moveEntity = (id: string, x: number, y: number) => {
  const entity = state.entities[id]
  if (!entity) return

  entity.x = Math.min(gridSize - 1, Math.max(0, entity.x + x))
  entity.y = Math.min(gridSize - 1, Math.max(0, entity.y + y))
}

export const movePlayer = (dx: number, y: number) => {
  if (!state.entities.rabbit) return

  moveEntity('rabbit', dx, y)
  moveEnemies()
}

const moveEnemies = () => {
  const enemies = Object.values(state.entities).filter((e) => {
    const entityType = ENTITY_TYPES[e.type]
    return entityType.isDynamic && !entityType.isPlayer
  })

  enemies.forEach((enemy) => moveEnemy(enemy.id))
}

const moveEnemy = (id: string) => {
  const enemy = state.entities[id]
  const rabbit = state.entities.rabbit
  const entityType = ENTITY_TYPES[enemy.type]
  enemy.pace = enemy.pace ?? 0
  enemy.pace++
  if (enemy.pace === entityType.speed) {
    enemy.pace = 0
    if (!overlap(enemy, rabbit)) {
      const dir = getMoveDirection(enemy, rabbit, [])
      if (dir?.change) moveEntity(id, dir.change.x, dir.change.y)
    }
  }

  if (overlap(enemy, rabbit)) {
    setTimeout(() => {
      delete state.entities.rabbit
    }, 100)
  }
}

const getMoveDirection = (
  current: Coord,
  target: Coord,
  unpassable: string[],
  allowDiagonals = true,
) => {
  const coordToKey = (coord: Coord) => `${coord.x},${coord.y}`

  const options: { change: Coord; coord: Coord }[] = [
    { change: { x: 1, y: 0 }, coord: { x: current.x + 1, y: current.y } },
    { change: { x: -1, y: 0 }, coord: { x: current.x - 1, y: current.y } },
    { change: { x: 0, y: 1 }, coord: { x: current.x, y: current.y + 1 } },
    { change: { x: 0, y: -1 }, coord: { x: current.x, y: current.y - 1 } },
  ]

  if (allowDiagonals) {
    options.push(
      {
        change: { x: 1, y: 1 },
        coord: { x: current.x + 1, y: current.y + 1 },
      },
      {
        change: { x: 1, y: -1 },
        coord: { x: current.x + 1, y: current.y - 1 },
      },
      {
        change: { x: -1, y: 1 },
        coord: { x: current.x - 1, y: current.y + 1 },
      },
      {
        change: { x: -1, y: -1 },
        coord: { x: current.x - 1, y: current.y - 1 },
      },
    )
  }

  options.sort(
    (a, b) =>
      Math.abs(a.coord.x - target.x) +
      Math.abs(a.coord.y - target.y) -
      (Math.abs(b.coord.x - target.x) + Math.abs(b.coord.y - target.y)),
  )

  for (const option of options) {
    if (!unpassable.includes(coordToKey(option.coord))) {
      return option
    }
  }

  return null
}
