import { ENTITY_TYPES, gridSize } from '../constants'
import { Coord, Entity } from '../types'
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
  const { targets, speed } = ENTITY_TYPES[enemy.type]

  if (!targets) return

  const target = Object.values(state.entities)
    .filter((e) => targets.includes(e.type))
    .sort((a, b) => targets.indexOf(a.type) - targets.indexOf(b.type))[0]

  if (!target) return

  enemy.pace = enemy.pace ?? 0
  enemy.pace++
  if (enemy.pace === speed) {
    enemy.pace = 0
    if (!overlap(enemy, target)) {
      const dir = getMoveDirection(enemy, target)
      if (dir) moveEntity(id, dir.x, dir.y)
    }
  }

  if (overlap(enemy, target)) {
    setTimeout(() => {
      delete state.entities[target.id]
    }, 100)
  }
}

const getMoveDirection = (
  current: Entity,
  target: Entity,
  allowDiagonals = true,
) => {
  if (!current || !target) return { x: 0, y: 0 }
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

  const unpassable = Object.values(state.entities)
    .filter((e) => {
      const t = ENTITY_TYPES[current.type]
      return !t.targets?.includes(e.type)
    })
    .map((e) => coordToKey({ x: e.x, y: e.y }))
  for (const option of options) {
    if (!unpassable.includes(coordToKey(option.coord))) {
      return option.change
    }
  }

  return null
}
