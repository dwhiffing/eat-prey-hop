import {
  ENTITY_TYPES,
  INITIAL_STATE,
  initialGridSize,
  SAVE_KEY,
  SCORE_FOR_GRID_SIZE_INCREASE,
} from '../constants'
import { Coord, Entity, EntityTypeKey } from '../types'
import { state } from './state'

const overlap = (a: Coord, b: Coord) => a.x === b.x && a.y === b.y

const getPassable = (a: Entity, b: Entity) => {
  const { targets, passable } = ENTITY_TYPES[a.type]
  return targets?.includes(b.type) || passable?.includes(b.type)
}

const moveEntity = (id: string, x: number, y: number) => {
  const entity = state.entities[id]
  if (!entity) return

  const newX = Math.min(state.gridSize - 1, Math.max(0, entity.x + x))
  const newY = Math.min(state.gridSize - 1, Math.max(0, entity.y + y))
  const dest = Object.values(state.entities).find((e) =>
    overlap({ x: newX, y: newY }, e),
  )
  if (dest && !getPassable(entity, dest)) return
  entity.x = newX
  entity.y = newY
}

export const getScoreMulti = () => {
  const bears = getEntitiesByType('bear').length * 16
  const lions = getEntitiesByType('lion').length * 8
  const wolves = getEntitiesByType('wolf').length * 4
  const foxes = Math.max(getEntitiesByType('fox').length * 2, 1)
  return bears + lions + wolves + foxes
}

let _id = 0
const spawnEntity = (type: EntityTypeKey, position: Coord) => {
  state.entities[`${type}-${_id}`] = {
    x: position.x,
    y: position.y,
    id: `${type}-${_id}`,
    type: type,
  }
  _id++
}

const spawnEnemy = (key: EntityTypeKey) => {
  if (state.nextSpawn) spawnEntity(key, state.nextSpawn.coords)
}

const removeEntity = (entity: Entity) => {
  delete state.entities[entity.id]
  if (entity.id === 'rabbit') {
    setTimeout(() => {
      const { score, highScore } = state
      const cloned = JSON.parse(JSON.stringify(INITIAL_STATE))
      Object.assign(state, JSON.parse(JSON.stringify(INITIAL_STATE)))
      state.nextSpawn = undefined
      state.spawnPool = cloned.spawnPool
      state.highScore = highScore
      if (score > highScore) {
        localStorage.setItem(SAVE_KEY, `${state.highScore}`)
      }
    }, 1000)
  }
}

const getEntitiesByType = (type: EntityTypeKey) =>
  Object.values(state.entities).filter((s) => s.type === type)
const getEntityByType = (type: EntityTypeKey) => getEntitiesByType(type)[0]

export const movePlayer = (dx: number, y: number) => {
  if (!state.entities.rabbit) return

  moveEntity('rabbit', dx, y)
  const carrot = getEntityByType('carrot')
  if (carrot) {
    if (overlap(state.entities.rabbit, carrot)) {
      state.score += 10 * getScoreMulti()
      const m = 1 + (state.gridSize - initialGridSize)
      if (state.score >= m * SCORE_FOR_GRID_SIZE_INCREASE) {
        state.gridSize = initialGridSize + m
      }
      removeEntity(carrot)
    }
  } else {
    const blacklist = Object.values(state.entities).map(coordToKey)
    if (state.nextSpawn) blacklist.push(coordToKey(state.nextSpawn.coords))
    spawnEntity('carrot', getRandomPosition(state.gridSize, blacklist))
  }

  moveEnemies()

  state.spawnTimer--

  if (!state.nextSpawn) {
    const nearRabbit = getCoordsInDistance(state.entities.rabbit, 2)
    const blacklist = [state.entities.carrot, ...nearRabbit]
      .filter(Boolean)
      .map(coordToKey)
    state.nextSpawn = {
      key: state.spawnPool.shift()!,
      coords: getRandomPosition(state.gridSize, blacklist),
    }
  }
  if (state.spawnPool.length === 0) {
    state.spawnPool = ['fox', 'fox']
  }
  if (state.spawnTimer === 0) {
    state.spawnTimer = 10 + 5 * getScoreMulti()
    spawnEnemy(state.nextSpawn.key)
    state.nextSpawn = undefined
  }
}

const getRandomPosition = (gridSize: number, blacklist: string[]): Coord => {
  let x, y, key
  do {
    x = Math.floor(Math.random() * gridSize)
    y = Math.floor(Math.random() * gridSize)
    key = `${x},${y}`
  } while (blacklist.includes(key))
  return { x, y }
}

function getCoordsInDistance(center: Coord, distance: number): Coord[] {
  const coords: Coord[] = []

  for (let dx = -distance; dx <= distance; dx++) {
    for (let dy = -distance; dy <= distance; dy++) {
      coords.push({ x: center.x + dx, y: center.y + dy })
    }
  }

  return coords
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
  const { targets, speed, activeSightRange, inactiveSightRange } =
    ENTITY_TYPES[enemy.type]

  if (!targets) return

  const activeCoords = getCoordsInDistance(enemy, activeSightRange ?? 0).map(
    coordToKey,
  )
  const inactiveCoords = getCoordsInDistance(
    enemy,
    inactiveSightRange ?? 0,
  ).map(coordToKey)

  enemy.pace = enemy.pace ?? 0
  enemy.pace++

  const possibleTargets = Object.values(state.entities)
    .filter(
      (e) => targets.includes(e.type) && inactiveCoords.includes(coordToKey(e)),
    )
    .sort((a, b) => targets.indexOf(a.type) - targets.indexOf(b.type))

  const activeTarget = state.entities[enemy.activeTargetId ?? '']
  if (
    !activeTarget ||
    (possibleTargets[0] &&
      targets.indexOf(possibleTargets[0].type) <
        targets.indexOf(activeTarget.type))
  ) {
    const target = possibleTargets[0]
    if (target) enemy.activeTargetId = target.id
  }

  if (!enemy.activeTargetId) return

  const target = state.entities[enemy.activeTargetId]
  if (!target || !activeCoords.includes(coordToKey(target))) {
    enemy.activeTargetId = undefined
    enemy.nextMove = undefined
    return
  }

  if (enemy.pace >= (speed ?? 0)) {
    if (enemy.nextMove) moveEntity(id, enemy.nextMove.x, enemy.nextMove.y)
    enemy.nextMove = undefined
    enemy.pace = 0
  }

  if (!overlap(enemy, target)) {
    enemy.nextMove = getMoveDirection(enemy, target)
  }

  if (overlap(enemy, target)) {
    setTimeout(() => removeEntity(target), 100)
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
    .filter((e) => !getPassable(src, e))
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

// function getCoordsInRadius(center: Coord, radius: number): Coord[] {
//   const coords: Coord[] = []

//   for (let dx = -radius; dx <= radius; dx++) {
//     for (let dy = -radius; dy <= radius; dy++) {
//       if (dx * dx + dy * dy <= radius * radius) {
//         coords.push({ x: center.x + dx, y: center.y + dy })
//       }
//     }
//   }

//   return coords
// }
