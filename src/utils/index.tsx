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

const coordToKey = (coord: Partial<Coord>) => `${coord.x},${coord.y}`
const getMoveDirection = (src: Entity, dest: Entity, allowDiagonals = true) => {
  if (!src || !dest) return { x: 0, y: 0 }

  let options: { change: Coord; coord: Coord }[] = [
    { change: { x: 1, y: 0 }, coord: { x: src.x + 1, y: src.y } },
    { change: { x: -1, y: 0 }, coord: { x: src.x - 1, y: src.y } },
    { change: { x: 0, y: 1 }, coord: { x: src.x, y: src.y + 1 } },
    { change: { x: 0, y: -1 }, coord: { x: src.x, y: src.y - 1 } },
  ]

  if (allowDiagonals) {
    options.push(
      { change: { x: 1, y: 1 }, coord: { x: src.x + 1, y: src.y + 1 } },
      { change: { x: 1, y: -1 }, coord: { x: src.x + 1, y: src.y - 1 } },
      { change: { x: -1, y: 1 }, coord: { x: src.x - 1, y: src.y + 1 } },
      { change: { x: -1, y: -1 }, coord: { x: src.x - 1, y: src.y - 1 } },
    )
  }

  const unpassable = Object.values(state.entities)
    .filter((e) => !ENTITY_TYPES[src.type].targets?.includes(e.type))
    .map(coordToKey)
  options = options
    .filter((o) => !unpassable.includes(coordToKey(o.coord)))
    .sort(
      (a, b) =>
        Math.abs(a.coord.x - dest.x) +
        Math.abs(a.coord.y - dest.y) -
        (Math.abs(b.coord.x - dest.x) + Math.abs(b.coord.y - dest.y)),
    )

  return options[0].change
}
